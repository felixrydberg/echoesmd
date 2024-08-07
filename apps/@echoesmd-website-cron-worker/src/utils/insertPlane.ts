import { Label, Issue, State, Response } from '../types';

export const insertPlane = async (d1: D1Database, results: [Response<Label>, Response<Issue>, Response<State>]) => {
	// Prepeared statements for inserting data into D1
	const insertLabel = `
		INSERT INTO Labels (
			id, created_at, updated_at, name, description, color, sort_order, created_by, updated_by, project, workspace, parent
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT (id) DO UPDATE SET
			created_at = excluded.created_at,
			updated_at = excluded.updated_at,
			name = excluded.name,
			description = excluded.description,
			color = excluded.color,
			sort_order = excluded.sort_order,
			created_by = excluded.created_by,
			updated_by = excluded.updated_by,
			project = excluded.project,
			workspace = excluded.workspace,
			parent = excluded.parent;
	`;

	const insertIssue = `
		INSERT INTO Issues (
			id, created_at, updated_at, estimate_point, name, description_html, description_stripped, priority, start_date, target_date, sequence_id, sort_order, completed_at, archived_at, is_draft, created_by, updated_by, project, workspace, parent, state, assignees, labels
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT (id) DO UPDATE SET
			created_at = excluded.created_at,
			updated_at = excluded.updated_at,
			estimate_point = excluded.estimate_point,
			name = excluded.name,
			description_html = excluded.description_html,
			description_stripped = excluded.description_stripped,
			priority = excluded.priority,
			start_date = excluded.start_date,
			target_date = excluded.target_date,
			sequence_id = excluded.sequence_id,
			sort_order = excluded.sort_order,
			completed_at = excluded.completed_at,
			archived_at = excluded.archived_at,
			is_draft = excluded.is_draft,
			created_by = excluded.created_by,
			updated_by = excluded.updated_by,
			project = excluded.project,
			workspace = excluded.workspace,
			parent = excluded.parent,
			state = excluded.state,
			assignees = excluded.assignees,
			labels = excluded.labels;
	`;

	const insertState = `
		INSERT INTO States (
			id, created_at, updated_at, name, description, color, slug, sequence, "group", "default", created_by, updated_by, project, workspace
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT (id) DO UPDATE SET
			created_at = excluded.created_at,
			updated_at = excluded.updated_at,
			name = excluded.name,
			description = excluded.description,
			color = excluded.color,
			slug = excluded.slug,
			sequence = excluded.sequence,
			"group" = excluded."group",
			"default" = excluded."default",
			created_by = excluded.created_by,
			updated_by = excluded.updated_by,
			project = excluded.project,
			workspace = excluded.workspace;
	`;
	// Validate result and insert into D1
	const [labels, issues, states] = results.map((result) => result.results) as [Label[], Issue[], State[]];

	for (const label of labels) {
		if (!label.id) {
			continue;
		}
		await d1
			.prepare(insertLabel)
			.bind(
				label.id,
				label.created_at,
				label.updated_at,
				label.name,
				label.description,
				label.color,
				label.sort_order,
				label.created_by,
				label.updated_by,
				label.project,
				label.workspace,
				label.parent,
			)
			.run();
	}

	for (const issue of issues) {
		if (!issue.id) {
			continue;
		}
		const assigneesJson = JSON.stringify(issue.assignees ?? []);
		const labelsJson = JSON.stringify(issue.labels ?? []);
		await d1
			.prepare(insertIssue)
			.bind(
				issue.id,
				issue.created_at,
				issue.updated_at,
				issue.estimate_point,
				issue.name,
				issue.description_html,
				issue.description_stripped || null,
				issue.priority,
				issue.start_date,
				issue.target_date,
				issue.sequence_id,
				issue.sort_order,
				issue.completed_at,
				issue.archived_at,
				issue.is_draft,
				issue.created_by,
				issue.updated_by,
				issue.project,
				issue.workspace,
				issue.parent,
				issue.state,
				assigneesJson,
				labelsJson,
			)
			.run();
	}

	for (const state of states) {
		if (!state.id) {
			continue;
		}
		await d1
			.prepare(insertState)
			.bind(
				state.id,
				state.created_at,
				state.updated_at,
				state.name,
				state.description,
				state.color,
				state.slug,
				state.sequence,
				state.group,
				state.default,
				state.created_by,
				state.updated_by,
				state.project,
				state.workspace,
			)
			.run();
	}
};
