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
			insertPlane(env.d1, results);
		} catch(error) {
			console.error(error)
		}
	},
} satisfies ExportedHandler<Env>;
