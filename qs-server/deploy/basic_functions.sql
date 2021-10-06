-- Deploy basic_functions
-- requires: basics
-- idempotent

BEGIN;

CREATE OR REPLACE FUNCTION slugify(name VARCHAR) RETURNS VARCHAR IMMUTABLE AS $$
   SELECT trim('_' FROM regexp_replace(lower(unaccent(name)), '[^a-z0-9]+', '_', 'g'));
$$ LANGUAGE SQL;

COMMIT;
