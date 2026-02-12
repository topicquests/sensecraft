-- Deploy casting migration
-- Add createRoleChannel permission to existing records and change default

BEGIN;

-- Update all existing casting records to include createRoleChannel permission
UPDATE public.casting 
SET permissions = array_append(permissions, 'createRoleChannel'::public.permission)
WHERE NOT ('createRoleChannel'::public.permission = ANY(permissions));

-- Change the default value for new records
ALTER TABLE public.casting 
ALTER COLUMN permissions SET DEFAULT ARRAY['createRoleChannel']::public.permission[];

COMMIT;
