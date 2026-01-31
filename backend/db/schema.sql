
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

CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID UNIQUE REFERENCES users(id),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,

  name TEXT NOT NULL,
  resource_type TEXT NOT NULL DEFAULT 'person',
  active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_id UUID REFERENCES companies(id) DEFAULT NULL
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

CREATE TABLE work_site_company_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  work_site_id UUID NOT NULL REFERENCES work_sites(id),
  company_id UUID NOT NULL REFERENCES companies(id),

  day_correction_minutes INTEGER NOT NULL DEFAULT 0,

  valid_from DATE NOT NULL,
  valid_to DATE,

  created_at TIMESTAMPTZ DEFAULT now(),

  CHECK (valid_to IS NULL OR valid_to >= valid_from),

  UNIQUE (work_site_id, company_id, valid_from),

  CONSTRAINT no_overlapping_work_site_company_rules
    EXCLUDE USING gist (
      work_site_id WITH =,
      company_id   WITH =,
      daterange(valid_from, COALESCE(valid_to, 'infinity'::date), '[)') WITH &&
    )
);

CREATE TABLE main_company_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  company_id UUID NOT NULL REFERENCES companies(id),

  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  day_correction_minutes INTEGER NOT NULL DEFAULT 0,

  valid_from DATE NOT NULL,
  valid_to DATE,

  CHECK (valid_to IS NULL OR valid_to >= valid_from),

  CONSTRAINT no_overlapping_schedules
    EXCLUDE USING gist (
      company_id WITH =,
      daterange(valid_from, COALESCE(valid_to, 'infinity'), '[)') WITH &&
    )
);

CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  work_site_id UUID NOT NULL REFERENCES work_sites(id),
  resource_id UUID NOT NULL REFERENCES resources(id),

  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  work_day_minutes INTEGER,
  comment TEXT,

  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),

  CHECK (end_time IS NULL OR end_time > start_time)
);

CREATE TABLE company_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  work_site_id UUID NOT NULL REFERENCES work_sites(id),
  company_id   UUID NOT NULL REFERENCES companies(id),

  date DATE NOT NULL,
  workers_count INTEGER NOT NULL CHECK (workers_count > 0),

  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_company_day
    UNIQUE (work_site_id, company_id, date)
);

CREATE TABLE vacations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  resource_id UUID NOT NULL REFERENCES resources(id),

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  created_at TIMESTAMPTZ DEFAULT now(),

  CHECK (end_date >= start_date),

  CONSTRAINT no_overlapping_vacations
    EXCLUDE USING gist (
      resource_id WITH =,
      daterange(start_date, end_date, '[]') WITH &&
    )
);

CREATE TABLE sick_leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  resource_id UUID NOT NULL REFERENCES resources(id),

  start_date DATE NOT NULL,
  end_date DATE,

  created_at TIMESTAMPTZ DEFAULT now(),

  CHECK (end_date >= start_date),

  CONSTRAINT no_overlapping_sick_leaves
    EXCLUDE USING gist (
      resource_id WITH =,
      daterange(
        start_date,
        COALESCE(end_date, 'infinity'::date),
        '[]'
      ) WITH &&
    )
);

-- INDEXES
-- Search for resources and dates
CREATE INDEX idx_time_entries_resource_time ON time_entries(resource_id, start_time, end_time);

-- Search for work sites
CREATE INDEX idx_time_entries_worksite_time ON time_entries(work_site_id, start_time);
CREATE INDEX idx_work_sites_is_open ON work_sites (is_open);

-- Availability
CREATE INDEX idx_vacations_resource_dates ON vacations (resource_id, start_date, end_date);
CREATE INDEX idx_sick_leaves_resource_dates ON sick_leaves (resource_id, start_date, end_date);
CREATE INDEX idx_sick_leaves_open ON sick_leaves (resource_id, start_date)
WHERE end_date IS NULL;

-- Avoid duplicates in categories
CREATE UNIQUE INDEX idx_uniq_category_global ON categories (name)
WHERE company_id IS NULL;

CREATE UNIQUE INDEX idx_uniq_category_company
ON categories (company_id, name)
WHERE company_id IS NOT NULL;


-- FUNCTIONS / TRIGGERS
-- To set work_sites.is_open automatically according to end_date
CREATE OR REPLACE FUNCTION set_work_site_is_open()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_open :=
    NEW.end_date IS NULL OR NEW.end_date > CURRENT_DATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_is_open
BEFORE INSERT OR UPDATE OF end_date
ON work_sites
FOR EACH ROW
EXECUTE FUNCTION set_work_site_is_open();

-- To constraint add vacations or sick leaves to resources of type 'person'
CREATE OR REPLACE FUNCTION check_vacations_only_people()
RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM resources
    WHERE id = NEW.resource_id
      AND resource_type = 'person'
  ) THEN
    RAISE EXCEPTION
      'Las vacaciones o bajas sólo se pueden asignar a recursos del tipo persona';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vacations_only_people
BEFORE INSERT OR UPDATE ON vacations
FOR EACH ROW
EXECUTE FUNCTION check_vacations_only_people();

CREATE TRIGGER trg_sick_leaves_only_people
BEFORE INSERT OR UPDATE ON sick_leaves
FOR EACH ROW
EXECUTE FUNCTION check_vacations_only_people();