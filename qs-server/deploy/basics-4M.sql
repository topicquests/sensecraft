-- Deploy basics


BEGIN;

ALTER TYPE public.ibis_node_type ADD VALUE 'con_answer';

COMMIT;
