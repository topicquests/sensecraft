-- Deploy server_data


BEGIN;

DROP INDEX IF EXISTS server_data_singleton;
DROP TABLE IF EXISTS public.server_data;

COMMIT;
