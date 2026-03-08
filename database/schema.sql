CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  discord_id VARCHAR(64) UNIQUE NOT NULL,
  username VARCHAR(100) NOT NULL,
  avatar TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'Officer' CHECK (role IN ('Admin', 'Supervisor', 'Officer')),
  discord_roles TEXT[] NOT NULL DEFAULT '{}',
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_token_expiry TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cases (
  id SERIAL PRIMARY KEY,
  case_number VARCHAR(30) UNIQUE,
  case_title VARCHAR(200) NOT NULL,
  incident_type VARCHAR(120) NOT NULL,
  incident_location VARCHAR(255) NOT NULL,
  incident_datetime TIMESTAMP NOT NULL,
  reporting_officer VARCHAR(120) NOT NULL,
  units_involved TEXT,
  case_status VARCHAR(30) NOT NULL CHECK (case_status IN ('Open', 'Under Investigation', 'Closed')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  case_id INTEGER UNIQUE NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  incident_overview TEXT NOT NULL DEFAULT '',
  dispatch_call_information TEXT NOT NULL DEFAULT '',
  suspect_information TEXT NOT NULL DEFAULT '',
  victim_information TEXT NOT NULL DEFAULT '',
  witness_statements TEXT NOT NULL DEFAULT '',
  evidence_collected TEXT NOT NULL DEFAULT '',
  probable_cause TEXT NOT NULL DEFAULT '',
  charges TEXT NOT NULL DEFAULT '',
  officer_narrative TEXT NOT NULL DEFAULT '',
  use_of_force TEXT NOT NULL DEFAULT '',
  arrest_details TEXT NOT NULL DEFAULT '',
  updated_by INTEGER REFERENCES users(id),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suspects (
  id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  alias VARCHAR(150),
  description TEXT,
  arrest_status VARCHAR(40) NOT NULL DEFAULT 'Not Arrested',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS charges (
  id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  suspect_id INTEGER NOT NULL REFERENCES suspects(id) ON DELETE CASCADE,
  statute_code VARCHAR(50) NOT NULL,
  charge_title VARCHAR(200) NOT NULL,
  statute_text TEXT,
  explanation TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evidence (
  id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  suspect_id INTEGER REFERENCES suspects(id) ON DELETE SET NULL,
  evidence_name VARCHAR(200) NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timeline_events (
  id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  event_type VARCHAR(120) NOT NULL,
  details TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS report_comments (
  id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(case_status);
CREATE INDEX IF NOT EXISTS idx_cases_incident_datetime ON cases(incident_datetime);
CREATE INDEX IF NOT EXISTS idx_suspects_case_id ON suspects(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_timeline_case_id ON timeline_events(case_id);
