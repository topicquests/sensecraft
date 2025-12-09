-- Deploy channel_roles_functions
-- requires: guilds
-- requires: channel_roles
-- requires: quests_functions
-- idempotent

BEGIN;

\set dbo :dbn '__owner';
\set dbm :dbn '__member';
\set dbc :dbn '__client';

-- Indexes
DROP INDEX IF EXISTS channel_roles_guild_id_idx;
CREATE INDEX channel_roles_guild_id_idx ON channel_roles USING HASH (guild_id);

DROP INDEX IF EXISTS channel_roles_channel_id_idx;
CREATE INDEX channel_roles_channel_id_idx ON channel_roles USING HASH (id);

-- Grants
GRANT SELECT, INSERT, DELETE, UPDATE ON TABLE public.channel_roles TO :dbm;
GRANT USAGE ON SEQUENCE public.channel_roles_id_seq TO :dbm;
GRANT SELECT ON TABLE public.channel_roles TO :dbc;

-- Function: get roles for a guild
CREATE OR REPLACE FUNCTION public.guild_channel_roles(guild_id INTEGER)
RETURNS SETOF channel_roles
LANGUAGE SQL STABLE
AS $$
  SELECT *
  FROM channel_roles
  WHERE guild_id = $1;
$$;

-- Function: check if member has role in channel
CREATE OR REPLACE FUNCTION public.has_channel_role(id INTEGER, member_id INTEGER, role_id INTEGER)
RETURNS BOOLEAN
LANGUAGE SQL STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM channel_roles cr
    JOIN casting_role crs ON cr.role_id = crs.role_id
    WHERE cr.id = $1
      AND crs.member_id = $2
      AND cr.role_id = $3
  );
$$;

-- Function: populate channel roles from JSON input
CREATE OR REPLACE FUNCTION public.populate_channel_roles(data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  role_rec channel_roles%ROWTYPE;
  id_map JSONB := '{}'::jsonb;
  r JSONB;
BEGIN
  FOR r IN SELECT value FROM jsonb_array_elements(data)
  LOOP
    INSERT INTO channel_roles (guild_id, id, role_id)
    VALUES (
      (r->>'guild_id')::INTEGER,
      (r->>'id')::INTEGER,
      (r->>'role_id')::INTEGER
    )
    RETURNING * INTO role_rec;

    IF r->>'lid' IS NOT NULL THEN
      id_map := jsonb_set(id_map, ARRAY[r->>'lid'], to_jsonb(role_rec.id));
    END IF;
  END LOOP;
  RETURN id_map;
END$$;

-- Trigger: after insert channel_role
CREATE OR REPLACE FUNCTION public.after_insert_channel_role() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM pg_notify(current_database(), concat('C channel_roles ', NEW.id));
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS after_insert_channel_role ON channel_roles;
CREATE TRIGGER after_insert_channel_role
AFTER INSERT ON public.channel_roles
FOR EACH ROW EXECUTE FUNCTION public.after_insert_channel_role();

-- RLS policies
ALTER TABLE public.channel_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS channel_roles_select_policy ON public.channel_roles;
CREATE POLICY channel_roles_select_policy ON public.channel_roles FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM casting_role cr
    WHERE cr.member_id = current_member_id()
      AND cr.role_id = channel_roles.role_id
  )
);

DROP POLICY IF EXISTS channel_roles_insert_policy ON public.channel_roles;
CREATE POLICY channel_roles_insert_policy ON public.channel_roles FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM casting_role cr
    WHERE cr.member_id = current_member_id()
      AND cr.role_id = channel_roles.role_id
  )
);

COMMIT;
