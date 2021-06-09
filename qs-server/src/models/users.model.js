// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('../utils/pgEnum-fix');
const DataTypes = Sequelize.DataTypes;
const Enums = require('./enums.model');

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const users = sequelizeClient.define('users', {
  
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    handle: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    permissions: {
      type: DataTypes.ARRAY(Enums.Permissions),
    },
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      },
      async afterSync(options) {
        const sequelize = options.sequelize;
        const db_name = sequelize.getDatabaseName();
        const name_prefix_l = db_name.length + 5;

        await sequelize.query(
          `GRANT SELECT, INSERT ON public.users TO ${db_name}__client`);
        await sequelize.query(
          `GRANT USAGE ON public.users_id_seq TO ${db_name}__client`);
        await sequelize.query(
          `GRANT SELECT ON public.users TO ${db_name}__member`);

        await sequelize.queryInterface.createFunction(
          'role_to_handle', [{name: 'role', type: 'varchar'}], 'varchar', 'plpgsql',
          `IF role ~ '^${db_name}__[mglq]_.+' THEN
            RETURN substr(role, ${name_prefix_l});
          ELSE
            RETURN NULL;
          END IF;`,
          ['IMMUTABLE'], { force: true }
        );

        await sequelize.queryInterface.createFunction(
          'scuser_handle', [], 'varchar', 'plpgsql',
          'RETURN role_to_handle(cast(current_user as varchar));',
          ['STABLE'], { force: true }
        );

        await sequelize.queryInterface.createFunction(
          'current_user_id', [], 'integer', 'plpgsql',
          'RETURN (SELECT id FROM users WHERE scuser_handle() = handle);',
          ['STABLE'], { force: true }
        );

        await sequelize.queryInterface.createFunction(
          'has_permission', [
            { name: 'permission', type: 'varchar' }], 'boolean', 'plpgsql',
          `RETURN current_user = '${db_name}__owner' OR (SELECT permissions && CAST(ARRAY['superadmin', permission] AS enum_users_permissions[])
            FROM users where handle = scuser_handle());`,
          ['STABLE'], { force: true }
        );

        await sequelize.queryInterface.createFunction(
          'before_update_user', [], 'trigger', 'plpgsql',
          `IF NEW.handle <> OLD.handle THEN
            RETURN NULL;
          END IF;
          curuser := current_user;
          SET LOCAL ROLE ${db_name}__owner;
          IF ('superadmin' = ANY(NEW.permissions)) AND NOT ('superadmin' = ANY(OLD.permissions)) THEN
            EXECUTE 'ALTER GROUP ${db_name}__owner ADD USER ${db_name}__m_' || NEW.handle;
          END IF;
          IF ('superadmin' = ANY(OLD.permissions)) AND NOT ('superadmin' = ANY(NEW.permissions)) THEN
            EXECUTE 'ALTER GROUP ${db_name}__owner DROP USER ${db_name}__m_' || NEW.handle;
          END IF;
          EXECUTE 'SET LOCAL ROLE ' || curuser;
          RETURN NEW;`, [], {
            force: true,
            variables: [
              { name: 'curuser', type: 'varchar' }
            ],
          });

        await sequelize.query(
          'DROP TRIGGER IF EXISTS before_update_user ON public.users');
        await sequelize.queryInterface.sequelize.query(`
          CREATE TRIGGER before_update_user BEFORE UPDATE ON public.users
          FOR EACH ROW EXECUTE FUNCTION before_update_user()`);

        await sequelize.queryInterface.createFunction(
          'before_create_user', [], 'trigger', 'plpgsql',
          `newuser := '${db_name}__m_' || NEW.handle;
          curuser := current_user;
          SET LOCAL ROLE ${db_name}__owner;
          EXECUTE 'CREATE ROLE ' || newuser || ' INHERIT IN GROUP ${db_name}__member';
          EXECUTE 'ALTER GROUP ' || newuser || ' ADD USER ${db_name}__client';
          IF 'superadmin' = ANY(NEW.permissions) THEN
            EXECUTE 'ALTER GROUP ${db_name}__owner ADD USER ' || newuser;
          END IF;
          EXECUTE 'SET LOCAL ROLE ' || curuser;
          RETURN NEW;`, [], {
            force: true,
            variables: [
              { name: 'curuser', type: 'varchar' },
              { name: 'newuser', type: 'varchar' },
            ]
          }
        );

        await sequelize.query(
          'DROP TRIGGER IF EXISTS before_create_user ON public.users');
        await sequelize.query(`
          CREATE TRIGGER before_create_user BEFORE INSERT ON public.users
          FOR EACH ROW EXECUTE FUNCTION before_create_user()`);

        await sequelize.queryInterface.createFunction(
          'after_delete_user', [], 'trigger', 'plpgsql',
          `database := current_database();
          olduser := database || '__m_' || OLD.handle;
          owner := database || '__owner';
          EXECUTE 'SET LOCAL ROLE ' || owner;
          EXECUTE 'DROP ROLE ' || olduser;
          RETURN NEW;`,
          [], {
            force: true,
            variables: [
              { name: 'database', type: 'varchar' },
              { name: 'olduser', type: 'varchar' },
              { name: 'owner', type: 'varchar' },
            ]
          }
        );
        await sequelize.query(
          'DROP TRIGGER IF EXISTS after_delete_user ON public.users');
        await sequelize.query(
          `CREATE TRIGGER after_delete_user AFTER DELETE ON public.users
          FOR EACH ROW EXECUTE FUNCTION after_delete_user()`);
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  users.associate = function (models) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return users;
};
