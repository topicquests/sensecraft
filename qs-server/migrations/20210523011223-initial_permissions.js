'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // console.log(queryInterface.sequelize);
    const db_name = queryInterface.sequelize.getDatabaseName();
    await queryInterface.changeColumn('users', 'handle', {
      type: Sequelize.DataTypes.STRING, allowNull: false
    });
    await queryInterface.sequelize.query(
      `GRANT SELECT, INSERT ON public.users TO ${db_name}__client`);
    await queryInterface.sequelize.query(
      `GRANT USAGE ON public.users_id_seq TO ${db_name}__client`);
    await queryInterface.createFunction(
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
    await queryInterface.sequelize.query(`
      CREATE TRIGGER before_create_user BEFORE INSERT ON public.users
      FOR EACH ROW EXECUTE FUNCTION before_create_user()`);

    await queryInterface.createFunction(
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
    await queryInterface.sequelize.query(
      `CREATE TRIGGER after_delete_user AFTER DELETE ON public.users
       FOR EACH ROW EXECUTE FUNCTION after_delete_user()`);
    // TODO: Block update of handle
  },

  down: async (queryInterface, Sequelize) => {
    const db_name = queryInterface.sequelize.getDatabaseName();
    await queryInterface.sequelize.query(
      `REVOKE SELECT, INSERT ON public.users FROM ${db_name}__client`);
    await queryInterface.sequelize.query(
      `REVOKE USAGE ON public.users_id_seq FROM ${db_name}__client`);
    await queryInterface.sequelize.query(
      'DROP TRIGGER before_create_user ON public.users');
    await queryInterface.dropFunction('before_create_user', []);
    await queryInterface.sequelize.query(
      'DROP TRIGGER after_delete_user ON public.users');
    await queryInterface.dropFunction('after_delete_user', []);
    await queryInterface.changeColumn('users', 'handle', {
      type: Sequelize.DataTypes.STRING,
      allowNull: true
    });
  }
};
