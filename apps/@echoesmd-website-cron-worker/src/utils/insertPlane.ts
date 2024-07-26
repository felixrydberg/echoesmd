import { Label, Issue, State, Response } from '../types';

export const insertPlane = async (d1: D1Database, results: [Response<Label>, Response<Issue>, Response<State>]) => {
	// Prepeared statements for inserting data into D1
	const insertLabel = `
    INSERT INTO Labels (
      id, created_at, updated_at, name, description, color, sort_order, created_by, updated_by, project, workspace, parent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (id) DO NOTHING;
  `;

	const insertIssue = `
    INSERT INTO Issues (
      id, created_at, updated_at, estimate_point, name, description_html, description_stripped, priority, start_date, target_date, sequence_id, sort_order, completed_at, archived_at, is_draft, created_by, updated_by, project, workspace, parent, state, assignees, labels
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (id) DO NOTHING;
  `;

	const insertState = `
    INSERT INTO States (
      id, created_at, updated_at, name, description, color, slug, sequence, "group", "default", created_by, updated_by, project, workspace
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (id) DO NOTHING;
  `;
	// Validate result and insert into D1
	const [labels, issues, states] = results.map((result) => result.results) as [Label[], Issue[], State[]];
	console.log(results);
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
