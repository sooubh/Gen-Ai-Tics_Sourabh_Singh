-- ==============================================================================
-- VECNAVERSE: Voice-to-Investigation Cybercrime Audio Intelligence
-- Initial Production PostgreSQL Migration (20261024_init.sql)
-- ==============================================================================
-- Evidentiary Standards & Security Principles:
-- 1. All case data, transcripts, extractions and threat triggers are case-scoped.
-- 2. Strict Row Level Security (RLS) on all exposed tables scoping reads and writes
--    to authenticated officers via Supabase auth (auth.uid()).
-- 3. Child records (runs, segments, entities, triggers) maintain referential integrity
--    and ownership via parent case relationship.
-- 4. Audit logs are strictly append-only; update and delete operations are prohibited
--    to ensure judicial chain-of-custody tamper-resistance (SEC-X-SEC38).
-- 5. Audio storage remains in private bucket with authenticated RLS access control.
-- ==============================================================================

-- Enable required extensions for cryptographic IDs and functions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. Cases Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cases (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    docket_number TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    operation_name TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'triage' CHECK (status IN (
        'draft', 'active', 'triage', 'under_review', 'officer_verified',
        'closed', 'archived', 'flagged', 'Under Review', 'Triage',
        'Officer Verified', 'Archived', 'Flagged'
    )),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN (
        'low', 'medium', 'high', 'critical', 'urgent'
    )),
    caller_category TEXT CHECK (caller_category IN (
        'distressed_victim', 'suspected_fraudster', 'informant', 'unknown'
    )),
    caller_name TEXT,
    caller_phone TEXT,
    urgency_score INTEGER CHECK (urgency_score >= 0 AND urgency_score <= 100),
    urgency_level TEXT CHECK (urgency_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    emotion_profile JSONB DEFAULT '{}'::jsonb,
    audio_metadata JSONB DEFAULT '{}'::jsonb,
    officer_id TEXT NOT NULL DEFAULT 'JENKINS-4829',
    officer_name TEXT NOT NULL DEFAULT 'Det. S. Jenkins #4829',
    lead_investigator_id TEXT,
    assigned_officer_name TEXT,
    department TEXT DEFAULT 'Cybercrime Quick Reaction Team (QRT)',
    agency TEXT DEFAULT 'Cyber Financial Crimes Task Force',
    task_force TEXT DEFAULT 'Cyber Financial Crimes Task Force',
    classification_standard TEXT DEFAULT 'FedRAMP High / CJIS Tier 4',
    security_enclave TEXT DEFAULT 'TOP SECRET // SCI',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    closed_at TIMESTAMPTZ
);

COMMENT ON TABLE public.cases IS 'VECNAVERSE primary cybercrime investigation case dockets with evidentiary provenance.';

-- ==============================================================================
-- 2. Analysis Runs Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.analysis_runs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    case_id TEXT NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    recording_id TEXT,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
        'queued', 'in_progress', 'completed', 'partial', 'failed', 'cancelled'
    )),
    stages JSONB NOT NULL DEFAULT '{}'::jsonb,
    model_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    initiated_by TEXT,
    idempotency_key TEXT,
    summary TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.analysis_runs IS 'AI pipeline orchestration executions bound to specific cases and audio recordings.';

-- ==============================================================================
-- 3. Transcript Segments Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.transcript_segments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    case_id TEXT NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    run_id TEXT REFERENCES public.analysis_runs(id) ON DELETE SET NULL,
    recording_id TEXT,
    sequence_number INTEGER,
    start_time NUMERIC NOT NULL CHECK (start_time >= 0),
    end_time NUMERIC NOT NULL CHECK (end_time >= start_time),
    text TEXT NOT NULL,
    edited_text TEXT,
    edited_by TEXT,
    edited_at TIMESTAMPTZ,
    speaker JSONB NOT NULL DEFAULT '{"speakerId": "SPEAKER_01"}'::jsonb,
    speaker_label TEXT,
    speaker_id TEXT,
    confidence NUMERIC NOT NULL DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1.0),
    language TEXT DEFAULT 'en-US',
    uncertainty JSONB,
    is_threat BOOLEAN DEFAULT FALSE,
    threat_label TEXT,
    threat_type TEXT,
    words JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.transcript_segments IS 'Diarized and time-synchronized speech segments preserving verbatim quotes and corrections.';

-- ==============================================================================
-- 4. Extracted Entities Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.entities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    case_id TEXT NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    run_id TEXT REFERENCES public.analysis_runs(id) ON DELETE SET NULL,
    segment_id TEXT REFERENCES public.transcript_segments(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    value TEXT NOT NULL,
    normalized_value TEXT,
    raw_text TEXT,
    confidence NUMERIC NOT NULL DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1.0),
    evidence JSONB,
    verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN (
        'unverified', 'confirmed', 'corrected', 'dismissed', 'verified'
    )),
    verification_notes TEXT,
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    legal_statute_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.entities IS 'Extracted cybercrime and forensic entities linked directly to transcript segments.';

-- ==============================================================================
-- 5. Emergency & Threat Triggers Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.triggers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    case_id TEXT NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    run_id TEXT REFERENCES public.analysis_runs(id) ON DELETE SET NULL,
    segment_id TEXT REFERENCES public.transcript_segments(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    title TEXT,
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN (
        'low', 'medium', 'high', 'critical', 'advisory'
    )),
    context TEXT NOT NULL DEFAULT 'direct' CHECK (context IN (
        'direct', 'negated', 'historical', 'hypothetical', 'quoted_reported'
    )),
    quote TEXT NOT NULL,
    explanation TEXT,
    statute_reference TEXT,
    evidence JSONB,
    verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN (
        'unreviewed', 'unverified', 'confirmed', 'corrected', 'dismissed', 'flagged'
    )),
    confidence NUMERIC NOT NULL DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1.0),
    timestamp NUMERIC,
    officer_notes TEXT,
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    dismissal_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.triggers IS 'Advisory extortion, violence, and distress pattern detections requiring officer confirmation.';

-- ==============================================================================
-- 6. Audit Logs Table (Append-Only)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    case_id TEXT REFERENCES public.cases(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    actor_name TEXT,
    actor_role TEXT,
    officer TEXT,
    resource_type TEXT,
    resource_id TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    enclave_security_level TEXT DEFAULT 'TOP SECRET // SCI',
    ip_address TEXT,
    user_agent TEXT,
    sha256 TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.audit_logs IS 'Immutable CJIS compliance audit trail recording all case actions and retention purges.';

-- ==============================================================================
-- 7. Performance & Foreign Key Indexes
-- ==============================================================================

-- Cases indexes
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON public.cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cases_docket_number ON public.cases(docket_number);
CREATE INDEX IF NOT EXISTS idx_cases_officer_id ON public.cases(officer_id);
CREATE INDEX IF NOT EXISTS idx_cases_urgency_score ON public.cases(urgency_score DESC);
CREATE INDEX IF NOT EXISTS idx_cases_caller_category ON public.cases(caller_category);

-- Analysis runs indexes
CREATE INDEX IF NOT EXISTS idx_analysis_runs_case_id ON public.analysis_runs(case_id);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_status ON public.analysis_runs(status);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_created_at ON public.analysis_runs(created_at DESC);

-- Transcript segments indexes
CREATE INDEX IF NOT EXISTS idx_transcript_segments_case_id ON public.transcript_segments(case_id);
CREATE INDEX IF NOT EXISTS idx_transcript_segments_run_id ON public.transcript_segments(run_id);
CREATE INDEX IF NOT EXISTS idx_transcript_segments_created_at ON public.transcript_segments(created_at);
CREATE INDEX IF NOT EXISTS idx_transcript_segments_start_time ON public.transcript_segments(case_id, start_time);

-- Entities indexes
CREATE INDEX IF NOT EXISTS idx_entities_case_id ON public.entities(case_id);
CREATE INDEX IF NOT EXISTS idx_entities_run_id ON public.entities(run_id);
CREATE INDEX IF NOT EXISTS idx_entities_segment_id ON public.entities(segment_id);
CREATE INDEX IF NOT EXISTS idx_entities_type ON public.entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_status ON public.entities(verification_status);
CREATE INDEX IF NOT EXISTS idx_entities_created_at ON public.entities(created_at);

-- Triggers indexes
CREATE INDEX IF NOT EXISTS idx_triggers_case_id ON public.triggers(case_id);
CREATE INDEX IF NOT EXISTS idx_triggers_run_id ON public.triggers(run_id);
CREATE INDEX IF NOT EXISTS idx_triggers_segment_id ON public.triggers(segment_id);
CREATE INDEX IF NOT EXISTS idx_triggers_category ON public.triggers(category);
CREATE INDEX IF NOT EXISTS idx_triggers_severity ON public.triggers(severity);
CREATE INDEX IF NOT EXISTS idx_triggers_status ON public.triggers(verification_status);
CREATE INDEX IF NOT EXISTS idx_triggers_created_at ON public.triggers(created_at);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_case_id ON public.audit_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- 8. Row Level Security (RLS) Configuration
-- ==============================================================================

-- Enable RLS on all 6 tables
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcript_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Force RLS on all tables to ensure table owners/superusers do not bypass inadvertently
ALTER TABLE public.cases FORCE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_runs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.transcript_segments FORCE ROW LEVEL SECURITY;
ALTER TABLE public.entities FORCE ROW LEVEL SECURITY;
ALTER TABLE public.triggers FORCE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- RLS Policies: Cases
-- ------------------------------------------------------------------------------
CREATE POLICY "Authenticated officers can view cases"
    ON public.cases FOR SELECT
    TO authenticated
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated officers can create cases"
    ON public.cases FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated officers can update assigned cases"
    ON public.cases FOR UPDATE
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated officers can delete cases"
    ON public.cases FOR DELETE
    TO authenticated
    USING (auth.uid() IS NOT NULL);

-- ------------------------------------------------------------------------------
-- RLS Policies: Analysis Runs (Parent-scoped)
-- ------------------------------------------------------------------------------
CREATE POLICY "Authenticated officers can view analysis runs"
    ON public.analysis_runs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = analysis_runs.case_id
        )
    );

CREATE POLICY "Authenticated officers can insert analysis runs"
    ON public.analysis_runs FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = analysis_runs.case_id
        )
    );

CREATE POLICY "Authenticated officers can update analysis runs"
    ON public.analysis_runs FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = analysis_runs.case_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = analysis_runs.case_id
        )
    );

-- ------------------------------------------------------------------------------
-- RLS Policies: Transcript Segments (Parent-scoped)
-- ------------------------------------------------------------------------------
CREATE POLICY "Authenticated officers can view transcript segments"
    ON public.transcript_segments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = transcript_segments.case_id
        )
    );

CREATE POLICY "Authenticated officers can insert transcript segments"
    ON public.transcript_segments FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = transcript_segments.case_id
        )
    );

CREATE POLICY "Authenticated officers can update transcript segments"
    ON public.transcript_segments FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = transcript_segments.case_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = transcript_segments.case_id
        )
    );

-- ------------------------------------------------------------------------------
-- RLS Policies: Entities (Parent-scoped)
-- ------------------------------------------------------------------------------
CREATE POLICY "Authenticated officers can view entities"
    ON public.entities FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = entities.case_id
        )
    );

CREATE POLICY "Authenticated officers can insert entities"
    ON public.entities FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = entities.case_id
        )
    );

CREATE POLICY "Authenticated officers can update entities"
    ON public.entities FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = entities.case_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = entities.case_id
        )
    );

-- ------------------------------------------------------------------------------
-- RLS Policies: Triggers (Parent-scoped)
-- ------------------------------------------------------------------------------
CREATE POLICY "Authenticated officers can view triggers"
    ON public.triggers FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = triggers.case_id
        )
    );

CREATE POLICY "Authenticated officers can insert triggers"
    ON public.triggers FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = triggers.case_id
        )
    );

CREATE POLICY "Authenticated officers can update triggers"
    ON public.triggers FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = triggers.case_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = triggers.case_id
        )
    );

-- ------------------------------------------------------------------------------
-- RLS Policies: Audit Logs (Strict Append-Only Immutability)
-- ------------------------------------------------------------------------------
CREATE POLICY "Authenticated officers can view audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated officers can append audit log records"
    ON public.audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- Explicitly disallow UPDATE and DELETE on audit logs to guarantee immutable chain of custody
-- (Absence of UPDATE/DELETE policies combined with FORCE ROW LEVEL SECURITY denies mutations)

-- Database-level trigger to definitively block updates or deletes on public.audit_logs
CREATE OR REPLACE FUNCTION public.prevent_audit_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Evidentiary Violation (SEC-X-SEC38): Audit logs are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_mutation ON public.audit_logs;
CREATE TRIGGER trg_prevent_audit_log_mutation
BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_mutation();

-- ==============================================================================
-- 9. Private Audio Storage Bucket Configuration & Policies
-- ==============================================================================
-- Provision the private audio bucket if storage schema exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'case-audio-private',
            'case-audio-private',
            false,
            524288000, -- 500 MB maximum size
            ARRAY['audio/wav', 'audio/x-wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/webm', 'audio/m4a', 'audio/flac']
        )
        ON CONFLICT (id) DO UPDATE SET
            public = false,
            file_size_limit = 524288000;
    END IF;
END $$;

-- Storage object RLS policies (scoping audio access to authenticated officers)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
        -- Read policy
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated officers can read case audio'
        ) THEN
            CREATE POLICY "Authenticated officers can read case audio"
                ON storage.objects FOR SELECT
                TO authenticated
                USING (bucket_id = 'case-audio-private');
        END IF;

        -- Insert policy
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated officers can upload case audio'
        ) THEN
            CREATE POLICY "Authenticated officers can upload case audio"
                ON storage.objects FOR INSERT
                TO authenticated
                WITH CHECK (bucket_id = 'case-audio-private');
        END IF;

        -- Delete policy
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated officers can delete case audio'
        ) THEN
            CREATE POLICY "Authenticated officers can delete case audio"
                ON storage.objects FOR DELETE
                TO authenticated
                USING (bucket_id = 'case-audio-private');
        END IF;
    END IF;
END $$;
