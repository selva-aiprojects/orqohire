# OrqoHire Database Schema — v2.0

> Clean relational schema for migration from Google Sheets to PostgreSQL.
> Every table below is connected to at least one page/screen workflow in the application.

---

## 1. `users`

**Connected pages:** Login, Register, auth/me  
**Source sheet:** Config → `Users!A:G`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `email` | `VARCHAR(255)` | `UNIQUE NOT NULL` | Login identifier |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | bcrypt hash |
| `name` | `VARCHAR(255)` | `NOT NULL` | |
| `role` | `VARCHAR(50)` | `NOT NULL CHECK (role IN ('super_admin','recruiter_manager','recruiter','client_spoc','candidate'))` | Determines portal access |
| `client_name` | `VARCHAR(255)` | | Only for `client_spoc` role |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | |

---

## 2. `candidates`

**Connected pages:** Candidates list, Candidate detail, Recruiter dashboard, Analytics, Shortlist  
**Source sheet:** Candidates → `Candidate!A:T`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `full_name` | `VARCHAR(255)` | `NOT NULL` | |
| `email` | `VARCHAR(255)` | | |
| `phone` | `VARCHAR(50)` | | |
| `current_designation` | `VARCHAR(255)` | | |
| `current_company` | `VARCHAR(255)` | | |
| `total_experience_years` | `NUMERIC(4,1)` | | e.g. 5.5 |
| `relevant_experience_years` | `NUMERIC(4,1)` | | |
| `primary_skills` | `JSONB` | `DEFAULT '[]'` | Array of strings |
| `secondary_skills` | `JSONB` | `DEFAULT '[]'` | Array of strings |
| `resume_link` | `TEXT` | | URL |
| `location_current` | `VARCHAR(255)` | | |
| `location_preferred` | `JSONB` | `DEFAULT '[]'` | Array of city strings |
| `open_to_relocate` | `VARCHAR(20)` | `CHECK (open_to_relocate IN ('Yes','No','Negotiable'))` | |
| `notice_period_text` | `VARCHAR(100)` | | e.g. "30 days" |
| `notice_period_days` | `INTEGER` | | Parsed from text |
| `employment_type` | `VARCHAR(20)` | `CHECK (employment_type IN ('Full-time','Contract','Freelance','Intern'))` | |
| `current_ctc_lpa` | `NUMERIC(10,2)` | | Current salary (LPA) |
| `expected_ctc_lpa` | `NUMERIC(10,2)` | | Expected salary (LPA) |
| `availability_date` | `DATE` | | |
| `source` | `VARCHAR(100)` | | e.g. "Form", "Portal", "LinkedIn" |
| `status` | `VARCHAR(20)` | `CHECK (status IN ('Active','Passive','Placed','Blacklisted'))` | |
| `registered_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | |

---

## 3. `requirements`

**Connected pages:** Requirements list, Opportunities, Recruiter dashboard, Analytics, Shortlist, Candidate detail  
**Source sheet:** Requirements → `Sheet1!A:O`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `job_code` | `VARCHAR(50)` | `UNIQUE NOT NULL` | Human-readable, e.g. "WK001" |
| `client_name` | `VARCHAR(255)` | `NOT NULL` | |
| `designation` | `VARCHAR(255)` | | |
| `department` | `VARCHAR(255)` | | |
| `job_description` | `TEXT` | | |
| `required_skills` | `JSONB` | `DEFAULT '[]'` | Array of strings |
| `good_to_have_skills` | `JSONB` | `DEFAULT '[]'` | Array of strings |
| `min_experience` | `INTEGER` | | Years |
| `max_experience` | `INTEGER` | | Years |
| `location` | `VARCHAR(255)` | | |
| `employment_type` | `VARCHAR(20)` | `CHECK (employment_type IN ('Full-time','Contract','Freelance','Intern'))` | |
| `budget_min_lpa` | `NUMERIC(10,2)` | | |
| `budget_max_lpa` | `NUMERIC(10,2)` | | |
| `notice_period_max_days` | `INTEGER` | `DEFAULT 30` | |
| `vacancies` | `INTEGER` | `DEFAULT 1` | |
| `priority` | `VARCHAR(10)` | `CHECK (priority IN ('High','Medium','Low'))` | |
| `status` | `VARCHAR(20)` | `CHECK (status IN ('Active','On Hold','Closed'))` | |
| `filled_count` | `INTEGER` | `DEFAULT 0` | |
| `account_manager` | `VARCHAR(255)` | | Recruiter/owner |
| `client_spoc` | `VARCHAR(255)` | | Client POC name |
| `raised_at` | `TIMESTAMPTZ` | | |
| `activated_at` | `TIMESTAMPTZ` | | |
| `closed_at` | `TIMESTAMPTZ` | | |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | |

---

## 4. `pipeline_entries`

**Connected pages:** Pipeline kanban, Apply/Submit, Client dashboard, Analytics  
**Source sheet:** Unified → `Sheet1!A:AB`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `job_code` | `VARCHAR(50)` | `NOT NULL REFERENCES requirements(job_code)` | |
| `candidate_id` | `UUID` | `NOT NULL REFERENCES candidates(id)` | |
| `candidate_name` | `VARCHAR(255)` | | Denormalized for display |
| `client_name` | `VARCHAR(255)` | | Denormalized for filtering |
| `submitted_at` | `TIMESTAMPTZ` | | |
| `current_stage` | `VARCHAR(20)` | `CHECK (current_stage IN ('Submitted','L1','L2','L3','Test','Offered','Joined','Rejected'))` | |
| `l1_date` | `TIMESTAMPTZ` | | |
| `l1_result` | `VARCHAR(50)` | | |
| `l1_interviewer` | `VARCHAR(255)` | | |
| `l2_date` | `TIMESTAMPTZ` | | |
| `l2_result` | `VARCHAR(50)` | | |
| `l2_interviewer` | `VARCHAR(255)` | | |
| `l3_date` | `TIMESTAMPTZ` | | |
| `l3_result` | `VARCHAR(50)` | | |
| `l3_interviewer` | `VARCHAR(255)` | | |
| `test_date` | `TIMESTAMPTZ` | | |
| `test_score` | `VARCHAR(50)` | | |
| `offer_date` | `TIMESTAMPTZ` | | |
| `ctc_offered_lpa` | `NUMERIC(10,2)` | | |
| `joining_date` | `DATE` | | |
| `dropout_reason` | `TEXT` | | |
| `assigned_recruiter` | `VARCHAR(255)` | | |
| `client_spoc_feedback` | `TEXT` | | |
| `internal_notes` | `TEXT` | | |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | |

**Constraints:** `UNIQUE (job_code, candidate_id)`

---

## 5. `passports`

**Connected pages:** Candidate Passport (view/edit), Admin passports view  
**Source sheet:** Config → `candidate_passport!A:Q`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `candidate_id` | `UUID` | `UNIQUE NOT NULL REFERENCES candidates(id)` | |
| `status` | `VARCHAR(20)` | `CHECK (status IN ('DRAFT','PARTIAL','COMPLETE','VERIFIED'))` | |
| `trust_score` | `INTEGER` | `DEFAULT 0` | 0–100 |
| `completion_percent` | `INTEGER` | `DEFAULT 0` | 0–100 |
| `full_name` | `VARCHAR(255)` | | |
| `email` | `VARCHAR(255)` | | |
| `phone` | `VARCHAR(50)` | | |
| `current_role` | `VARCHAR(255)` | | |
| `total_experience` | `VARCHAR(50)` | | Free text |
| `skills` | `TEXT` | | Comma-separated |
| `location` | `VARCHAR(255)` | | |
| `notice_period` | `VARCHAR(100)` | | |
| `linkedin_url` | `TEXT` | | |
| `resume_link` | `TEXT` | | |
| `consent_given` | `BOOLEAN` | `DEFAULT FALSE` | |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | |

---

## 6. `employment_histories`

**Connected pages:** Candidate Passport (add/display), Verification confirm/reject  
**Source sheet:** Config → `employment_history!A:L`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `passport_id` | `UUID` | `NOT NULL REFERENCES passports(id) ON DELETE CASCADE` | |
| `company_name` | `VARCHAR(255)` | `NOT NULL` | |
| `designation` | `VARCHAR(255)` | `NOT NULL` | |
| `employment_type` | `VARCHAR(50)` | | |
| `start_date` | `DATE` | | |
| `end_date` | `DATE` | | `NULL` = current job |
| `official_email` | `VARCHAR(255)` | | Used for verification |
| `is_current` | `BOOLEAN` | `DEFAULT FALSE` | |
| `verification_status` | `VARCHAR(20)` | `CHECK (verification_status IN ('NOT_REQUESTED','PENDING','VERIFIED','REJECTED'))` | |
| `verified_at` | `TIMESTAMPTZ` | | |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | |

---

## 7. `verification_requests`

**Connected pages:** Candidate Passport (request verify), Verify page (confirm/reject)  
**Source sheet:** Config → `verification_requests!A:K`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `employment_id` | `UUID` | `NOT NULL REFERENCES employment_histories(id) ON DELETE CASCADE` | |
| `candidate_id` | `UUID` | | Denormalized |
| `employer_email` | `VARCHAR(255)` | | |
| `token` | `VARCHAR(255)` | `UNIQUE NOT NULL` | Unique verification link |
| `sent_at` | `TIMESTAMPTZ` | | |
| `expires_at` | `TIMESTAMPTZ` | | |
| `status` | `VARCHAR(20)` | `CHECK (status IN ('PENDING','RESOLVED'))` | |
| `decision` | `VARCHAR(10)` | `CHECK (decision IN ('CONFIRM','REJECT'))` | |
| `verified_by` | `VARCHAR(255)` | | Employer name |
| `verified_at` | `TIMESTAMPTZ` | | |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | |

---

## 8. `discovered_keywords`

**Connected pages:** Admin → Discovery queue (approve/reject)  
**Source sheet:** Learning → `learning_queue!A:L`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PK DEFAULT gen_random_uuid()` | |
| `type` | `VARCHAR(50)` | `CHECK (type IN ('skill','title','tool','industry'))` | |
| `raw_value` | `VARCHAR(255)` | `NOT NULL` | As seen in source |
| `normalized` | `VARCHAR(255)` | | Canonical form |
| `occurrences` | `INTEGER` | `DEFAULT 1` | |
| `status` | `VARCHAR(20)` | `CHECK (status IN ('new','review','approved','rejected'))` | |
| `first_seen_at` | `TIMESTAMPTZ` | | |
| `last_seen_at` | `TIMESTAMPTZ` | | |
| `reviewed_by` | `VARCHAR(255)` | | Admin who reviewed |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | |

---

## Final SQL Script

```sql
-- =============================================================================
-- OrqoHire Database Schema — PostgreSQL
-- Run this on your DB server to create all 8 tables with indexes
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. users ──────────────────────────────────────────────────────────────────

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    role            VARCHAR(50) NOT NULL CHECK (role IN (
                        'super_admin','recruiter_manager','recruiter','client_spoc','candidate'
                    )),
    client_name     VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ── 2. candidates ─────────────────────────────────────────────────────────────

CREATE TABLE candidates (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name               VARCHAR(255) NOT NULL,
    email                   VARCHAR(255),
    phone                   VARCHAR(50),
    current_designation     VARCHAR(255),
    current_company         VARCHAR(255),
    total_experience_years  NUMERIC(4,1),
    relevant_experience_years NUMERIC(4,1),
    primary_skills          JSONB DEFAULT '[]',
    secondary_skills        JSONB DEFAULT '[]',
    resume_link             TEXT,
    location_current        VARCHAR(255),
    location_preferred      JSONB DEFAULT '[]',
    open_to_relocate        VARCHAR(20) CHECK (open_to_relocate IN ('Yes','No','Negotiable')),
    notice_period_text      VARCHAR(100),
    notice_period_days      INTEGER,
    employment_type         VARCHAR(20) CHECK (employment_type IN ('Full-time','Contract','Freelance','Intern')),
    current_ctc_lpa         NUMERIC(10,2),
    expected_ctc_lpa        NUMERIC(10,2),
    availability_date       DATE,
    source                  VARCHAR(100),
    status                  VARCHAR(20) CHECK (status IN ('Active','Passive','Placed','Blacklisted')),
    registered_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_skills ON candidates USING GIN(primary_skills);
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_candidates_name ON candidates(full_name);

-- ── 3. requirements ───────────────────────────────────────────────────────────

CREATE TABLE requirements (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_code            VARCHAR(50) UNIQUE NOT NULL,
    client_name         VARCHAR(255) NOT NULL,
    designation         VARCHAR(255),
    department          VARCHAR(255),
    job_description     TEXT,
    required_skills     JSONB DEFAULT '[]',
    good_to_have_skills JSONB DEFAULT '[]',
    min_experience      INTEGER,
    max_experience      INTEGER,
    location            VARCHAR(255),
    employment_type     VARCHAR(20) CHECK (employment_type IN ('Full-time','Contract','Freelance','Intern')),
    budget_min_lpa      NUMERIC(10,2),
    budget_max_lpa      NUMERIC(10,2),
    notice_period_max_days INTEGER DEFAULT 30,
    vacancies           INTEGER DEFAULT 1,
    priority            VARCHAR(10) CHECK (priority IN ('High','Medium','Low')),
    status              VARCHAR(20) CHECK (status IN ('Active','On Hold','Closed')),
    filled_count        INTEGER DEFAULT 0,
    account_manager     VARCHAR(255),
    client_spoc         VARCHAR(255),
    raised_at           TIMESTAMPTZ,
    activated_at        TIMESTAMPTZ,
    closed_at           TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_requirements_status ON requirements(status);
CREATE INDEX idx_requirements_client ON requirements(client_name);
CREATE INDEX idx_requirements_skills ON requirements USING GIN(required_skills);
CREATE INDEX idx_requirements_code ON requirements(job_code);

-- ── 4. pipeline_entries ───────────────────────────────────────────────────────

CREATE TABLE pipeline_entries (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_code              VARCHAR(50) NOT NULL REFERENCES requirements(job_code) ON DELETE CASCADE,
    candidate_id          UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    candidate_name        VARCHAR(255),
    client_name           VARCHAR(255),
    submitted_at          TIMESTAMPTZ,
    current_stage         VARCHAR(20) CHECK (current_stage IN (
                                'Submitted','L1','L2','L3','Test','Offered','Joined','Rejected'
                            )),
    l1_date               TIMESTAMPTZ,
    l1_result             VARCHAR(50),
    l1_interviewer        VARCHAR(255),
    l2_date               TIMESTAMPTZ,
    l2_result             VARCHAR(50),
    l2_interviewer        VARCHAR(255),
    l3_date               TIMESTAMPTZ,
    l3_result             VARCHAR(50),
    l3_interviewer        VARCHAR(255),
    test_date             TIMESTAMPTZ,
    test_score            VARCHAR(50),
    offer_date            TIMESTAMPTZ,
    ctc_offered_lpa       NUMERIC(10,2),
    joining_date          DATE,
    dropout_reason        TEXT,
    assigned_recruiter    VARCHAR(255),
    client_spoc_feedback  TEXT,
    internal_notes        TEXT,
    created_at            TIMESTAMPTZ DEFAULT NOW(),
    updated_at            TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (job_code, candidate_id)
);

CREATE INDEX idx_pipeline_stage ON pipeline_entries(current_stage);
CREATE INDEX idx_pipeline_job ON pipeline_entries(job_code);
CREATE INDEX idx_pipeline_candidate ON pipeline_entries(candidate_id);

-- ── 5. passports ──────────────────────────────────────────────────────────────

CREATE TABLE passports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id        UUID UNIQUE NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    status              VARCHAR(20) CHECK (status IN ('DRAFT','PARTIAL','COMPLETE','VERIFIED')),
    trust_score         INTEGER DEFAULT 0,
    completion_percent  INTEGER DEFAULT 0,
    full_name           VARCHAR(255),
    email               VARCHAR(255),
    phone               VARCHAR(50),
    current_role        VARCHAR(255),
    total_experience    VARCHAR(50),
    skills              TEXT,
    location            VARCHAR(255),
    notice_period       VARCHAR(100),
    linkedin_url        TEXT,
    resume_link         TEXT,
    consent_given       BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_passports_candidate ON passports(candidate_id);

-- ── 6. employment_histories ───────────────────────────────────────────────────

CREATE TABLE employment_histories (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passport_id           UUID NOT NULL REFERENCES passports(id) ON DELETE CASCADE,
    company_name          VARCHAR(255) NOT NULL,
    designation           VARCHAR(255) NOT NULL,
    employment_type       VARCHAR(50),
    start_date            DATE,
    end_date              DATE,
    official_email        VARCHAR(255),
    is_current            BOOLEAN DEFAULT FALSE,
    verification_status   VARCHAR(20) CHECK (verification_status IN (
                                'NOT_REQUESTED','PENDING','VERIFIED','REJECTED'
                            )),
    verified_at           TIMESTAMPTZ,
    created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_employment_passport ON employment_histories(passport_id);

-- ── 7. verification_requests ──────────────────────────────────────────────────

CREATE TABLE verification_requests (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employment_id     UUID NOT NULL REFERENCES employment_histories(id) ON DELETE CASCADE,
    candidate_id      UUID,
    employer_email    VARCHAR(255),
    token             VARCHAR(255) UNIQUE NOT NULL,
    sent_at           TIMESTAMPTZ,
    expires_at        TIMESTAMPTZ,
    status            VARCHAR(20) CHECK (status IN ('PENDING','RESOLVED')),
    decision          VARCHAR(10) CHECK (decision IN ('CONFIRM','REJECT')),
    verified_by       VARCHAR(255),
    verified_at       TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_verification_token ON verification_requests(token);
CREATE INDEX idx_verification_status ON verification_requests(status);

-- ── 8. discovered_keywords ────────────────────────────────────────────────────

CREATE TABLE discovered_keywords (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            VARCHAR(50) CHECK (type IN ('skill','title','tool','industry')),
    raw_value       VARCHAR(255) NOT NULL,
    normalized      VARCHAR(255),
    occurrences     INTEGER DEFAULT 1,
    status          VARCHAR(20) CHECK (status IN ('new','review','approved','rejected')),
    first_seen_at   TIMESTAMPTZ,
    last_seen_at    TIMESTAMPTZ,
    reviewed_by     VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_keywords_status ON discovered_keywords(status);
CREATE INDEX idx_keywords_type ON discovered_keywords(type);
```

---

## Tables explicitly excluded (not connected to any page/workflow)

| Table | Reason |
|---|---|
| `match_scores` | Computed in-memory by `lib/matching/engine.ts`, never persisted |
| `skill_taxonomy` | Lives in-memory in `lib/matching/normalizer.ts` |
| `role_taxonomy` | Lives in-memory in `lib/matching/taxonomy.ts` |
| `audit_log` | `writeAuditLog()` exists but no API route or page calls it |
| `candidate_accounts` | Functions exist in `lib/passport/index.ts` but no page triggers them |
| `skill_map` | Google Sheet ID defined but never read/written |
| Client tracker sheets (×4) | Google Sheet IDs defined but never used by any page |
