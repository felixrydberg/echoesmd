import { Label, State, Issue, Route } from "../types";

export const issues: Route = {
  get: async (request, env) => {
    const kv: {[key: string]: Label | State} = {};
			const issues = await env.d1.prepare("SELECT * FROM Issues").all<Issue>();
			const labels = await env.d1.prepare("SELECT * FROM Labels").all<Label>();
			const states = await env.d1.prepare("SELECT * FROM States").all<State>();
			
			for (let i = 0; i < labels.results.length; i++) {
				const label = labels.results[i];
				kv[label.id] = label;
			}

			for (let i = 0; i < states.results.length; i++) {
				const state = states.results[i];
				kv[state.id] = state;
			}

			for (let i = 0; i < issues.results.length; i++) {
				const issue = issues.results[i];
				issue.state = kv[issue.state]?.name;
				issue.labels = JSON.parse(issue.labels as unknown as string).map((id: string) => kv[id]);
			}

			// const result = issues.results.map((issue) => issue);
			const result = issues.results;
			return new Response(JSON.stringify(result), {
				status: 200,
				headers: {
					"content-type": "application/json"
				}
			});
  } 
}