/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx) {
		console.log(request.headers);
		const language_code = "ZH";
		const response = await fetch(`https://mobile.cuhk.edu.cn/api/work/sc/scCalendar/getAppCalendar?type=current&lang=${language_code}`)
		
		console.log(response);
		return new Response('Hello World!');
	},
};
