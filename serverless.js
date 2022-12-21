var option, convert_env, handler;

const valid_platform = {
	'gcp': true,
	'aws': true,
	'azure': true,
};

const path = require('path');
const default_page = '/index';
const default_error_page_platform_api_maybe_changed = '/error_platform_api_maybe_changed';
const www_default = path.resolve(__dirname, 'www_default');

exports.define = function (opt) {
	if (valid_platform[opt.platform]) {
		let webRoot = {'*': www_default};
		option = opt;
		//webRoot
		if (opt.web_root_for_suki_js) {
			for (let n in opt.web_root_for_suki_js) {
				webRoot[n] = opt.web_root_for_suki_js[n];
			}
		}
		//converter: map resources
		convert_env = selectEnvConverter(opt.platform);
		//converter
		handler = selectHandler(opt.platform);
		//init suki once
		if ('undefined' === typeof suki) {
			let suki = require('@pearba/suki.js');
			suki.init(suki.serverless({ webRoot, aliasHostHeader: opt.alias_header_for_real_host }));
		}
	} else {
		console.error('suki.serverless define error: unsupported platform.');
	}
};

exports.getHandler = () => handler;

function selectHandler(mode) {
	async function handler_mode_aws(event) {
		var response_data = await suki.sync(suki.serverless.handle)(convert_env(event))
		,	response
		;
		if (response_data) {
			response = {
				headers: { 'content-type': response_data.contentType },
				statusCode: response_data.statusCode,
				body: response_data.content,
			};
			if (response_data.cookies) {
				response.multiValueHeaders = {};
				response.multiValueHeaders['Set-Cookie'] = response_data.cookies.map(cookie => cookie.replace('Set-Cookie: ', '').slice(0, -1));
			}
		} else {
			response = {
				statusCode: 403,
				body: 'Invalid request.',
			};
		}
		return response;
	}
	async function handler_mode_azure() {

	}
	async function handler_mode_gcp(req, res) {
		var response_data = await suki.sync(suki.serverless.handle)(convert_env(req));
		if (response_data) {
			res.setHeader('Content-Type', response_data.contentType);
			response_data.cookies && res.setHeader('Set-Cookie', response_data.cookies.map(cookie => cookie.replace('Set-Cookie: ', '').slice(0, -1)));
			res.status(response_data.statusCode).send(response_data.content);
		} else {
			res.status(403).send('Invalid request.');
		}
		return true;
	}
	if ('aws' === mode) {
		return handler_mode_aws;
	} else if ('azure' === mode) {
		return handler_mode_azure;
	} else if ('gcp' === mode) {
		return handler_mode_gcp;
	}
}

function selectEnvConverter(mode) {
	function convert_serverless_env_mode_aws(evt) {
		return {
			real_url: evt.queryStringParameters && encodeURI(evt.queryStringParameters[option.real_url_param]) || default_page,
			method: evt.requestContext.http.method.toUpperCase(),
			headers: evt.headers,
			post_json: evt.body || ''
		};
	}
	function convert_serverless_env_mode_azure(foo) {
		return null;
	}
	function convert_serverless_env_mode_gcp(req) {
		return {
			real_url: req.query && encodeURI(req.query[option.real_url_param]) || default_page,
			method: req.method.toUpperCase(),
			headers: req.headers,
			post_json: req.body ? JSON.stringify(req.body) : ''
		};
	}
	var converter;
	if ('aws' === mode) {
		converter = convert_serverless_env_mode_aws;
	} else if ('azure' === mode) {
		converter = convert_serverless_env_mode_azure;
	} else if ('gcp' === mode) {
		converter = convert_serverless_env_mode_gcp;
	}
	return env => {
		try {
			return converter(env);
		} catch {
			return {
				headers: { [option.alias_header_for_real_host]: '*' },
				real_url: default_error_page_platform_api_maybe_changed,
			};
		}
	};
}
