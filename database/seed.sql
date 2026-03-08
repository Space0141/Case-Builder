INSERT INTO users (discord_id, username, role, discord_roles)
VALUES
  ('100000000000000001', 'ChiefAdmin', 'Admin', ARRAY['Admin']),
  ('100000000000000002', 'ShiftSupervisor', 'Supervisor', ARRAY['Supervisor']),
  ('100000000000000003', 'PatrolOfficer01', 'Officer', ARRAY['Officer'])
ON CONFLICT (discord_id) DO NOTHING;

INSERT INTO cases (
  case_number, case_title, incident_type, incident_location,
  incident_datetime, reporting_officer, units_involved, case_status, created_by
)
VALUES
  (
    'CB-2026-000001',
    'Armed Robbery - North Transit Station',
    'Robbery',
    'North Transit Station, Sector 7',
    NOW() - INTERVAL '2 days',
    'Officer A. Delgado',
    'Unit 12, Unit 19, K9-4',
    'Under Investigation',
    (SELECT id FROM users WHERE discord_id = '100000000000000003')
  ),
  (
    'CB-2026-000002',
    'Burglary - Commercial Property',
    'Burglary',
    '145 Market Row',
    NOW() - INTERVAL '6 days',
    'Officer M. Reed',
    'Unit 8',
    'Open',
    (SELECT id FROM users WHERE discord_id = '100000000000000003')
  )
ON CONFLICT (case_number) DO NOTHING;

INSERT INTO reports (case_id, incident_overview, dispatch_call_information, officer_narrative, probable_cause, updated_by)
SELECT
  c.id,
  '<p>Units responded to an armed robbery in progress.</p>',
  '<p>911 caller reported a masked suspect with a handgun.</p>',
  '<p>Officers established perimeter and canvassed witnesses.</p>',
  '<p>Video surveillance and witness IDs place suspect at scene.</p>',
  (SELECT id FROM users WHERE discord_id = '100000000000000002')
FROM cases c
WHERE c.case_number = 'CB-2026-000001'
ON CONFLICT (case_id) DO NOTHING;

INSERT INTO suspects (case_id, full_name, alias, description, arrest_status, notes)
SELECT
  c.id,
  'Darius Cole',
  'D-Cole',
  'Male, approx 6''1", black hoodie, forearm tattoo',
  'Arrested',
  'Detained after traffic stop near east bridge'
FROM cases c
WHERE c.case_number = 'CB-2026-000001'
ON CONFLICT DO NOTHING;

INSERT INTO charges (case_id, suspect_id, statute_code, charge_title, statute_text, explanation)
SELECT
  c.id,
  s.id,
  'TX-29.02',
  'Robbery',
  'A person commits robbery if ...',
  'Suspect threatened victim with firearm while taking property.'
FROM cases c
JOIN suspects s ON s.case_id = c.id
WHERE c.case_number = 'CB-2026-000001' AND s.full_name = 'Darius Cole'
ON CONFLICT DO NOTHING;

INSERT INTO timeline_events (case_id, event_type, details)
SELECT id, 'Dispatch received', 'Initial emergency call logged in CAD' FROM cases WHERE case_number = 'CB-2026-000001'
UNION ALL
SELECT id, 'Officer arrival', 'Unit 12 arrived on scene within 4 minutes' FROM cases WHERE case_number = 'CB-2026-000001'
UNION ALL
SELECT id, 'Evidence collected', 'Shell casings and CCTV footage secured' FROM cases WHERE case_number = 'CB-2026-000001';

INSERT INTO system_settings (key, value)
VALUES
  ('department_name', 'Case Builder PD'),
  ('default_timezone', 'UTC'),
  ('retention_policy_days', '3650')
ON CONFLICT (key) DO NOTHING;
