const real_url_param = '_url';
const mode = 'gcp';

const { convert_env, suki_serverless_conf } = require('./serverless.js');

async function postHandler(req, res) {
	var response_data = await suki.sync(serverless.handle)(convert_env({env: req, real_url_param, mode}));
	if (response_data) {
		res.setHeader('Content-Type', response_data.contentType);
		response_data.cookies && res.setHeader('Set-Cookie', response_data.cookies.map(cookie => cookie.replace('Set-Cookie: ', '').slice(0, -1)));
		res.status(response_data.statusCode).send(response_data.content);
	} else {
		res.status(403).send('Invalid request.');
	}
	return true;
}

var suki = require('./sjs/sjs.js'), serverless;

exports.handler = (req, res) => {
	if (!serverless) {
		suki.init(suki.serverless(suki_serverless_conf));
		serverless = suki.serverless;
	}
	postHandler(req, res);
};