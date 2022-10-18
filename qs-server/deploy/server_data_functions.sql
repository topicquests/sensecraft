-- Deploy server_data_functions
-- requires: server_data
-- idempotent

BEGIN;

CREATE OR REPLACE FUNCTION public.reset_default_data(varname varchar) RETURNS boolean AS $$
DECLARE value varchar;
DECLARE vtype varchar;
BEGIN
  SELECT current_setting(concat('defaults.', varname)) INTO STRICT value;
  SELECT typname INTO STRICT vtype FROM pg_catalog.pg_type
    JOIN pg_catalog.pg_attribute on atttypid=pg_type.oid 
    JOIN pg_catalog.pg_class ON attrelid=pg_class.oid
    JOIN pg_catalog.pg_namespace on relnamespace=pg_namespace.oid
    WHERE relname='server_data' AND nspname = 'public' AND attname = varname;
  EXECUTE CONCAT('UPDATE public.server_data SET ', varname, '=CAST($1 AS ', vtype, ')') USING value;
  RETURN true;
END
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.reset_all_default_data() RETURNS boolean AS $$
DECLARE value varchar;
DECLARE varname varchar;
DECLARE vtype varchar;
BEGIN
  FOR varname, vtype IN SELECT attname, typname FROM pg_catalog.pg_attribute
    JOIN pg_catalog.pg_class ON attrelid=pg_class.oid
    JOIN pg_catalog.pg_type on atttypid=pg_type.oid 
    JOIN pg_catalog.pg_namespace on relnamespace=pg_namespace.oid
    WHERE relname='server_data' AND nspname = 'public' LOOP
    BEGIN
      SELECT current_setting(concat('defaults.', varname)) INTO value;
      EXECUTE CONCAT('UPDATE public.server_data SET ', varname, '=CAST($1 AS ', vtype, ')') USING value, vtype;
    EXCEPTION WHEN undefined_object THEN NULL;
    END;
  END LOOP;
  RETURN true;
END
$$ LANGUAGE plpgsql;

SELECT reset_all_default_data();

COMMIT;
