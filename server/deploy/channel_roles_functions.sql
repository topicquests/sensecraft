-- Deploy channel_role_functions
-- requires: channel_roles
-- idempotent

BEGIN;
CREATE OR REPLACE FUNCTION public.channel_roles_in_guild(guild_id integer)
RETURNS setof channel_roles
language sql
stable
as $$
  select *
  from channel_roles
  where guild_id = channel_roles_in_guild.guild_id;
$$;

COMMIT;
