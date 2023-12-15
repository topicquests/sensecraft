-- Deploy sensecraft:basics to pg

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS ltree WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


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
    'joinQuest',
    'createPlayChannel',
    'createGuildChannel',
    'editConversationNode',
    'addAvailableRole',
    'setPlayerRole',
    'createGuildRole',
    'createSystemRole',
    'changeFocus'
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
-- Name: game_play_status; Type: TYPE
--

CREATE TYPE public.game_play_status AS ENUM (
    'cancelled',
    'interested',
    'confirmed',
    'team_full'
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

CREATE TYPE public.ibis_node_type AS ENUM (
  'question',
  'answer',
  'pro',
  'con',
  'reference',
  'channel',
  'con_answer'
);

CREATE TYPE public.publication_state AS ENUM (
    'obsolete',
    'private_draft',
    'role_draft',
    'guild_draft',
    'proposed',
    'submitted',
    'published'
);

CREATE TYPE public.meta_state AS ENUM (
  'conversation',
  'meta',
  'channel'
);

COMMIT;
