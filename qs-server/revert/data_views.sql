-- Deploy data_views


BEGIN;

DROP VIEW public.quests_data;
DROP VIEW public.guilds_data;
DROP VIEW public.quest_aggregates;
DROP VIEW public.guild_aggregates;

COMMIT;
