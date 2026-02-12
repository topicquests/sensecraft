-- Revert casting_role


BEGIN;

DROP TABLE IF EXISTS public.casting_role CASCADE;
DROP TABLE IF EXISTS public.guild_member_available_role CASCADE;

COMMIT;
