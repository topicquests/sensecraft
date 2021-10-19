-- Deploy guilds


BEGIN;
ALTER TABLE guild_membership
    DROP COLUMN available_roles;
COMMIT;
