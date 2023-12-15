-- Deploy members


BEGIN;

DROP VIEW IF EXISTS public.public_members;
ALTER TABLE public.members DROP CONSTRAINT IF EXISTS members_slug_key;
ALTER TABLE public.members DROP COLUMN "slug";
ALTER TABLE public.members ADD CONSTRAINT members_handle_key UNIQUE (handle);

COMMIT;
