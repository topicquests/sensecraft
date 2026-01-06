-- Deploy channel_roles

BEGIN;

\set dbo :dbn '__owner';
\set dbm :dbn '__member';
\set dbc :dbn '__client';

DROP TABLE IF EXISTS public.channel_roles;

DROP SEQUENCE public.channel_roles_id_seq;

COMMIT;
