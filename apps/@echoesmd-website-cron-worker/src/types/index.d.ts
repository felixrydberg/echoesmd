interface Response<T> {
  "next_cursor": "20:1:0",
  "prev_cursor": "",
  "next_page_results": true,
  "prev_page_results": false,
  "count": 20,
  "total_pages": 50,
  "total_results": 1000,
  "extra_stats": null,
  "results": T[]
}

interface Issue {
	id: string;
	created_at: string;
	updated_at: string;
	estimate_point: number | null;
	name: string;
	description_html: string;
	description_stripped: string | null;
	priority: string;
	start_date: string | null;
	target_date: string | null;
	sequence_id: number;
	sort_order: number;
	completed_at: string | null;
	archived_at: string | null;
	is_draft: 0 | 1;
	created_by: string;
	updated_by: string;
	project: string;
	workspace: string;
	parent: string | null;
	state: string | State;
	assignees: string[];
	labels: Label[];
}

interface Label {
	id: string;
	created_at: string;
	updated_at: string;
	name: string;
	description: string;
	color: string;
	sort_order: number;
	created_by: string;
	updated_by: string;
	project: string;
	workspace: string;
	parent: string | null;
}

interface State {
	id: string;
	created_at: string;
	updated_at: string;
	name: string;
	description: string;
	color: string;
	slug: string;
	sequence: number;
	group: string;
	default: boolean;
	created_by: string;
	updated_by: string;
	project: string;
	workspace: string;
}

interface Route {
  get?: (request: Request<unknown, IncomingRequestCfProperties<unknown>>, env: Env, ctx: ExecutionContext) => unknown;
  post?: (request: Request<unknown, IncomingRequestCfProperties<unknown>>, env: Env, ctx: ExecutionContext) => unknown;
  put?: (request: Request<unknown, IncomingRequestCfProperties<unknown>>, env: Env, ctx: ExecutionContext) => unknown;
  delete?: (request: Request<unknown, IncomingRequestCfProperties<unknown>>, env: Env, ctx: ExecutionContext) => unknown;
}

export {
  Response,
  Issue,
  Label,
  State,
  Route
}
