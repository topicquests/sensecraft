-- Deploy basics


BEGIN;

ALTER TYPE public.permission ADD VALUE IF NOT EXISTS 'createPlayChannel' AFTER 'joinQuest';
ALTER TYPE public.permission ADD VALUE IF NOT EXISTS 'createGuildChannel' AFTER 'createPlayChannel';
ALTER TYPE public.permission ADD VALUE IF NOT EXISTS 'editConversationNode' AFTER 'createGuildChannel';
ALTER TYPE public.permission ADD VALUE IF NOT EXISTS 'addAvailableRole' AFTER 'editConversationNode';
ALTER TYPE public.permission ADD VALUE IF NOT EXISTS 'setPlayerRole' AFTER 'addAvailableRole';
ALTER TYPE public.permission ADD VALUE IF NOT EXISTS 'createGuildRole' AFTER 'setPlayerRole';
ALTER TYPE public.permission ADD VALUE IF NOT EXISTS 'createSystemRole' AFTER 'createGuildRole';
ALTER TYPE public.permission ADD VALUE IF NOT EXISTS 'changeFocus' AFTER 'createSystemRole';

COMMIT;
