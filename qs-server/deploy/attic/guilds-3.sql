-- Deploy sensecraft:guilds to pg
-- requires: members

BEGIN;


--
-- Name: guilds_id_seq; Type: SEQUENCE
--

CREATE SEQUENCE IF NOT EXISTS public.guilds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: guilds; Type: TABLE
--

CREATE TABLE IF NOT EXISTS public.guilds (
    id integer NOT NULL DEFAULT nextval('public.guilds_id_seq'::regclass),
    handle character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    creator integer,
    public boolean default true,
    open_for_applications boolean default true,
    created_at timestamp with time zone NOT NULL default now(),
    updated_at timestamp with time zone NOT NULL default now(),
    application_needs_approval boolean default false,
    slug character varying(255) GENERATED ALWAYS AS (slugify(handle)) STORED,
    CONSTRAINT guilds_pkey PRIMARY KEY (id),
    CONSTRAINT guilds_slug_key UNIQUE (slug),
    CONSTRAINT guilds_creator_fkey FOREIGN KEY (creator)
      REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE SET NULL
);




--
-- Name: guilds_id_seq; Type: SEQUENCE OWNED BY
--

ALTER SEQUENCE public.guilds_id_seq OWNED BY public.guilds.id;


--
-- Name: public_guilds; Type: VIEW
--

CREATE OR REPLACE VIEW public.public_guilds AS
 SELECT guilds.id,
    guilds.handle,
    guilds.name,
    guilds.description,
    guilds.creator,
    guilds.public,
    guilds.open_for_applications,
    guilds.created_at,
    guilds.updated_at,
    guilds.slug
   FROM public.guilds
  WHERE guilds.public;



--
-- Name: guild_membership; Type: TABLE
--

CREATE TABLE IF NOT EXISTS public.guild_membership (
    guild_id integer NOT NULL,
    member_id integer NOT NULL,
    permissions public.permission[] DEFAULT ARRAY[]::permission[],
    status public.registration_status DEFAULT 'confirmed'::public.registration_status,
    created_at timestamp with time zone NOT NULL default now(),
    updated_at timestamp with time zone NOT NULL default now(),
    CONSTRAINT guild_membership_pkey PRIMARY KEY (guild_id, member_id),
    CONSTRAINT guild_membership_guild_id_fkey FOREIGN KEY (guild_id)
      REFERENCES public.guilds(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT guild_membership_member_id_fkey FOREIGN KEY (member_id)
      REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE
);


COMMIT;
