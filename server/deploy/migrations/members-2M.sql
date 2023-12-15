-- Deploy members


BEGIN;

ALTER TABLE public.members ADD COLUMN last_login timestamp with time zone;
ALTER TABLE public.members ADD COLUMN last_login_email_sent timestamp with time zone;
ALTER TABLE public.members ADD COLUMN confirmed boolean NOT NULL DEFAULT false;

COMMIT;
