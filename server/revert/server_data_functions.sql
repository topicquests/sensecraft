-- Deploy server_data_functions


BEGIN;

DROP FUNCTION IF EXISTS public.reset_default_data(varname varchar);
DROP FUNCTION IF EXISTS public.reset_all_default_data();

COMMIT;
