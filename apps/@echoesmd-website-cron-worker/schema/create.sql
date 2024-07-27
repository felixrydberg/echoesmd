CREATE TABLE IF NOT EXISTS Issues (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  estimate_point INTEGER NULL,
  name TEXT NULL,
  description_html TEXT NULL,
  description_stripped TEXT NULL,
  priority TEXT NULL,
  start_date DATE NULL,
  target_date DATE NULL,
  sequence_id INTEGER NULL,
  sort_order FLOAT NULL,
  completed_at TIMESTAMP NULL,
  archived_at TIMESTAMP NULL,
  is_draft BOOLEAN NULL,
  created_by UUID NULL,
  updated_by UUID NULL,
  project UUID NULL,
  workspace UUID NULL,
  parent UUID NULL,
  state UUID NULL,
  assignees TEXT NULL, -- Store arrays as text
  labels TEXT NULL -- Store arrays as text
);

CREATE TABLE IF NOT EXISTS Labels (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  name TEXT NULL,
  description TEXT NULL,
  color TEXT NULL,
  sort_order FLOAT NULL,
  created_by UUID NULL,
  updated_by UUID NULL,
  project UUID NULL,
  workspace UUID NULL,
  parent UUID NULL
);

CREATE TABLE IF NOT EXISTS States (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  name TEXT NULL,
  description TEXT NULL,
  color TEXT NULL,
  slug TEXT NULL,
  sequence FLOAT NULL,
  "group" TEXT NULL,
  "default" BOOLEAN NULL,
  created_by UUID NULL,
  updated_by UUID NULL,
  project UUID NULL,
  workspace UUID NULL
);
