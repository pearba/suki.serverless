import { define, getHandler } from '@pearba/suki.serverless';
const __dirname = new URL('.', import.meta.url).pathname.slice(0, -1);

//please aware that the www_default directory (which located in npm package) will be replaced if you specific * in web_root_for_suki_js
define({
	platform: 'aws', //currently available aws/azure/gcp 
	query_param_for_real_url: '',
	alias_header_for_real_host: 'x-host-alias',
	web_root_for_suki_js: {},
});

let handler = getHandler();

//api samples

//export { handler }; //for aws/gcp ?

//export default handler; //for azure ?