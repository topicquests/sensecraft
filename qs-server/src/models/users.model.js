// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

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
    firstname: {
      type: DataTypes.STRING,
      allowNull: true
  
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: true
    },

    handle: {
      type: DataTypes.STRING,
      allowNull: false
    },

    
  
  
  }, {
    hooks: {
      beforeCount(options) {
        options.raw = true;
      },
      async afterSync(options) {
        const sequelize = options.sequelize;
        const db_name = sequelize.getDatabaseName();
        await sequelize.query(
          `GRANT SELECT, INSERT ON public.users TO ${db_name}__client`);
        await sequelize.query(
          `GRANT USAGE ON public.users_id_seq TO ${db_name}__client`);
        await sequelize.queryInterface.createFunction(
          'before_create_user', [], 'trigger', 'plpgsql',
          `database := current_database();
          newuser := database || '__m_' || NEW.handle;
          members := database || '__member';
          client := database || '__client';
          owner := database || '__owner';
          EXECUTE 'SET LOCAL ROLE ' || owner;
          EXECUTE 'CREATE ROLE ' || newuser || ' INHERIT IN GROUP ' || members;
          EXECUTE 'ALTER GROUP ' || newuser || ' ADD USER ' || client;
          RETURN NEW;`,
          [], {
            force: true,
            variables: [
              { name: 'database', type: 'varchar' },
              { name: 'newuser', type: 'varchar' },
              { name: 'members', type: 'varchar' },
              { name: 'client', type: 'varchar' },
              { name: 'owner', type: 'varchar' },
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
