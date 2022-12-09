-- Deploy sensecraft:members_functions to pg
-- requires: members
-- idempotent

BEGIN;

\set dbo :dbn '__owner';
\set dbm :dbn '__member';
\set dbc :dbn '__client';


--
-- Name: TABLE members; Type: ACL
--

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.members TO :dbm;
GRANT INSERT ON TABLE public.members TO :dbc;

REVOKE SELECT ON TABLE public.members FROM :dbc;
GRANT SELECT (id, handle, slug, permissions) ON TABLE public.members TO :dbc;
GRANT SELECT ON public.public_members TO :dbc;
GRANT SELECT ON public.public_members TO :dbm;

--
-- Name: SEQUENCE members_id_seq; Type: ACL
--

GRANT USAGE ON SEQUENCE public.members_id_seq TO :dbc;



--
-- Name: role_to_id(character varying); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.role_to_id(role character varying) RETURNS integer
AS $$
  SELECT CASE
    role ~ ('^' || current_database() || '__[mglq]_\d+')
    WHEN true THEN
      substr(role, char_length(current_database())+5)::integer
    ELSE
      NULL
    END;
$$ LANGUAGE SQL IMMUTABLE;


--
-- Name: current_member_id(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.current_member_id() RETURNS integer
AS $$
  SELECT role_to_id(cast(current_user as varchar));
$$ LANGUAGE SQL STABLE;


--
-- Name: current_member(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.current_member() RETURNS public.members
AS $$
  SELECT * from public.members WHERE id = public.current_member_id()
$$ LANGUAGE SQL STABLE;

--
-- Name: is_superadmin(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.is_superadmin() RETURNS boolean
AS $$
  SELECT (current_user = current_database()||'__owner') OR count(*) > 0
    FROM pg_catalog.pg_roles r JOIN pg_catalog.pg_auth_members m
    ON (m.member = r.oid)
    JOIN pg_roles r1 ON (m.roleid=r1.oid)
    WHERE r1.rolname = current_database()||'__owner'
    AND r.rolname=current_user
$$ LANGUAGE SQL STABLE;


--
-- Name: has_permission(character varying); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.has_permission(permission character varying) RETURNS boolean
AS $$
  SELECT public.is_superadmin() OR (current_member_id() IS NOT NULL AND
    COALESCE((SELECT permissions && CAST(ARRAY['superadmin', permission] AS permission[])
      FROM members where id=current_member_id()), FALSE));
$$ LANGUAGE SQL STABLE;


--
-- Name: get_token(character varying, character varying); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.get_token(mail character varying, pass character varying) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
    DECLARE role varchar;
    DECLARE passh varchar;
    DECLARE curuser varchar;
    BEGIN
      curuser := current_user;
      EXECUTE 'SET LOCAL ROLE ' || current_database() || '__owner';
      SELECT CONCAT(current_database() || '__m_', id), password INTO STRICT role, passh FROM members WHERE email = mail;
      EXECUTE 'SET LOCAL ROLE ' || curuser;
      IF passh = crypt(pass, passh) THEN
        SELECT sign(row_to_json(r), current_setting('app.jwt_secret')) INTO STRICT passh FROM (
          SELECT role, extract(epoch from now())::integer + 1000 AS exp) r;
        RETURN passh;
      ELSE
        RETURN NULL;
      END IF;
    END;
$$;


--
-- Name: renew_token(character varying); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.renew_token(token character varying) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
    DECLARE p json;
    DECLARE t varchar;
    DECLARE v boolean;
    BEGIN
      SELECT payload, valid INTO STRICT p, v FROM verify(token, current_setting('app.jwt_secret'));
      IF NOT v THEN
        RETURN NULL;
      END IF;
      IF (p ->> 'exp')::integer < extract(epoch from now())::integer THEN
        RETURN NULL;
      END IF;
      SELECT sign(row_to_json(r), current_setting('app.jwt_secret')) INTO STRICT t FROM (
        SELECT (p ->> 'role') as role, extract(epoch from now())::integer + 1000 AS exp) r;
      RETURN t;
    END;
    $$;


--
-- Name: after_create_member(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.after_create_member() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE curuser varchar;
    DECLARE newmember varchar;
    BEGIN
      newmember := current_database() || '__m_' || NEW.id;
      curuser := current_user;
      EXECUTE 'SET LOCAL ROLE ' || current_database() || '__owner';
      EXECUTE 'CREATE ROLE ' || newmember || ' INHERIT IN GROUP ' || current_database() || '__member';
      EXECUTE 'ALTER GROUP ' || newmember || ' ADD USER ' || current_database() || '__client';
      IF 'superadmin' = ANY(NEW.permissions) THEN
        EXECUTE 'ALTER GROUP '||current_database()||'__owner ADD USER ' || newmember;
      END IF;
      EXECUTE 'SET LOCAL ROLE ' || curuser;
      RETURN NEW;
    END;
    $$;

DROP TRIGGER IF EXISTS after_create_member ON public.members;
CREATE TRIGGER after_create_member AFTER INSERT ON public.members FOR EACH ROW EXECUTE FUNCTION public.after_create_member();

--
-- Name: before_update_member(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.before_update_member() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE curuser varchar;
    BEGIN
      curuser := current_user;
      NEW.updated_at := now();
      IF NEW.permissions != OLD.permissions AND NOT public.is_superadmin() THEN
        RAISE EXCEPTION 'permission superadmin / change user permissions';
      END IF;
      EXECUTE 'SET LOCAL ROLE ' || current_database() || '__owner';
      IF ('superadmin' = ANY(NEW.permissions)) AND NOT ('superadmin' = ANY(OLD.permissions)) THEN
        EXECUTE 'ALTER GROUP '||current_database()||'__owner ADD USER ' || current_database() || '__m_' || NEW.id;
      END IF;
      IF ('superadmin' = ANY(OLD.permissions)) AND NOT ('superadmin' = ANY(NEW.permissions)) THEN
        EXECUTE 'ALTER GROUP '||current_database()||'__owner DROP USER ' || current_database() || '__m_' || NEW.id;
      END IF;
      EXECUTE 'SET LOCAL ROLE ' || curuser;
      RETURN NEW;
    END;
    $$;

DROP TRIGGER IF EXISTS before_update_member ON public.members;
CREATE TRIGGER before_update_member BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.before_update_member();


CREATE OR REPLACE FUNCTION public.before_create_member() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE num_mem integer;
    BEGIN
      SELECT count(id) INTO STRICT num_mem FROM public_members;
      IF num_mem = 0 THEN
        -- give superadmin to first registered user
        NEW.permissions = ARRAY['superadmin'::permission];
      ELSE
        IF NOT public.has_permission('superadmin') THEN
          NEW.permissions = ARRAY[]::permission[];
        END IF;
      END IF;
      RETURN NEW;
    END;
    $$;

DROP TRIGGER IF EXISTS before_create_member ON public.members;
CREATE TRIGGER before_create_member BEFORE INSERT ON public.members FOR EACH ROW EXECUTE FUNCTION public.before_create_member();


CREATE OR REPLACE FUNCTION create_member(
  name character varying, email character varying, password character varying, handle character varying,
  permissions permission[] DEFAULT ARRAY[]::permission[]
  ) RETURNS INTEGER VOLATILE AS $$
  INSERT INTO members (name, email, password, handle, permissions) VALUES ($1, $2, crypt($3, gen_salt('bf')), $4, $5);
  -- cannot use RETURNING because of select permissions
  SELECT id FROM public_members WHERE handle=$4;
$$ LANGUAGE SQL;

GRANT EXECUTE ON FUNCTION create_member(character varying, character varying, character varying, character varying, permissions permission[]) TO :dbc;

--
-- Name: after_delete_member(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.after_delete_member() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE database varchar;
    DECLARE oldmember varchar;
    DECLARE owner varchar;
    BEGIN
      database := current_database();
      oldmember := database || '__m_' || OLD.id;
      owner := database || '__owner';
      EXECUTE 'SET LOCAL ROLE ' || owner;
      EXECUTE 'DROP ROLE ' || oldmember;
      RETURN NEW;
    END;
    $$;


DROP TRIGGER IF EXISTS after_delete_member ON public.members;
CREATE TRIGGER after_delete_member AFTER DELETE ON public.members FOR EACH ROW EXECUTE FUNCTION public.after_delete_member();



ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS members_update_policy ON public.members;
CREATE POLICY members_update_policy ON public.members FOR UPDATE USING (id = current_member_id() OR public.is_superadmin());
DROP POLICY IF EXISTS members_delete_policy ON public.members;
CREATE POLICY members_delete_policy ON public.members FOR DELETE USING (id = current_member_id() OR public.is_superadmin());
DROP POLICY IF EXISTS members_insert_policy ON public.members;
CREATE POLICY members_insert_policy ON public.members FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS members_select_policy ON public.members;
CREATE POLICY members_select_policy ON public.members FOR SELECT USING (id = current_member_id() OR public.is_superadmin());

COMMIT;
