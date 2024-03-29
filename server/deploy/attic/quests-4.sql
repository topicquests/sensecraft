-- Deploy sensecraft:quests to pg
-- requires: members

BEGIN;

--
-- Name: quests_id_seq; Type: SEQUENCE
--

CREATE SEQUENCE IF NOT EXISTS public.quests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quests; Type: TABLE
--

CREATE TABLE IF NOT EXISTS public.quests (
    id integer NOT NULL DEFAULT nextval('public.quests_id_seq'::regclass),
    handle character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    creator integer,
    public boolean default true,
    status public.quest_status default 'draft',
    start timestamp with time zone NOT NULL,
    "end" timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL default now(),
    updated_at timestamp with time zone NOT NULL default now(),
    slug character varying(255) GENERATED ALWAYS AS (slugify(handle)) STORED,
    CONSTRAINT quests_pkey PRIMARY KEY (id),
    CONSTRAINT quests_slug_key UNIQUE (slug),
    CONSTRAINT quests_creator_fkey FOREIGN KEY (creator)
      REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE SET NULL
);

--
-- Name: quests_id_seq; Type: SEQUENCE OWNED BY
--

ALTER SEQUENCE public.quests_id_seq OWNED BY public.quests.id;


--
-- Name: quest_membership; Type: TABLE
--

CREATE TABLE IF NOT EXISTS public.quest_membership (
    quest_id integer NOT NULL,
    member_id integer NOT NULL,
    confirmed boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL default now(),
    updated_at timestamp with time zone NOT NULL default now(),
    permissions public.permission[] DEFAULT ARRAY[]::permission[],
    CONSTRAINT quest_membership_pkey PRIMARY KEY (quest_id, member_id),
    CONSTRAINT quest_membership_quest_id_fkey FOREIGN KEY (quest_id)
      REFERENCES public.quests(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT quest_membership_member_id_fkey FOREIGN KEY (member_id)
      REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE
);


COMMIT;
