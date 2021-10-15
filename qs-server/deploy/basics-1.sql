-- Deploy sensecraft:basics to pg

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS ltree WITH SCHEMA public;


--
-- Name: player_role; Type: TYPE
--

CREATE TYPE public.player_role AS ENUM (
    'Critic'
);


--
-- Name: permission; Type: TYPE
--

CREATE TYPE public.permission AS ENUM (
    'superadmin',
    'viewGuild',
    'viewQuest',
    'createQuest',
    'createGuild',
    'acceptGuildMembership',
    'revokeGuildMembership',
    'proposeGuildMembership',
    'publishGameMove',
    'retractGameMove',
    'acceptQuestMembership',
    'revokeQuestMembership',
    'proposeQuestMembership',
    'rejectGameMove',
    'guildAdmin',
    'joinQuest'
);


--
-- Name: registration_status; Type: TYPE
--

CREATE TYPE public.registration_status AS ENUM (
    'request',
    'invitation',
    'confirmed'
);


--
-- Name: quest_status; Type: TYPE
--

CREATE TYPE public.quest_status AS ENUM (
    'draft',
    'registration',
    'ongoing', 
    'paused',
    'scoring',
    'finished'
);

COMMIT;
