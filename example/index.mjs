import { define, getAsyncHandler } from '@pearba/suki.serverless';
import path from 'node:path';

const __dirname = new URL('.', import.meta.url).pathname.slice(0, -1);

//please aware that the www_default directory (which located in npm package) will be replaced if you specific * in web_root_for_suki_js
define({
	platform: 'aws', //currently available aws/azure/gcp 
	query_param_for_real_path: '_real_path', //recommend to use some random words to avoid conflict 
	alias_header_for_real_host: 'x-host-alias',
	web_root_for_suki_js: {
		'example.com': path.resolve(__dirname, '/www_root_example_com')
	},
	suki_id: 'aws-lambda-1' //used by suki.js x-suki response header, help to identify which function/platform and show info for x-suki itself
});

let handler = getAsyncHandler();

//api samples

//export { handler }; //for aws/gcp ?

//export default handler; //for azure ?