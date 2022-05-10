-- Deploy data_views
-- requires: game_play
-- requires: conversation_node
-- requires: casting
-- requires: quests_functions
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
    count(my_quest_memberships) > 0 OR quests.creator = public.current_member_id() AS is_quest_member
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

COMMIT;
