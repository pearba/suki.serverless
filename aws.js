const real_url_param = '_url';
const mode = 'aws';
const { convert_env, suki_serverless_conf } = require('./serverless.js');

var suki = require('./sjs/sjs.js'), serverless;

async function postHandler(event) {
	var response_data = await suki.sync(serverless.handle)(convert_env({env: event, real_url_param, mode}))
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

exports.handler = async function (event) {
	if (!serverless) {
		suki.init(suki.serverless(suki_serverless_conf));
		serverless = suki.serverless;
	}
	return await postHandler(event);
};