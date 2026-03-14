-- Deploy casting migration
-- Add createRoleChannel permission to existing records and change default

BEGIN;

-- following operation needs disabling trigger
DROP TRIGGER IF EXISTS before_update_casting ON public.casting;
-- Update all existing casting records to include createRoleChannel permission
UPDATE public.casting
SET permissions = array_append(permissions, 'createRoleChannel'::public.permission)
WHERE NOT ('createRoleChannel'::public.permission = ANY(permissions));
-- reinstate trigger
CREATE TRIGGER before_update_casting BEFORE UPDATE ON public.casting FOR EACH ROW EXECUTE FUNCTION public.before_update_casting();

-- Change the default value for new records
ALTER TABLE public.casting
ALTER COLUMN permissions SET DEFAULT ARRAY['createRoleChannel']::public.permission[];

COMMIT;
