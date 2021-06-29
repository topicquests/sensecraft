// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('../utils/pgEnum-fix');
const DataTypes = Sequelize.DataTypes;
const Enums = require('./enums.model');

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const users = sequelizeClient.models.users;
  class Guild extends Sequelize.Model {}
  Guild.init({
    handle: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    creator: {
      type: DataTypes.INTEGER,
      references: {
        model: users,
        key: 'id'
      },
      onUpdate: 'cascade',
      onDelete: 'SET NULL'
    },
    public: {
      type: DataTypes.BOOLEAN,
    },
    open_for_applications: {
      type: DataTypes.BOOLEAN,
      default: false,
    },
    application_needs_approval: {
      type: DataTypes.BOOLEAN,
      default: false,
    }
  }, {
    sequelize: sequelizeClient,
    modelName: 'Guild',
    tableName: 'guilds',
    hooks: {
      beforeCount(options) {
        options.raw = true;
      },
      async afterSync(options) {
        const sequelize = options.sequelize;
        // eslint-disable-next-line no-unused-vars
        const db_name = sequelize.getDatabaseName();
      }
    }
  });

  class GuildMembership extends Sequelize.Model {}
  // eslint-disable-next-line no-unused-vars
  GuildMembership.init({
    guildId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Guild,
        key: 'id'
      },
      field: 'guild_id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    },
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: users,
        key: 'id'
      },
      field: 'user_id',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    },
    status: {
      type: Enums.MembershipStatus,
      defaultValue: 'request',
      allowNull: false,
    },
    permissions: {
      type: DataTypes.ARRAY(Enums.Permissions),
    },
    available_roles: {
      type: DataTypes.ARRAY(Enums.Roles),
    }
  }, {
    tableName: 'guild_membership',
    sequelize: sequelizeClient,
    modelName: 'GuildMembership',
    timestamps: false,
    hooks: {
      beforeCount(options) {
        options.raw = true;
      },
      async afterSync(options) {
        const sequelize = options.sequelize;
        const db_name = sequelize.getDatabaseName();

        await sequelize.query(
          'CREATE VIEW public_guilds AS select * FROM guilds WHERE public');

        await sequelize.query(
          'CREATE VIEW my_guild_memberships AS SELECT guild_id, status, permissions, available_roles from guild_membership WHERE user_id = current_user_id()');

        await sequelize.query(
          `GRANT SELECT ON guilds, guild_membership, public_guilds, my_guild_memberships TO ${db_name}__member, ${db_name}__client`);
        await sequelize.query(
          `GRANT INSERT, UPDATE, DELETE ON guilds, guild_membership TO ${db_name}__member`);
        await sequelize.query(
          `GRANT USAGE ON public.guilds_id_seq TO ${db_name}__member`);

        await sequelize.queryInterface.createFunction(
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

        await sequelize.queryInterface.createFunction(
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

        await sequelize.queryInterface.createFunction(
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
        // TODO: When the enums are of the same type, also look at users permissions:
        // OR coalesce(users.permissions, ARRAY[]::enum_users_permissions[]) && ARRAY[perm, 'superadmin'::enum_users_permissions]

        await sequelize.query(
          'ALTER TABLE guilds ENABLE ROW LEVEL SECURITY');
        await sequelize.query(
          `CREATE POLICY guilds_select_policy ON guilds FOR SELECT USING
          (public OR creator = current_user_id() OR id IN(SELECT guild_id FROM my_guild_memberships WHERE status = 'confirmed'))`);
        // could use is_guild_member above, check timing.

        await sequelize.query(
          `CREATE POLICY guilds_insert_policy ON guilds FOR INSERT WITH CHECK
          (has_permission('createGuild'))`);

        await sequelize.query(
          'ALTER TABLE guild_membership ENABLE ROW LEVEL SECURITY');

        await sequelize.query(
          `CREATE POLICY guild_membership_select_policy ON guild_membership FOR SELECT USING
            (user_id = current_user_id() OR (SELECT id FROM public_guilds WHERE public_guilds.id = guild_id) IS NOT NULL
            OR guild_id IN(SELECT guild_id FROM my_guild_memberships WHERE status = 'confirmed'))`);
        await sequelize.query(
          `CREATE POLICY guild_membership_update_policy ON guild_membership FOR UPDATE USING
            (is_guild_id_member(guild_id))`); // TODO: Accept invites...
        await sequelize.query(
          `CREATE POLICY guild_membership_insert_policy ON guild_membership FOR INSERT WITH CHECK
            (current_user_id() = user_id OR has_guild_permission(guild_id, 'proposeGuildMembership'::enum_guild_membership_permissions))`);
        await sequelize.query(
          `CREATE POLICY guild_update_policy ON guilds FOR UPDATE USING
            (is_guild_id_member(id))`);
        await sequelize.query(
          `CREATE POLICY guild_membership_delete_policy ON guild_membership FOR DELETE USING
            (current_user_id() = user_id OR has_guild_permission(guild_id, 'revokeGuildMembership'::enum_guild_membership_permissions))`);

        await sequelize.queryInterface.createFunction(
          'before_create_guild', [], 'trigger', 'plpgsql',
          `guildrole := '${db_name}__g_' || NEW.handle;
          guildleadrole := '${db_name}__l_' || NEW.handle;
          NEW.creator := current_user_id();
          curuser := current_user;
          SET LOCAL ROLE ${db_name}__owner;
          EXECUTE 'CREATE ROLE ' || guildrole;
          EXECUTE 'CREATE ROLE ' || guildleadrole;
          EXECUTE 'ALTER GROUP ' || guildrole || ' ADD USER ${db_name}__client';
          EXECUTE 'ALTER GROUP ' || guildleadrole || ' ADD USER ${db_name}__client';
          EXECUTE 'SET LOCAL ROLE ' || curuser;
          RETURN NEW;`, [], {
            force: true,
            variables: [
              { name: 'curuser', type: 'varchar' },
              { name: 'guildrole', type: 'varchar' },
              { name: 'guildleadrole', type: 'varchar' },
            ]
          }
        );
        await sequelize.query(`
          CREATE TRIGGER before_create_guild BEFORE INSERT ON public.guilds
          FOR EACH ROW EXECUTE FUNCTION before_create_guild()`);

        await sequelize.queryInterface.createFunction(
          'alter_guild_membership', [
            { name: 'guild', type: 'varchar' },
            { name: 'member', type: 'varchar' },
            { name: 'adding', type: 'boolean' },
            { name: 'leader', type: 'boolean' },
          ], 'void', 'plpgsql',
          `curuser := current_user;
          SET LOCAL ROLE ${db_name}__owner;
          IF adding THEN
            EXECUTE 'ALTER GROUP ${db_name}__g_' || guild || ' ADD USER ${db_name}__m_' || member;
          ELSE
            EXECUTE 'ALTER GROUP ${db_name}__g_' || guild || ' DROP USER ${db_name}__m_' || member;
          END IF;
          IF leader THEN
            EXECUTE 'ALTER GROUP ${db_name}__l_' || guild || ' ADD USER ${db_name}__m_' || member;
          ELSE
            EXECUTE 'ALTER GROUP ${db_name}__l_' || guild || ' DROP USER ${db_name}__m_' || member;
          END IF;
          EXECUTE 'SET LOCAL ROLE ' || curuser;`, [], {
            force: true,
            variables: [
              { name: 'curuser', type: 'varchar' }
            ]
          });

        await sequelize.queryInterface.createFunction(
          'after_create_guild', [], 'trigger', 'plpgsql', `
          INSERT INTO guild_membership (guild_id, user_id, status, permissions) VALUES (NEW.id, NEW.creator, 'confirmed', ARRAY['guildAdmin'::enum_guild_membership_permissions]);
          RETURN NEW;`,
          [], {
            force: true
          }
        );
        await sequelize.query(`
          CREATE TRIGGER after_create_guild AFTER INSERT ON public.guilds
          FOR EACH ROW EXECUTE FUNCTION after_create_guild()`);

        await sequelize.queryInterface.createFunction(
          'after_delete_guild', [], 'trigger', 'plpgsql',
          `curuser := current_user;
          SET LOCAL ROLE ${db_name}__owner;
          EXECUTE 'DROP ROLE ${db_name}__g_' || OLD.handle;
          EXECUTE 'DROP ROLE ${db_name}__l_' || OLD.handle;
          EXECUTE 'SET LOCAL ROLE ' || curuser;
          RETURN NEW;`,
          [], {
            force: true,
            variables: [
              { name: 'curuser', type: 'varchar' },
            ]
          }
        );
        await sequelize.query(
          `CREATE TRIGGER after_delete_guild AFTER DELETE ON public.guilds
          FOR EACH ROW EXECUTE FUNCTION after_delete_guild()`);

        await sequelize.queryInterface.createFunction(
          'before_update_guild', [], 'trigger', 'plpgsql',
          `IF NEW.handle <> OLD.handle THEN
            RETURN NULL;
          END IF;
          RETURN NEW;`,
          [], { force: true }
        );
        await sequelize.query(`
          CREATE TRIGGER before_update_guild BEFORE UPDATE ON public.guilds
          FOR EACH ROW EXECUTE FUNCTION before_update_guild()`);
        await sequelize.queryInterface.createFunction(
          'before_createup_guild_membership', [], 'trigger', 'plpgsql', `
          SELECT handle, open_for_applications, application_needs_approval INTO STRICT guild, open_for_app, needs_approval FROM guilds WHERE id=NEW.guild_id;
          SELECT handle INTO STRICT member FROM users WHERE id=NEW.user_id;
          is_requested := NOT (OLD IS NULL OR OLD.status = 'invitation');
          is_invited := NOT (OLD IS NULL OR OLD.status = 'request');
          IF (NOT needs_approval) OR is_guild_id_member(NEW.guild_id) OR 1 = (SELECT COUNT(id) FROM guilds WHERE id = NEW.guild_id AND creator=NEW.user_id) THEN
            is_invited := is_invited OR (NEW.status != 'request');
          END IF;
          IF (NOT open_for_app) AND (NOT is_invited) THEN
            RETURN NULL;
          END IF;
          IF NEW.user_id = current_user_id() THEN
            is_requested := is_requested OR (NEW.status != 'invitation');
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
        await sequelize.query(`
          CREATE TRIGGER before_create_guild_membership BEFORE INSERT ON public.guild_membership
          FOR EACH ROW EXECUTE FUNCTION before_createup_guild_membership()`);
        await sequelize.query(`
          CREATE TRIGGER before_update_guild_membership BEFORE UPDATE ON public.guild_membership
          FOR EACH ROW EXECUTE FUNCTION before_createup_guild_membership()`);
        await sequelize.queryInterface.createFunction(
          'after_delete_guild_membership', [], 'trigger', 'plpgsql',
          `SELECT handle INTO memberrole FROM users WHERE id=OLD.user_id;
          SELECT handle INTO guildrole FROM guilds WHERE id=OLD.guild_id;
          IF guildrole IS NOT NULL AND memberrole IS NOT NULL THEN
            curuser := current_user;
            SET LOCAL ROLE ${db_name}__owner;
            EXECUTE 'ALTER GROUP ${db_name}__g_' || guildrole || ' DROP USER ${db_name}__m_' || memberrole;
            EXECUTE 'ALTER GROUP ${db_name}__l_' || guildrole || ' DROP USER ${db_name}__m_' || memberrole;
            EXECUTE 'SET LOCAL ROLE ' || curuser;
          END IF;
          RETURN OLD;`, [], {
            force: true,
            variables: [
              { name: 'curuser', type: 'varchar' },
              { name: 'guildrole', type: 'varchar' },
              { name: 'memberrole', type: 'varchar' },
            ]});
        await sequelize.query(`
          CREATE TRIGGER after_delete_guild_membership AFTER DELETE ON public.guild_membership
          FOR EACH ROW EXECUTE FUNCTION after_delete_guild_membership()`);

      }
    }
  });

  Guild.hasMany(GuildMembership, { sourceKey: 'id', foreignKey: 'guildId' });
  GuildMembership.hasOne(Guild, { sourceKey: 'guildId', foreignKey: 'id' });
  GuildMembership.hasOne(users, {sourceKey: 'userId', foreignKey: 'id'});
  users.hasMany(GuildMembership, { sourceKey: 'id', foreignKey: 'userId' });
  users.belongsToMany(Guild, { through: GuildMembership, foreignKey: 'userId', otherKey: 'guildId' });
  Guild.belongsToMany(users, { through: GuildMembership, foreignKey: 'guildId', otherKey: 'userId'  });

  return {Guild, GuildMembership};
};
