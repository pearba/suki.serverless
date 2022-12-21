const { define, getAsyncHandler } = require('@pearba/suki.serverless');
const path = require('node:path');

//please aware that the www_default directory (which located in npm package) will be replaced if you specific * in web_root_for_suki_js
define({
	platform: 'aws', //currently available aws/azure/gcp 
	query_param_for_real_path: '_real_path', //recommend to use some random words to avoid conflict 
	alias_header_for_real_host: 'x-host-alias',
	web_root_for_suki_js: {
		'example.com': path.resolve(__dirname, '/www_root_example_com')
	},
});

let handler = getAsyncHandler();

//api samples

//exports.handler = handler; //for aws/gcp ?

//module.exports = handler; //for azure ?