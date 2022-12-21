-- Deploy data_views
-- requires: game_play
-- requires: conversation_node
-- requires: casting
-- requires: quests_functions
-- requires: guilds_functions
-- idempotent

BEGIN;

\set dbc :dbn '__client';
\set dbm :dbn '__member';

CREATE OR REPLACE VIEW public.quests_data AS
  SELECT
    quests.id AS id,
    quests.handle AS handle,
    quests.name AS name,
    quests.description AS description,
    quests.creator AS creator,
    quests.public AS public,
    quests.status AS status,
    quests.start as start,
    quests."end" as "end",
    quests.created_at AS created_at,
    quests.updated_at AS updated_at,
    quests.slug AS slug,
    max(conversation_node.published_at) AS last_node_published_at,
    count(DISTINCT conversation_node.id) AS node_count,
    count(DISTINCT game_play_confirmed.guild_id) AS confirmed_guild_count,
    count(DISTINCT game_play_recruiting.guild_id) AS interested_guild_count,
    count(DISTINCT casting.member_id) AS player_count,
    count(my_casting) > 0 AS is_playing,
    count(DISTINCT my_confirmed_guild_membership.guild_id) AS my_confirmed_guild_count,
    count(DISTINCT my_recruiting_guild_membership.guild_id) AS my_recruiting_guild_count,
    count(my_quest_memberships) > 0 OR quests.creator = public.current_member_id() AS is_quest_member,
    quests.turn_based
  FROM public.quests
  LEFT JOIN public.my_quest_memberships
    ON (quests.id = my_quest_memberships.quest_id
        AND my_quest_memberships.confirmed
        AND my_quest_memberships.member_id = public.current_member_id())
  LEFT JOIN public.casting ON (casting.quest_id = quests.id)
  LEFT JOIN public.casting AS my_casting
    ON (my_casting.quest_id = quests.id
        AND my_casting.member_id = public.current_member_id())
  LEFT JOIN public.game_play AS game_play_confirmed
    ON (quests.id = game_play_confirmed.quest_id
        AND game_play_confirmed.status = 'confirmed'
        AND game_play_confirmed.game_status >= 'confirmed')
  LEFT JOIN public.guild_membership AS my_confirmed_guild_membership
    ON (my_confirmed_guild_membership.member_id = public.current_member_id()
        AND my_confirmed_guild_membership.guild_id = game_play_confirmed.guild_id)
  LEFT JOIN public.game_play AS game_play_recruiting
    ON (quests.id = game_play_recruiting.quest_id
        AND game_play_recruiting.status = 'confirmed'
        AND game_play_recruiting.game_status >= 'interested'
        AND game_play_recruiting.game_status <= 'confirmed')
  LEFT JOIN public.guild_membership AS my_recruiting_guild_membership
    ON (my_recruiting_guild_membership.member_id = public.current_member_id()
        AND my_recruiting_guild_membership.guild_id = game_play_recruiting.guild_id)
  LEFT JOIN public.conversation_node
    ON (conversation_node.quest_id = quests.id
        AND conversation_node.status = 'published')
  WHERE quests.public
    OR (quests.creator = public.current_member_id())
    OR public.my_quest_memberships.quest_id IS NOT NULL
  GROUP BY quests.id;

GRANT SELECT ON public.quests_data TO :dbc;
GRANT SELECT ON public.quests_data TO :dbm;

DROP VIEW IF EXISTS public.guilds_data;
CREATE OR REPLACE VIEW public.guilds_data AS
  SELECT
    guilds.id AS id,
    guilds.handle AS handle,
    guilds.name AS name,
    guilds.description AS description,
    guilds.creator AS creator,
    guilds.open_for_applications AS open_for_applications,
    guilds.public AS public,
    guilds.application_needs_approval AS application_needs_approval,
    guilds.created_at AS created_at,
    guilds.updated_at AS updated_at,
    guilds.default_role_id AS default_role_id,
    guilds.slug AS slug,
    count(DISTINCT guild_membership.member_id) AS member_count,
    count(DISTINCT guild_memberships_requests.member_id) AS member_request_count,
    count(my_guild_memberships) > 0 AS is_member,
    COALESCE(bool_or(my_guild_memberships.permissions @> '{guildAdmin}'::public.permission[]), false) AS is_admin,
    max(conversation_node.published_at) AS last_node_published_at,
    count(DISTINCT conversation_node.id) AS node_count,
    count(DISTINCT ongoing_quests.id) AS ongoing_quests_count,
    count(DISTINCT finished_quests.id) AS finished_quests_count,
    count(DISTINCT game_play_recruiting.quest_id) AS recruiting_for_quest_count
  FROM public.guilds
  LEFT JOIN public.guild_membership
    ON (guilds.id = guild_membership.guild_id
        AND guild_membership.status = 'confirmed')
  LEFT JOIN public.guild_membership AS guild_memberships_requests
    ON (guilds.id = guild_membership.guild_id
        AND guild_membership.status = 'request')
  LEFT JOIN public.my_guild_memberships
    ON (guilds.id = my_guild_memberships.guild_id
        AND my_guild_memberships.status = 'confirmed')
  LEFT JOIN public.game_play AS game_play_confirmed
    ON (guilds.id = game_play_confirmed.guild_id
        AND game_play_confirmed.status = 'confirmed'
        AND game_play_confirmed.game_status >= 'confirmed')
  LEFT JOIN public.quests AS ongoing_quests
    ON (game_play_confirmed.quest_id = ongoing_quests.id
        AND ongoing_quests.status >= 'ongoing'
        AND ongoing_quests.status < 'finished')
  LEFT JOIN public.quests AS finished_quests
    ON (game_play_confirmed.quest_id = finished_quests.id
        AND finished_quests.status = 'finished')
  LEFT JOIN public.game_play AS game_play_recruiting
    ON (guilds.id = game_play_recruiting.guild_id
        AND game_play_recruiting.status = 'confirmed'
        AND game_play_recruiting.game_status >= 'interested'
        AND game_play_recruiting.game_status <= 'confirmed')
  LEFT JOIN public.conversation_node
    ON (conversation_node.guild_id = guilds.id
        AND conversation_node.status = 'published')
  WHERE guilds.public
    OR (guilds.creator = public.current_member_id())
    OR public.my_guild_memberships.guild_id IS NOT NULL
  GROUP BY guilds.id;

GRANT SELECT ON public.guilds_data TO :dbc;
GRANT SELECT ON public.guilds_data TO :dbm;

COMMIT;
