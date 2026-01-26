
-- Extension to use gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- And to use GiST
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- DATABASE TABLES
--
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  password TEXT NOT NULL,
  password_changed_at TIMESTAMPTZ DEFAULT now(),

  role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
  active BOOLEAN DEFAULT TRUE,

  reset_code_hash TEXT,
  reset_code_expires TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  is_main BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID UNIQUE REFERENCES users(id),

  full_name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE work_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,

  start_date DATE,
  end_date DATE,

  is_open BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_work_sites (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  work_site_id UUID NOT NULL REFERENCES work_sites(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT now(),

  PRIMARY KEY (user_id, work_site_id)
);

CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  work_site_id UUID NOT NULL REFERENCES work_sites(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  worker_id UUID NOT NULL REFERENCES workers(id),

  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,

  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),

  CHECK (end_time IS NULL OR end_time > start_time)
);

CREATE TABLE vacations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  worker_id UUID NOT NULL REFERENCES workers(id),

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  created_at TIMESTAMPTZ DEFAULT now(),

  CHECK (end_date >= start_date)

  CONSTRAINT no_overlapping_vacations
    EXCLUDE USING gist (
      worker_id WITH =,
      daterange(start_date, end_date, '[]') WITH &&
    )
);

CREATE TABLE sick_leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  worker_id UUID NOT NULL REFERENCES workers(id),

  start_date DATE NOT NULL,
  end_date DATE,

  created_at TIMESTAMPTZ DEFAULT now(),

  CHECK (end_date >= start_date)

  CONSTRAINT no_overlapping_sick_leaves
    EXCLUDE USING gist (
      worker_id WITH =,
      daterange(
        start_date,
        COALESCE(end_date, 'infinity'::date),
        '[]'
      ) WITH &&
    )
);

-- FUNCTIONS
CREATE OR REPLACE FUNCTION set_work_site_is_open()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_open :=
    NEW.end_date IS NULL OR NEW.end_date > CURRENT_DATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
CREATE TRIGGER trg_set_is_open
BEFORE INSERT OR UPDATE OF end_date
ON work_sites
FOR EACH ROW
EXECUTE FUNCTION set_work_site_is_open();

-- INDEXES
-- Search for workers and dates
CREATE INDEX idx_time_entries_worker ON time_entries(worker_id);
CREATE INDEX idx_time_entries_worker_start
ON time_entries(worker_id, start_time);

-- Search for work sites
CREATE INDEX idx_time_entries_work_site ON  time_entries(work_site_id);
CREATE INDEX idx_work_sites_is_open ON work_sites (is_open);

-- Availability
CREATE INDEX idx_vacations_worker ON vacations(worker_id, start_date, end_date);
CREATE INDEX idx_sick_leaves_worker ON sick_leaves(worker_id, start_date, end_date);
