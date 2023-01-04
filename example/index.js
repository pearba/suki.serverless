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
	suki_id: 'aws-lambda-1', //used by suki.js x-suki response header, help to identify which function/platform and show info for x-suki itself
	/* optional */
	delay_seconds_for_hot_code: 60,
});

let handler = getAsyncHandler();

//api samples

//exports.handler = handler; //for aws/gcp ?

//module.exports = handler; //for azure ?