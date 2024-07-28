import { Label, State, Issue } from "../types";

export const buildIssues = async (env: Env) => {
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
    issue.state = kv[issue.state as string] as State;
    issue.labels = JSON.parse(issue.labels as unknown as string).map((id: string) => kv[id]);
    issue.labels.filter((label: Label) => label !== undefined);
  }
  return issues.results;
}