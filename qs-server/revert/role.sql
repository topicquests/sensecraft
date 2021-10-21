-- Deploy role


BEGIN;
DROP TABLE IF EXISTS public.casting_role;
DROP TABLE IF EXISTS public.guild_member_available_role;
DROP TABLE IF EXISTS public.role;
COMMIT;
