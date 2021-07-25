-- Deploy sensecraft:members to pg
-- requires: basics

BEGIN;

\set dbo :dbn '__owner';
\set dbm :dbn '__member';
\set dbc :dbn '__client';

--
-- Name: members_id_seq; Type: SEQUENCE
--

CREATE SEQUENCE IF NOT EXISTS public.members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: members; Type: TABLE
--

CREATE TABLE IF NOT EXISTS public.members (
    id integer NOT NULL DEFAULT nextval('public.members_id_seq'::regclass),
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    handle character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL default now(),
    updated_at timestamp with time zone NOT NULL default now(),
    name character varying(255) NOT NULL,
    permissions public.permission[] DEFAULT ARRAY[]::public.permission[],
    CONSTRAINT members_pkey PRIMARY KEY (id),
    CONSTRAINT members_email_key UNIQUE (email),
    CONSTRAINT members_handle_key UNIQUE (handle)
);

--
-- Name: members_id_seq; Type: SEQUENCE OWNED BY
--

ALTER SEQUENCE public.members_id_seq OWNED BY public.members.id;


--
-- Name: TABLE members; Type: ACL
--

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.members TO :dbm;
GRANT SELECT,INSERT ON TABLE public.members TO :dbc;


--
-- Name: SEQUENCE members_id_seq; Type: ACL
--

GRANT USAGE ON SEQUENCE public.members_id_seq TO :dbc;



--
-- Name: role_to_handle(character varying); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.role_to_handle(role character varying) RETURNS character varying
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    BEGIN
      IF role ~ ('^' || current_database() || '__[mglq]_.+') THEN
        RETURN substr(role, char_length(current_database())+5);
      ELSE
        RETURN NULL;
      END IF;
    END;
    $$;


--
-- Name: scmember_handle(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.scmember_handle() RETURNS character varying
    LANGUAGE plpgsql STABLE
    AS $$
    BEGIN
    RETURN role_to_handle(cast(current_user as varchar));
    END;
    $$;


--
-- Name: current_member_id(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.current_member_id() RETURNS integer
    LANGUAGE plpgsql STABLE
    AS $$
    BEGIN RETURN (SELECT id FROM members WHERE scmember_handle() = handle);
END;
    $$;



--
-- Name: has_permission(character varying); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.has_permission(permission character varying) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
    BEGIN RETURN current_user = current_database()||'__owner' OR COALESCE((SELECT permissions && CAST(ARRAY['superadmin', permission] AS permission[])
        FROM members where handle = scmember_handle()), FALSE);
      END;
      $$;



--
-- Name: get_token(character varying, character varying); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.get_token(mail character varying, pass character varying) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
    DECLARE role varchar;
    DECLARE passh varchar;
    BEGIN
      SELECT CONCAT(current_database() || '__m_', handle), password INTO STRICT role, passh FROM members WHERE email = mail;
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
-- Name: before_create_member(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.before_create_member() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE curuser varchar;
    DECLARE newmember varchar;
    BEGIN
      newmember := current_database() || '__m_' || NEW.handle;
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

CREATE TRIGGER before_create_member BEFORE INSERT ON public.members FOR EACH ROW EXECUTE FUNCTION public.before_create_member();

--
-- Name: before_update_member(); Type: FUNCTION
--

CREATE OR REPLACE FUNCTION public.before_update_member() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE curuser varchar;
    BEGIN
      IF NEW.handle <> OLD.handle THEN
        RETURN NULL;
      END IF;
      curuser := current_user;
      NEW.updated_at := now();
      EXECUTE 'SET LOCAL ROLE ' || current_database() || '__owner';
      IF ('superadmin' = ANY(NEW.permissions)) AND NOT ('superadmin' = ANY(OLD.permissions)) THEN
        EXECUTE 'ALTER GROUP '||current_database()||'__owner ADD USER ' || current_database() || '__m_' || NEW.handle;
      END IF;
      IF ('superadmin' = ANY(OLD.permissions)) AND NOT ('superadmin' = ANY(NEW.permissions)) THEN
        EXECUTE 'ALTER GROUP '||current_database()||'__owner DROP USER ' || current_database() || '__m_' || NEW.handle;
      END IF;
      EXECUTE 'SET LOCAL ROLE ' || curuser;
      RETURN NEW;
    END;
    $$;

CREATE TRIGGER before_update_member BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.before_update_member();


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
      oldmember := database || '__m_' || OLD.handle;
      owner := database || '__owner';
      EXECUTE 'SET LOCAL ROLE ' || owner;
      EXECUTE 'DROP ROLE ' || oldmember;
      RETURN NEW;
    END;
    $$;


CREATE TRIGGER after_delete_member AFTER DELETE ON public.members FOR EACH ROW EXECUTE FUNCTION public.after_delete_member();



ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY members_update_policy ON public.members FOR UPDATE USING (id = current_member_id() OR has_permission('superadmin'));
CREATE POLICY members_delete_policy ON public.members FOR DELETE USING (id = current_member_id() OR has_permission('superadmin'));
CREATE POLICY members_insert_policy ON public.members FOR INSERT WITH CHECK (true);
CREATE POLICY members_select_policy ON public.members FOR SELECT USING (true);

COMMIT;
