const { define, getHandler } = require('@pearba/suki.serverless');

//please aware that the www_default directory (which located in npm package) will be replaced if you specific * in web_root_for_suki_js
define({
	platform: 'aws', //currently available aws/azure/gcp 
	query_param_for_real_url: '',
	alias_header_for_real_host: 'x-host-alias',
	web_root_for_suki_js: {},
});

let handler = getHandler();

//api samples

//exports.handler = handler; //for aws/gcp ?

//module.exports = handler; //for azure ?