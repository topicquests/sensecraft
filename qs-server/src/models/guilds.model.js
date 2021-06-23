// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('../utils/pgEnum-fix');
const DataTypes = Sequelize.DataTypes;
const Enums = require('./enums.model');

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const users = sequelizeClient.models.users;
  const guilds = sequelizeClient.define('guilds', {
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
    },
  }, {
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

  // eslint-disable-next-line no-unused-vars
  const guild_membership = sequelizeClient.define('guild_membership', {
    guildId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: guilds,
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
    confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    permissions: {
      type: DataTypes.ARRAY(Enums.Permissions),
    },
    available_roles: {
      type: DataTypes.ARRAY(Enums.Roles),
    }
  }, {
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
          'CREATE VIEW my_guild_memberships AS SELECT * from guild_membership WHERE user_id = current_user_id()');

        await sequelize.query(
          `GRANT SELECT ON guilds, guild_membership, public_guilds, my_guild_memberships TO ${db_name}__member, ${db_name}__client`);
        await sequelize.query(
          `GRANT INSERT, UPDATE ON guilds, guild_membership TO ${db_name}__member`);
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
          AND confirmed
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
          AND confirmed
          AND users.handle = scuser_handle()) > 0;`,
          ['STABLE'], { force: true }
        );

        await sequelize.queryInterface.createFunction(
          'guild_permissions', [
            {type: 'varchar', name: 'guild', direction: 'IN'}
          ], 'enum_guild_membership_permissions[]', 'plpgsql',
          `RETURN (SELECT count(*) FROM guild_membership
          JOIN users ON users.id=user_id
          JOIN guilds ON guilds.id=guild_id
          WHERE guilds.handle = guild
          AND confirmed
          AND users.handle = scuser_handle()) > 0;`,
          ['STABLE'], { force: true }
        );

        await sequelize.query(
          'ALTER TABLE guilds ENABLE ROW LEVEL SECURITY');
        await sequelize.query(
          `CREATE POLICY guilds_select_policy ON guilds FOR SELECT USING
          (public OR creator = current_user_id() OR id IN(SELECT guild_id FROM my_guild_memberships WHERE confirmed))`);
        // could use is_guild_member above, check timing.

        await sequelize.query(
          `CREATE POLICY guilds_insert_policy ON guilds FOR INSERT WITH CHECK
          (has_permission('createGuild'))`);

        await sequelize.query(
          'ALTER TABLE guild_membership ENABLE ROW LEVEL SECURITY');

        await sequelize.query(
          `CREATE POLICY guild_membership_select_policy ON guild_membership FOR SELECT USING
            (user_id = current_user_id() OR (SELECT id FROM public_guilds WHERE public_guilds.id = guild_id) IS NOT NULL
            OR guild_id IN(SELECT guild_id FROM my_guild_memberships WHERE confirmed))`);
        await sequelize.query(
          `CREATE POLICY guild_membership_update_policy ON guild_membership FOR UPDATE USING
            (is_guild_id_member(guild_id))`);
        await sequelize.query(
          `CREATE POLICY guild_update_policy ON guilds FOR UPDATE USING
            (is_guild_id_member(id))`);

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
          'after_create_guild', [], 'trigger', 'plpgsql',
          `user_id := current_user_id();
          IF user_id IS NOT NULL THEN
            curuser := current_user;
            SET LOCAL ROLE ${db_name}__owner;
            INSERT INTO guild_membership VALUES (NEW.id, user_id, true, null);
            EXECUTE 'SET LOCAL ROLE ' || curuser;
          END IF;
          RETURN NEW;`,
          [], {
            force: true,
            variables: [
              { name: 'curuser', type: 'varchar' },
              { name: 'user_id', type: 'integer' },
            ]
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
  // eslint-disable-next-line no-unused-vars
  guilds.associate = function (models) {
    const users = models.users;
    guilds.hasMany(guild_membership);
    guild_membership.hasOne(guilds, { sourceKey: 'guildId', foreignKey: 'id' });
    console.log(users);
    guild_membership.hasOne(users, {sourceKey: 'userId', foreignKey: 'id'});
    users.hasMany(guild_membership);
    users.belongsToMany(guilds, { through: guild_membership, foreignKey: 'guildId', otherKey: 'userId' });
    guilds.belongsToMany(users, { through: guild_membership, foreignKey: 'userId', otherKey: 'guildId'  });

    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return {guilds, guild_membership};
};
