'use strict';

const Enums = require('../src/models/enums.model');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    const db_name = queryInterface.sequelize.getDatabaseName();
    await queryInterface.sequelize.query(
      'ALTER TYPE enum_guild_membership_permissions ADD VALUE IF NOT EXISTS \'proposeGuildMembership\'');

    await queryInterface.addColumn('guilds', 'application_needs_approval',
      DataTypes.BOOLEAN, {
        defaultValue: false
      });
    await queryInterface.addColumn('guild_membership', 'status',
      Enums.MembershipStatus, {
        defaultValue: 'request',
        allowNull: false
      });
    await queryInterface.sequelize.query(
      'DROP VIEW my_guild_memberships CASCADE');
    await queryInterface.sequelize.query(
      `UPDATE guild_membership
      SET status = CASE WHEN confirmed THEN 'confirmed'::enum_guild_membership_status
      ELSE 'request'::enum_guild_membership_status END`);
    await queryInterface.removeColumn('guild_membership', 'confirmed');
    await queryInterface.sequelize.query(
      'CREATE VIEW my_guild_memberships AS SELECT guild_id, status, permissions, available_roles from guild_membership WHERE user_id = current_user_id()');
    await queryInterface.sequelize.query(
      `GRANT SELECT ON my_guild_memberships TO ${db_name}__member, ${db_name}__client`);

    await queryInterface.createFunction(
      'is_guild_member', [
        {type: 'varchar', name: 'guild', direction: 'IN'}
      ], 'boolean', 'plpgsql',
      `RETURN (SELECT count(*) FROM guild_membership
      JOIN users ON users.id=user_id
      JOIN guilds ON guilds.id=guild_id
      WHERE guilds.handle = guild
      AND status = 'confirmed'
      AND users.handle = scuser_handle()) > 0;`,
      ['STABLE'], { force: true }
    );

    await queryInterface.createFunction(
      'is_guild_id_member', [
        {type: 'integer', name: 'guildid', direction: 'IN'}
      ], 'boolean', 'plpgsql',
      `RETURN (SELECT count(*) FROM guild_membership
      JOIN users ON users.id=user_id
      WHERE guild_id = guildid
      AND status = 'confirmed'
      AND users.handle = scuser_handle()) > 0;`,
      ['STABLE'], { force: true }
    );

    await queryInterface.createFunction(
      'has_guild_permission', [
        {type: 'integer', name: 'guildid', direction: 'IN'},
        {type: 'enum_guild_membership_permissions', name: 'perm', direction: 'IN'}
      ], 'boolean', 'plpgsql',
      `RETURN (SELECT count(*) FROM guild_membership
       JOIN users ON users.id=user_id
       WHERE guild_id = guildid
       AND status = 'confirmed'
       AND users.handle = scuser_handle()
       AND (coalesce(guild_membership.permissions, ARRAY[]::enum_guild_membership_permissions[]) && ARRAY[perm, 'guildAdmin'::enum_guild_membership_permissions]
         OR coalesce(users.permissions, ARRAY[]::enum_users_permissions[]) && ARRAY['superadmin'::enum_users_permissions])
       ) > 0;`,
      ['STABLE'], { force: true }
    );

    await queryInterface.sequelize.query(
      'DROP POLICY IF EXISTS guilds_select_policy ON guilds');
    await queryInterface.sequelize.query(
      `CREATE POLICY guilds_select_policy ON guilds FOR SELECT USING
      (public OR creator = current_user_id() OR id IN(SELECT guild_id FROM my_guild_memberships WHERE status = 'confirmed'))`);

    await queryInterface.sequelize.query(
      'DROP POLICY IF EXISTS guild_membership_insert_policy ON guild_membership');
    await queryInterface.sequelize.query(
      `CREATE POLICY guild_membership_insert_policy ON guild_membership FOR INSERT WITH CHECK
        (current_user_id() IS NOT NULL OR has_guild_permission(guild_id, 'proposeGuildMembership'::enum_guild_membership_permissions))`);

    await queryInterface.sequelize.query(
      'DROP POLICY IF EXISTS guild_membership_select_policy ON guild_membership');
    await queryInterface.sequelize.query(
      `CREATE POLICY guild_membership_select_policy ON guild_membership FOR SELECT USING
        (user_id = current_user_id() OR (SELECT id FROM public_guilds WHERE public_guilds.id = guild_id) IS NOT NULL
        OR guild_id IN(SELECT guild_id FROM my_guild_memberships WHERE status='confirmed'))`);

    await queryInterface.sequelize.query(
      'DROP POLICY IF EXISTS guild_membership_delete_policy ON guild_membership');
    await queryInterface.sequelize.query(
      `CREATE POLICY guild_membership_delete_policy ON guild_membership FOR DELETE USING
        (current_user_id() = user_id OR has_guild_permission(guild_id, 'revokeGuildMembership'::enum_guild_membership_permissions))`);

    await queryInterface.createFunction(
      'after_create_guild', [], 'trigger', 'plpgsql',`
      INSERT INTO guild_membership (guild_id, user_id, status, permissions) VALUES (NEW.id, NEW.creator, 'confirmed', ARRAY['guildAdmin'::enum_guild_membership_permissions]);
      RETURN NEW;`,
      [], {
        force: true
      }
    );
    await queryInterface.createFunction(
      'before_createup_guild_membership', [], 'trigger', 'plpgsql', `
        SELECT handle, open_for_applications, application_needs_approval INTO STRICT guild, open_for_app, needs_approval FROM guilds WHERE id=NEW.guild_id;
        SELECT handle INTO STRICT member FROM users WHERE id=NEW.user_id;
        is_requested := NOT (OLD IS NULL OR OLD.status = 'invitation');
        is_invited := NOT (OLD IS NULL OR OLD.status = 'request');
        IF (NOT needs_approval) OR is_guild_id_member(NEW.guild_id) OR 1 = (SELECT COUNT(id) FROM guilds WHERE id = NEW.guild_id AND creator=NEW.user_id) THEN
          is_invited := is_invited OR (NEW.status != 'request');
        END IF;
        IF NEW.user_id = current_user_id() THEN
          is_requested := is_requested OR (NEW.status != 'invitation');
        END IF;
        IF (NOT open_for_app) AND (NOT is_invited) THEN
          RETURN NULL;
        END IF;
        IF is_requested THEN
          IF is_invited THEN
            NEW.status := 'confirmed';
          ELSE
            NEW.status := 'request';
          END IF;
        ELSE
          IF is_invited THEN
            NEW.status := 'invitation';
          ELSE
            return NULL;
          END IF;
        END IF;
        IF NEW.status = 'confirmed' AND member IS NOT NULL AND guild IS NOT NULL THEN
          PERFORM alter_guild_membership(guild, member, NEW.status = 'confirmed',
            coalesce(NEW.permissions @> ARRAY['guildAdmin'::enum_guild_membership_permissions], false));
        END IF;
        RETURN NEW;
        `, [], {
        force: true,
        variables: [
          { name: 'guild', type: 'varchar' },
          { name: 'member', type: 'varchar' },
          { name: 'is_requested', type: 'boolean' },
          { name: 'is_invited', type: 'boolean' },
          { name: 'needs_approval', type: 'boolean' },
          { name: 'open_for_app', type: 'boolean' },
        ]});
  },

  down: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    const db_name = queryInterface.sequelize.getDatabaseName();
    await queryInterface.addColumn(
      'guild_membership', 'confirmed', DataTypes.BOOLEAN,
      {defaultValue: false});
    await queryInterface.sequelize.query(
      'DROP VIEW my_guild_memberships CASCADE');
    await queryInterface.sequelize.query(
      `UPDATE guild_membership
      SET confirmed = (status = 'confirmed'::enum_guild_membership_status)`);
    await queryInterface.removeColumn('guild_membership', 'status');

    await queryInterface.sequelize.query(
      'CREATE VIEW my_guild_memberships AS SELECT guild_id, confirmed, permissions, available_roles from guild_membership WHERE user_id = current_user_id()');
    await queryInterface.sequelize.query(
      `GRANT SELECT ON my_guild_memberships TO ${db_name}__member, ${db_name}__client`);
    await queryInterface.sequelize.query(
      `GRANT INSERT, UPDATE, DELETE ON guilds, guild_membership TO ${db_name}__member`);
    await queryInterface.createFunction(
      'is_guild_member', [
        {type: 'varchar', name: 'guild', direction: 'IN'}
      ], 'boolean', 'plpgsql',
      `RETURN (SELECT count(*) FROM guild_membership
      JOIN users ON users.id=user_id
      JOIN guilds ON guilds.id=guild_id
      WHERE guilds.handle = guild
      AND confirmed
      AND users.handle = scuser_handle()) > 0;`,
      ['STABLE'], { force: true }
    );

    await queryInterface.createFunction(
      'is_guild_id_member', [
        {type: 'integer', name: 'guildid', direction: 'IN'}
      ], 'boolean', 'plpgsql',
      `RETURN (SELECT count(*) FROM guild_membership
      JOIN users ON users.id=user_id
      WHERE guild_id = guildid
      AND confirmed
      AND users.handle = scuser_handle()) > 0;`,
      ['STABLE'], { force: true }
    );

    await queryInterface.sequelize.query(
      'DROP POLICY IF EXISTS guilds_select_policy ON guilds');
    await queryInterface.sequelize.query(
      `CREATE POLICY guilds_select_policy ON guilds FOR SELECT USING
      (public OR creator = current_user_id() OR id IN(SELECT guild_id FROM my_guild_memberships WHERE confirmed))`);
    await queryInterface.sequelize.query(
      'DROP POLICY IF EXISTS guild_membership_insert_policy ON guild_membership');

    await queryInterface.sequelize.query(
      'DROP POLICY IF EXISTS guild_membership_select_policy ON guild_membership');
    await queryInterface.sequelize.query(
      `CREATE POLICY guild_membership_select_policy ON guild_membership FOR SELECT USING
        (user_id = current_user_id() OR (SELECT id FROM public_guilds WHERE public_guilds.id = guild_id) IS NOT NULL
        OR guild_id IN(SELECT guild_id FROM my_guild_memberships WHERE confirmed))`);

    await queryInterface.sequelize.query(
      'DROP POLICY IF EXISTS guild_membership_delete_policy ON guild_membership');

    await queryInterface.createFunction(
      'before_createup_guild_membership', [], 'trigger', 'plpgsql',
      `SELECT handle INTO STRICT guild FROM guilds WHERE id=NEW.guild_id;
      SELECT handle INTO STRICT member FROM users WHERE id=NEW.user_id;
      IF member IS NOT NULL AND guild IS NOT NULL THEN
        PERFORM alter_guild_membership(guild, member, NEW.confirmed,
          coalesce(NEW.permissions @> ARRAY['guildAdmin'::enum_guild_membership_permissions], false));
      END IF;
      RETURN NEW;`, [], {
        force: true,
        variables: [
          { name: 'guild', type: 'varchar' },
          { name: 'member', type: 'varchar' },
        ]});

    await queryInterface.removeColumn('guilds', 'application_needs_approval');

    await queryInterface.dropFunction('has_guild_permission', [
      {type: 'integer', name: 'guildid', direction: 'IN'},
      {type: 'enum_guild_membership_permissions', name: 'perm', direction: 'IN'}]);

  }
};
