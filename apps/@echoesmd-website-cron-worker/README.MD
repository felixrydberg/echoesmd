## Setup for Local Development
```sh
cd ./apps/@echoesmd-website-cron-worker
```
<!-- Replace with .example.env -->
```sh
echo "PLANE_API_KEY=<PLANE API TOKEN>" > .env
```
```sh
npx wrangler d1 execute echoesmd-website --local --file=./schema/create.sql
```

### Populating local D1
```sh
curl "http://localhost:8787/trigger/populate"
```
### Getting local Issues
```sh
curl "http://localhost:8787/issues"
```
### Empty local D1
```sh
npx wrangler d1 execute echoesmd-website --local --file=./schema/empty.sql
```
### Updating remote D1
```sh
npx wrangler d1 execute echoesmd-website --remote --file=./schema/create.sql
```
### Populating remote D1
```sh
curl "https://echoesmd-website-cron-worker.felixryd.workers.dev/trigger/populate"
```
### Getting remote Issues
```sh
curl "https://echoesmd-website-cron-worker.felixryd.workers.dev/issues"
```
### Empty remote D1
```sh
npx wrangler d1 execute echoesmd-website --remote --file=./schema/empty.sql
```



## Table structures (From Plane)
Issue
```JSON
{
	"id": "e1c25c66-5bb8-465e-a818-92a483423443",
	"created_at": "2023-11-19T11:56:55.176802Z",
	"updated_at": "2023-11-19T11:56:55.176809Z",
	"estimate_point": null,
	"name": "First Issue",
	"description_html": "<p></p>",
	"description_stripped": "",
	"priority": "none",
	"start_date": "2023-09-01",
	"target_date": "2023-10-04",
	"sequence_id": 421,
	"sort_order": 265535.0,
	"completed_at": null,
	"archived_at": null,
	"is_draft": false,
	"created_by": "16c61a3a-512a-48ac-b0be-b6b46fe6f430",
	"updated_by": "16c61a3a-512a-48ac-b0be-b6b46fe6f430",
	"project": "4af68566-94a4-4eb3-94aa-50dc9427067b",
	"workspace": "cd4ab5a2-1a5f-4516-a6c6-8da1a9fa5be4",
	"parent": null,
	"state": "f3f045db-7e74-49f2-b3b2-0b7dee4635ae",
	"assignees": [
		"797b5aea-3f40-4199-be84-5f94e0d04501"
	],
	"labels": []
}
```

Label
```JSON
{
"id": "c7146baf-7058-496b-aa3a-df6c25a7e929",
"created_at": "2023-11-20T06:01:03.538675Z",
"updated_at": "2023-11-20T06:01:03.538683Z",
"name": "High",
"description": "",
"color": "",
"sort_order": 72416.0,
"created_by": "16c61a3a-512a-48ac-b0be-b6b46fe6f430",
"updated_by": "16c61a3a-512a-48ac-b0be-b6b46fe6f430",
"project": "4af68566-94a4-4eb3-94aa-50dc9427067b",
"workspace": "cd4ab5a2-1a5f-4516-a6c6-8da1a9fa5be4",
"parent": null
}
```

State
```JSON
{
	"id": "f960d3c2-8524-4a41-b8eb-055ce4be2a7f",
	"created_at": "2023-11-19T17:41:45.478363Z",
	"updated_at": "2023-11-19T17:41:45.478383Z",
	"name": "Ideation",
	"description": "",
	"color": "#eb5757",
	"slug": "ideation",
	"sequence": 130000.0,
	"group": "unstarted",
	"default": false,
	"created_by": "16c61a3a-512a-48ac-b0be-b6b46fe6f430",
	"updated_by": "16c61a3a-512a-48ac-b0be-b6b46fe6f430",
	"project": "4af68566-94a4-4eb3-94aa-50dc9427067b",
	"workspace": "cd4ab5a2-1a5f-4516-a6c6-8da1a9fa5be4"
}
```

