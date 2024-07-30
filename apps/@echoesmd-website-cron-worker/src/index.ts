/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Scheduled Worker: a Worker that can run on a
 * configurable interval:
 * https://developers.cloudflare.com/workers/platform/triggers/cron-triggers/
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"` to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { router } from './routes/index.js';
import { getPlane, insertPlane } from './utils/index';

export default {
  async fetch(request, env, ctx) {
		const type = request.method.toLowerCase();
		const path = new URL(request.url).pathname;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const route = (router as any)[path];
		if (route && route[type]) {
			return route[type](request, env, ctx);
		}
		
		return new Response("Url not found", {
			status: 400,
		});
  },	// The scheduled handler is invoked at the interval set in our wrangler.toml's
	// [[triggers]] configuration.
	// The scheduled handler is invoked at the interval set in our wrangler.toml's
	// [[triggers]] configuration.
	async scheduled(event, env): Promise<void> {
		try {
			const results = await getPlane(env.PLANE_API_KEY);
			let length = 0;
			for(let i = 0; i < results.length; i++) {
				length += results[i].results.length;
			}
			if (length === 0) {
				return;
			}
			
			await insertPlane(env.d1, results);

			if (env.WORKER_API_KEY) {
				const url = "https://api.cloudflare.com/client/v4/accounts/68b6474393e4376ff414558b27969987/pages/projects/echoesmd/deployments";
				const options = {
					method: "POST",
					headers: {
						"Content-Type": "application/json;charset=UTF-8",
						"Authorization": `Bearer ${env.WORKER_API_KEY}`,
					},
				};
		
				await fetch(url, options);
			}
		} catch(error) {
			console.error(error)
		}
	},
} satisfies ExportedHandler<Env>;
