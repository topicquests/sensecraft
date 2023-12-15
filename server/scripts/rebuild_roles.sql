BEGIN;

DO $$
DECLARE role_name VARCHAR;
DECLARE entity_id INTEGER;
DECLARE member_id_ INTEGER;
DECLARE temp BOOLEAN;
DECLARE curuser VARCHAR;
BEGIN
  curuser := current_user;
  EXECUTE 'SET LOCAL ROLE ' || current_database() || '__rolemaster';
  -- delete all roles
  FOR role_name IN
    SELECT rolname FROM pg_catalog.pg_roles
    WHERE rolname LIKE current_database() || '\_\__\_%'
  LOOP
    EXECUTE 'DROP ROLE ' || role_name;
  END LOOP;
  -- recreate members
  FOR member_id_, temp IN
    SELECT id, 'superadmin' = ANY(permissions) FROM public.members
  LOOP
    role_name := current_database() || '__m_' || member_id_;
    EXECUTE 'CREATE ROLE ' || role_name || ' INHERIT IN GROUP ' || current_database() || '__member';
    EXECUTE 'ALTER GROUP ' || role_name || ' ADD USER ' || current_database() || '__client';
    IF temp THEN
      EXECUTE 'ALTER GROUP '||current_database()||'__owner ADD USER ' || role_name;
    END IF;
  END LOOP;
  -- recreate quests
  FOR entity_id IN
    SELECT id FROM public.quests
  LOOP
    EXECUTE 'CREATE ROLE ' || current_database() || '__q_' || entity_id;
  END LOOP;
  FOR entity_id, member_id_ IN
    SELECT quest_id, member_id FROM public.quest_membership WHERE confirmed
  LOOP
    EXECUTE 'ALTER GROUP ' || current_database() || '__q_' || entity_id || ' ADD USER ' || current_database() || '__m_' || member_id_;
  END LOOP;
  -- recreate guilds
  FOR entity_id IN
    SELECT id FROM public.guilds
  LOOP
    EXECUTE 'CREATE ROLE ' || current_database() || '__g_' || entity_id;
    EXECUTE 'CREATE ROLE ' || current_database() || '__l_' || entity_id;
  END LOOP;
  FOR entity_id, member_id_, temp IN
    SELECT guild_id, member_id, 'guildAdmin' = ANY(permissions) FROM public.guild_membership WHERE status = 'confirmed'
  LOOP
    EXECUTE 'ALTER GROUP ' || current_database() || '__g_' || entity_id || ' ADD USER ' || current_database() || '__m_' || member_id_;
    IF temp THEN
      EXECUTE 'ALTER GROUP ' || current_database() || '__l_' || entity_id || ' ADD USER ' || current_database() || '__m_' || member_id_;
    END IF;
  END LOOP;

  EXECUTE 'SET LOCAL ROLE ' || curuser;
END$$;


COMMIT;
