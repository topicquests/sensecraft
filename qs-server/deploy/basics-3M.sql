-- Deploy basics


BEGIN;

CREATE TYPE public.meta_state AS ENUM (
  'conversation',
  'meta',
  'channel'
);

ALTER TYPE public.ibis_node_type ADD VALUE IF NOT EXISTS 'channel' AFTER 'reference';
ALTER TYPE public.publication_state ADD VALUE IF NOT EXISTS 'role_draft' AFTER 'private_draft';

COMMIT;
