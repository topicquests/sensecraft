-- Deploy sensecraft:members to pg
-- requires: basics

BEGIN;

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


COMMIT;
