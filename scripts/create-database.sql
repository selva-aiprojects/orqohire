-- =============================================================================
-- OrqoHire Database Schema — PostgreSQL
-- Run this on your DB server to create the database and all 8 tables
-- =============================================================================

-- Create the database (run separately as superuser if needed)
-- CREATE DATABASE orqohire;

-- Connect to it, then run below:
-- \c orqohire

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. users ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
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

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ── 2. candidates ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS candidates (
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

CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_skills ON candidates USING GIN(primary_skills);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_name ON candidates(full_name);

-- ── 3. requirements ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS requirements (
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

CREATE INDEX IF NOT EXISTS idx_requirements_status ON requirements(status);
CREATE INDEX IF NOT EXISTS idx_requirements_client ON requirements(client_name);
CREATE INDEX IF NOT EXISTS idx_requirements_skills ON requirements USING GIN(required_skills);
CREATE INDEX IF NOT EXISTS idx_requirements_code ON requirements(job_code);

-- ── 4. pipeline_entries ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pipeline_entries (
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

CREATE INDEX IF NOT EXISTS idx_pipeline_stage ON pipeline_entries(current_stage);
CREATE INDEX IF NOT EXISTS idx_pipeline_job ON pipeline_entries(job_code);
CREATE INDEX IF NOT EXISTS idx_pipeline_candidate ON pipeline_entries(candidate_id);

-- ── 5. passports ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS passports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id        UUID UNIQUE NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    status              VARCHAR(20) CHECK (status IN ('DRAFT','PARTIAL','COMPLETE','VERIFIED')),
    trust_score         INTEGER DEFAULT 0,
    completion_percent  INTEGER DEFAULT 0,
    full_name           VARCHAR(255),
    email               VARCHAR(255),
    phone               VARCHAR(50),
    "current_role"      VARCHAR(255),
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

CREATE INDEX IF NOT EXISTS idx_passports_candidate ON passports(candidate_id);

-- ── 6. employment_histories ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS employment_histories (
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

CREATE INDEX IF NOT EXISTS idx_employment_passport ON employment_histories(passport_id);

-- ── 7. verification_requests ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS verification_requests (
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

CREATE INDEX IF NOT EXISTS idx_verification_token ON verification_requests(token);
CREATE INDEX IF NOT EXISTS idx_verification_status ON verification_requests(status);

-- ── 8. discovered_keywords ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS discovered_keywords (
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

CREATE INDEX IF NOT EXISTS idx_keywords_status ON discovered_keywords(status);
CREATE INDEX IF NOT EXISTS idx_keywords_type ON discovered_keywords(type);

-- ── 9. audit_log ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action      VARCHAR(50) NOT NULL,
    entity      VARCHAR(50) NOT NULL,
    entity_id   VARCHAR(255),
    user_id     VARCHAR(255),
    details     TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
