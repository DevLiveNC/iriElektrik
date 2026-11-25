CREATE TABLE IF NOT EXISTS business_settings (
  id integer PRIMARY KEY,
  data jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS jobs (
  id text PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  vehicle text NOT NULL DEFAULT '',
  symptom text NOT NULL DEFAULT '',
  diagnosis text NOT NULL DEFAULT '',
  application text NOT NULL DEFAULT '',
  result text NOT NULL DEFAULT '',
  cover text NOT NULL DEFAULT '',
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  alt text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_example boolean NOT NULL DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS redirects (
  old_slug text PRIMARY KEY,
  new_slug text NOT NULL
);
