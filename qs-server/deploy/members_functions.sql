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
    WHERE r1.rolname = current_database()||'__admin'
    AND r.rolname=current_user AND r.rolinherit;
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
    DECLARE is_confirmed boolean;
    BEGIN
      curuser := current_user;
      EXECUTE 'SET LOCAL ROLE ' || current_database() || '__rolemaster';
      SELECT CONCAT(current_database() || '__m_', id), password, confirmed INTO STRICT role, passh, is_confirmed FROM members WHERE email = mail;
      IF NOT is_confirmed THEN
        RAISE EXCEPTION 'invalid confirmed / Cannot login until confirmed';
      END IF;
      IF passh = crypt(pass, passh) THEN
        SELECT sign(row_to_json(r), current_setting('app.jwt_secret')) INTO STRICT passh FROM (
          SELECT role, extract(epoch from now())::integer + 1000 AS exp) r;
        UPDATE members SET last_login = now() WHERE email=mail;
        EXECUTE 'SET LOCAL ROLE ' || curuser;
        RETURN passh;
      ELSE
        EXECUTE 'SET LOCAL ROLE ' || curuser;
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
    DECLARE curuser varchar;
    DECLARE member_id integer;
    BEGIN
      SELECT payload, valid INTO STRICT p, v FROM verify(token, current_setting('app.jwt_secret'));
      IF NOT v THEN
        RETURN NULL;
      END IF;
      IF (p ->> 'exp')::integer < extract(epoch from now())::integer THEN
        RETURN NULL;
      END IF;
      SELECT role_to_id(p ->> 'role') INTO STRICT member_id;
      IF member_id != (SELECT id FROM members WHERE id = member_id) THEN
        RETURN NULL;
      END IF;
      SELECT sign(row_to_json(r), current_setting('app.jwt_secret')) INTO STRICT t FROM (
        SELECT (p ->> 'role') as role, extract(epoch from now())::integer + 1000 AS exp) r;
      curuser := current_user;
      EXECUTE 'SET LOCAL ROLE ' || current_database() || '__rolemaster';
      UPDATE members SET last_login = now(), confirmed = true WHERE id=member_id;
      EXECUTE 'SET LOCAL ROLE ' || curuser;
      RETURN t;
    END;
    $$;

CREATE OR REPLACE FUNCTION public.send_login_email(email varchar) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
    DECLARE curuser varchar;
    DECLARE role varchar;
    DECLARE name varchar;
    DECLARE id integer;
    DECLARE confirmed boolean;
    DECLARE last_login_email_sent timestamp with time zone;
    DECLARE passh varchar;
    BEGIN
      curuser := current_user;
      EXECUTE 'SET LOCAL ROLE ' || current_database() || '__rolemaster';
      SELECT m.id, m.name, m.confirmed, m.last_login_email_sent, CONCAT(current_database() || '__m_', m.id)
        INTO id, name, confirmed, last_login_email_sent, role
        FROM members as m WHERE m.email = send_login_email.email;
      IF id IS NOT NULL THEN
        IF last_login_email_sent IS NOT NULL AND now() - last_login_email_sent < '@1M' THEN
          RAISE EXCEPTION 'too soon';  -- TODO: ensure base format
        END IF;
        SELECT sign(row_to_json(r), current_setting('app.jwt_secret')) INTO STRICT passh FROM (
            SELECT role, extract(epoch from now())::integer + 10000 AS exp) r;
        PERFORM pg_notify(current_database(), concat('E email ', id, ' ', email, ' ',confirmed, ' ',passh, ' ',name));
      END IF;
      EXECUTE 'SET LOCAL ROLE ' || curuser;
      RETURN true;
    END;
    $$;


GRANT EXECUTE ON FUNCTION send_login_email(character varying) TO :dbc;

--
-- Name: after_create_member(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.after_create_member() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE curuser varchar;
    DECLARE newmember varchar;
    DECLARE temp boolean;
    BEGIN
      newmember := current_database() || '__m_' || NEW.id;
      curuser := current_user;
      EXECUTE 'SET LOCAL ROLE ' || current_database() || '__rolemaster';
      EXECUTE 'CREATE ROLE ' || newmember || ' INHERIT IN GROUP ' || current_database() || '__member';
      EXECUTE 'ALTER GROUP ' || newmember || ' ADD USER ' || current_database() || '__client';
      IF 'superadmin' = ANY(NEW.permissions) THEN
        EXECUTE 'ALTER GROUP '||current_database()||'__admin ADD USER ' || newmember;
      END IF;
      EXECUTE 'SET LOCAL ROLE ' || curuser;
      SELECT send_login_email(NEW.email) INTO temp;
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
      IF NEW.password != OLD.password THEN
        IF NEW.id != current_member_id() THEN
          RAISE EXCEPTION 'permission / change user password';
        END IF;
        NEW.password = crypt(NEW.password, gen_salt('bf'));
      END IF;
      NEW.updated_at := now();
      IF NEW.permissions != OLD.permissions AND NOT public.is_superadmin() THEN
        RAISE EXCEPTION 'permission superadmin / change user permissions';
      END IF;
      EXECUTE 'SET LOCAL ROLE ' || current_database() || '__rolemaster';
      IF ('superadmin' = ANY(NEW.permissions)) AND NOT ('superadmin' = ANY(OLD.permissions)) THEN
        EXECUTE 'ALTER GROUP '||current_database()||'__admin ADD USER ' || current_database() || '__m_' || NEW.id;
      END IF;
      IF ('superadmin' = ANY(OLD.permissions)) AND NOT ('superadmin' = ANY(NEW.permissions)) THEN
        EXECUTE 'ALTER GROUP '||current_database()||'__admin DROP USER ' || current_database() || '__m_' || NEW.id;
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
        NEW.confirmed = true;
      ELSE
        IF NOT public.has_permission('superadmin') THEN
          NEW.permissions = ARRAY[]::permission[];
          NEW.confirmed = false;
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
    DECLARE curuser varchar;
    BEGIN
      database := current_database();
      curuser := current_user;
      oldmember := database || '__m_' || OLD.id;
      EXECUTE 'SET LOCAL ROLE ' || current_database() || '__rolemaster';
      EXECUTE 'DROP ROLE ' || oldmember;
      EXECUTE 'SET LOCAL ROLE ' || curuser;
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
