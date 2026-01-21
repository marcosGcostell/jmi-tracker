
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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


