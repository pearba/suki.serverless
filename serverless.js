function selectHandler(mode)
{
	async function handler_mode_aws(event)
	{
		var response_data = await suki.sync(suki.serverless.handle)(convert_env(event))
		,	response, headers, multiValueHeaders, hv
		;
		if (response_data)
		{
			headers = { 'Content-Type': response_data.contentType };
			multiValueHeaders = {};
			for (let header in response_data.headers)
			{
				hv = response_data.headers[header];
				1===hv.length ? (headers[header] = hv[0]) : (multiValueHeaders[header] = hv);
			}
			response = {
				headers,
				multiValueHeaders,
				statusCode: response_data.statusCode,
				body: response_data.content,
			};
		}
		else
		{
			response = {
				statusCode: 500,
				body: 'Invalid request.',
			};
		}
		return response;
	}
	async function handler_mode_azure(context, req)
	{
		var response_data = await suki.sync(suki.serverless.handle)(convert_env(req))
		,	headers, hv, h
		;
		if (response_data)
		{
			headers = { 'Content-Type': response_data.contentType };
			for (let header in response_data.headers)
			{
				hv = response_data.headers[header];
				if (1 === hv.length)
				{
					headers[header] = hv[0];
				}
				else
				{
					h = header;
					for (let v of hv)
					{
						headers[h] = v;
						h += ' ';
					}
				}
			}
			context.res = {
				status: response_data.statusCode,
				body:  response_data.content,
				headers
			};
		}
		else
		{
			context.res = {
				status: 500,
				body:  'Invalid request.'
			};
		}
		return true;
	}
	async function handler_mode_gcp(req, res)
	{
		var response_data = await suki.sync(suki.serverless.handle)(convert_env(req))
		,	hv
		;
		if (response_data)
		{
			res.setHeader('Content-Type', response_data.contentType);
			for (let header in response_data.headers)
			{
				hv = response_data.headers[header];
				res.setHeader(header, 1===hv.length ? hv[0] : hv);
			}
			res.status(response_data.statusCode).send(response_data.content);
		}
		else
		{
			res.status(500).send('Invalid request.');
		}
		return true;
	}
	if ('aws' === mode)
	{
		return handler_mode_aws;
	}
	else if ('azure' === mode)
	{
		return handler_mode_azure;
	}
	else if ('gcp' === mode)
	{
		return handler_mode_gcp;
	}
}

function selectEnvConverter(mode)
{
	function combineURL(query)
	{
		var param = option.query_param_for_real_path, real_url;
		if (query && path_validation.test(real_url=query[param]||''))
		{
			let querystring = '?';
			for (let n in query)
			{
				switch (n)
				{
					case param:
						continue;
					default:
						querystring += n + '=' + query[n] + '&';
				}
			}
			1 !== querystring.length && (real_url += querystring.slice(0, -1));
		}
		return real_url;
	}
	function convert_serverless_env_mode_aws(evt)
	{
		var real_url = combineURL(evt.queryStringParameters);
		return {
			url: real_url || default_page,
			host: option.alias_header_for_real_host ? evt.headers[option.alias_header_for_real_host] : '*',
			method: evt.requestContext.http.method.toUpperCase(),
			headers: evt.headers,
			body: evt.body || null
		};
	}
	function convert_serverless_env_mode_azure(req)
	{
		var real_url = combineURL(req.query);
		return {
			url: real_url || default_page,
			host: option.alias_header_for_real_host ? req.headers[option.alias_header_for_real_host] : '*',
			method: req.method.toUpperCase(),
			headers: req.headers,
			body: req.body ? JSON.stringify(req.body) : null
		};
	}
	function convert_serverless_env_mode_gcp(req)
	{
		var real_url = combineURL(req.query);
		return {
			url: real_url || default_page,
			host: option.alias_header_for_real_host ? req.headers[option.alias_header_for_real_host] : '*',
			method: req.method.toUpperCase(),
			headers: req.headers,
			body: req.body ? JSON.stringify(req.body) : null
		};
	}
	var converter;
	if ('aws' === mode)
	{
		converter = convert_serverless_env_mode_aws;
	}
	else if ('azure' === mode)
	{
		converter = convert_serverless_env_mode_azure;
	}
	else if ('gcp' === mode)
	{
		converter = convert_serverless_env_mode_gcp;
	}
	return env => {
		try
		{
			return converter(env);
		}
		catch
		{
			return { url: default_error_page_platform_api_maybe_changed };
		}
	};
}

const valid_platform = {
	'gcp': true,
	'aws': true,
	'azure': true,
};
const path = require('path');
const default_page = '/index';
const default_error_page_platform_api_maybe_changed = '/error_platform_api_maybe_changed';
const www_default = path.resolve(__dirname, 'www_default');
const default_path_validation = /^\/[0-9a-zA-Z\-\.]*$/;

var path_validation = default_path_validation, option, convert_env, handler;

exports.setPathValidation = regex => { path_validation = regex };

exports.define = function (opt)
{
	if (valid_platform[opt.platform])
	{
		let webRoot = {'*': www_default};
		option = opt;
		//webRoot
		if (opt.web_root_for_suki_js)
		{
			for (let n in opt.web_root_for_suki_js)
			{
				webRoot[n] = opt.web_root_for_suki_js[n];
			}
		}
		//converter: map resources
		convert_env = selectEnvConverter(opt.platform);
		//converter
		handler = selectHandler(opt.platform);
		//init suki
		if ('undefined' === typeof suki)
		{
			let suki = require('@pearba/suki.js');
			opt.suki_id && (suki.id = opt.suki_id);
			suki.init(suki.serverless({ webRoot, hotCodeDelaySeconds: opt.delay_seconds_for_hot_code, aliasHostHeader: opt.alias_header_for_real_host }));
		}
	}
	else
	{
		console.error('suki.serverless define error: unsupported platform.');
	}
};

exports.getAsyncHandler = () => handler;