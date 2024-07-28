import { Route } from "../types";
import { buildIssues } from "../utils";

export const issues: Route = {
  get: async (request, env) => {
		const result = await buildIssues(env);
		return new Response(JSON.stringify(result), {
			status: 200,
			headers: {
				"content-type": "application/json"
			}
		});
  } 
}