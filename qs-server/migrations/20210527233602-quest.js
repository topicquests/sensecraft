'use strict';

const Enums = require('../src/models/enums.model');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    const db_name = queryInterface.sequelize.getDatabaseName();
    const name_prefix_l = db_name.length + 5;

    await queryInterface.sequelize.query(
      `ALTER ROLE ${db_name}__client NOINHERIT`);

    await queryInterface.sequelize.query(
      `GRANT SELECT ON public.users TO ${db_name}__member`);

    await queryInterface.createFunction(
      'role_to_handle', [{name: 'role', type: 'varchar'}], 'varchar', 'plpgsql',
      `IF role ~ '^${db_name}__[mglq]_.+' THEN
        RETURN substr(role, ${name_prefix_l});
      ELSE
        RETURN NULL;
      END IF;`,
      ['IMMUTABLE'], { force: true }
    );

    await queryInterface.createFunction(
      'scuser_handle', [], 'varchar', 'plpgsql',
      'RETURN role_to_handle(cast(current_user as varchar));',
      ['STABLE'], { force: true }
    );

    await queryInterface.createFunction(
      'current_user_id', [], 'integer', 'plpgsql',
      'RETURN (SELECT id FROM users WHERE scuser_handle() = handle);',
      ['STABLE'], { force: true }
    );

    await queryInterface.addColumn(
      'users', 'permissions', DataTypes.ARRAY(Enums.Permissions), {force: true});

    await queryInterface.createFunction(
      'has_permission', [
        { name: 'permission', type: 'varchar' }], 'boolean', 'plpgsql',
      `RETURN current_user = '${db_name}__owner' OR COALESCE((SELECT permissions && CAST(ARRAY['superadmin', permission] AS enum_users_permissions[])
        FROM users where handle = scuser_handle()), FALSE);`,
      ['STABLE'], { force: true }
    );

    await queryInterface.createFunction(
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

    await queryInterface.sequelize.query(`
      CREATE TRIGGER before_update_user BEFORE UPDATE ON public.users
      FOR EACH ROW EXECUTE FUNCTION before_update_user()`);

    await queryInterface.createFunction(
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

    await queryInterface.createTable('quests', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
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
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'SET NULL'
      },
      public: {
        type: DataTypes.BOOLEAN,
      },
      status: {
        type: Enums.QuestStatus,
      },
      start: {
        type: DataTypes.DATE,
      },
      end: {
        type: DataTypes.DATE,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('quest_membership', {
      quest_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'quests',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      confirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      permissions: {
        type: DataTypes.ARRAY(Enums.Permissions),
      }
    });
    await queryInterface.sequelize.query(
      'CREATE VIEW public_quests AS select * FROM quests WHERE public');

    await queryInterface.sequelize.query(
      'CREATE VIEW my_quest_memberships AS SELECT * from quest_membership WHERE user_id = current_user_id()');

    await queryInterface.sequelize.query(
      `GRANT SELECT ON quests, quest_membership, public_quests, my_quest_memberships TO ${db_name}__member, ${db_name}__client`);
    await queryInterface.sequelize.query(
      `GRANT INSERT ON quests, quest_membership TO ${db_name}__member`);
    await queryInterface.sequelize.query(
      `GRANT USAGE ON public.quests_id_seq TO ${db_name}__member`);

    await queryInterface.createFunction(
      'is_quest_member', [
        {type: 'varchar', name: 'quest', direction: 'IN'}
      ], 'boolean', 'plpgsql',
      `RETURN (SELECT count(*) FROM quest_membership
      JOIN users ON users.id=user_id
      JOIN quests ON quests.id=quest_id
      WHERE quests.handle = quest
      AND confirmed
      AND users.handle = scuser_handle()) > 0;`,
      ['STABLE'], { force: true }
    );

    await queryInterface.createFunction(
      'is_quest_id_member', [
        {type: 'integer', name: 'questid', direction: 'IN'}
      ], 'boolean', 'plpgsql',
      `RETURN (SELECT count(*) FROM quest_membership
      JOIN users ON users.id=user_id
      WHERE quests_id = questid
      AND confirmed
      AND users.handle = scuser_handle()) > 0;`,
      ['STABLE'], { force: true }
    );

    await queryInterface.createFunction(
      'quest_permissions', [
        {type: 'varchar', name: 'quest', direction: 'IN'}
      ], 'enum_users_permissions[]', 'plpgsql',
      `RETURN (SELECT count(*) FROM quest_membership
      JOIN users ON users.id=user_id
      JOIN quests ON quests.id=quest_id
      WHERE quests.handle = quest
      AND confirmed
      AND users.handle = scuser_handle()) > 0;`,
      ['STABLE'], { force: true }
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE quests ENABLE ROW LEVEL SECURITY');
    await queryInterface.sequelize.query(
      `CREATE POLICY quests_select_policy ON quests FOR SELECT USING
      (public OR creator = current_user_id() OR id IN(SELECT quest_id FROM my_quest_memberships WHERE confirmed))`);
    // could use is_quest_member above, check timing.

    await queryInterface.sequelize.query(
      `CREATE POLICY quests_insert_policy ON quests FOR INSERT WITH CHECK
      (has_permission('createQuest'))`);

    await queryInterface.sequelize.query(
      'ALTER TABLE quest_membership ENABLE ROW LEVEL SECURITY');

    await queryInterface.sequelize.query(
      `CREATE POLICY quest_membership_select_policy ON quest_membership FOR SELECT USING
        (user_id = current_user_id() OR (SELECT id FROM public_quests WHERE public_quests.id = quest_id) IS NOT NULL
        OR quest_id IN(SELECT quest_id FROM my_quest_memberships WHERE confirmed))`);
    await queryInterface.sequelize.query(
      `CREATE POLICY quest_membership_update_policy ON quest_membership FOR UPDATE USING
        (is_quest_id_member(quest_id))`);
    await queryInterface.sequelize.query(
      `CREATE POLICY quest_update_policy ON quests FOR UPDATE USING
        (is_quest_id_member(id))`);

    await queryInterface.createFunction(
      'before_create_quest', [], 'trigger', 'plpgsql',
      `questrole := '${db_name}__q_' || NEW.handle;
      NEW.creator := current_user_id();
      curuser := current_user;
      SET LOCAL ROLE ${db_name}__owner;
      EXECUTE 'CREATE ROLE ' || questrole;
      EXECUTE 'ALTER GROUP ' || questrole || ' ADD USER ${db_name}__client';
      EXECUTE 'SET LOCAL ROLE ' || curuser;
      RETURN NEW;`, [], {
        force: true,
        variables: [
          { name: 'curuser', type: 'varchar' },
          { name: 'questrole', type: 'varchar' },
        ]
      }
    );
    await queryInterface.sequelize.query(`
      CREATE TRIGGER before_create_quest BEFORE INSERT ON public.quests
      FOR EACH ROW EXECUTE FUNCTION before_create_quest()`);

    await queryInterface.createFunction(
      'alter_quest_membership', [
        { name: 'quest', type: 'varchar' },
        { name: 'member', type: 'varchar' },
        { name: 'adding', type: 'boolean' },
      ], 'void', 'plpgsql',
      `curuser := current_user;
      SET LOCAL ROLE ${db_name}__owner;
      IF adding THEN
        EXECUTE 'ALTER GROUP ${db_name}__q_' || quest || ' ADD USER ${db_name}__m_' || member;
      ELSE
        EXECUTE 'ALTER GROUP ${db_name}__q_' || quest || ' DROP USER ${db_name}__m_' || member;
      END IF;
      EXECUTE 'SET LOCAL ROLE ' || curuser;`, [], {
        force: true,
        variables: [
          { name: 'curuser', type: 'varchar' }
        ]
      });

    await queryInterface.createFunction(
      'after_create_quest', [], 'trigger', 'plpgsql',
      `user_id := current_user_id();
      IF user_id IS NOT NULL THEN
        curuser := current_user;
        SET LOCAL ROLE ${db_name}__owner;
        INSERT INTO quest_membership VALUES (NEW.id, user_id, true, null);
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
    await queryInterface.sequelize.query(`
      CREATE TRIGGER after_create_quest AFTER INSERT ON public.quests
      FOR EACH ROW EXECUTE FUNCTION after_create_quest()`);

    await queryInterface.createFunction(
      'after_delete_quest', [], 'trigger', 'plpgsql',
      `questrole := '${db_name}__q_' || OLD.handle;
      curuser := current_user;
      SET LOCAL ROLE ${db_name}__owner;
      EXECUTE 'DROP ROLE ' || questrole;
      EXECUTE 'SET LOCAL ROLE ' || curuser;
      RETURN NEW;`,
      [], {
        force: true,
        variables: [
          { name: 'curuser', type: 'varchar' },
          { name: 'questrole', type: 'varchar' },
        ]
      }
    );
    await queryInterface.sequelize.query(
      `CREATE TRIGGER after_delete_quest AFTER DELETE ON public.quests
       FOR EACH ROW EXECUTE FUNCTION after_delete_quest()`);

    await queryInterface.createFunction(
      'before_update_quest', [], 'trigger', 'plpgsql',
      `IF NEW.handle <> OLD.handle THEN
        RETURN NULL;
      END IF;
      RETURN NEW;`,
      [], { force: true }
    );
    await queryInterface.sequelize.query(`
      CREATE TRIGGER before_update_quest BEFORE UPDATE ON public.quests
      FOR EACH ROW EXECUTE FUNCTION before_update_quest()`);
    await queryInterface.createFunction(
      'before_createup_quest_membership', [], 'trigger', 'plpgsql',
      `SELECT handle INTO STRICT quest FROM quests WHERE id=NEW.quest_id;
      SELECT handle INTO STRICT member FROM users WHERE id=NEW.user_id;
      IF member IS NOT NULL AND quest IS NOT NULL THEN
        PERFORM alter_quest_membership(quest, member, NEW.confirmed);
      END IF;
      RETURN NEW;`, [], {
        force: true,
        variables: [
          { name: 'quest', type: 'varchar' },
          { name: 'member', type: 'varchar' },
        ]});
    await queryInterface.sequelize.query(`
      CREATE TRIGGER before_create_quest_membership BEFORE INSERT ON public.quest_membership
      FOR EACH ROW EXECUTE FUNCTION before_createup_quest_membership()`);
    await queryInterface.sequelize.query(`
      CREATE TRIGGER before_update_quest_membership BEFORE UPDATE ON public.quest_membership
      FOR EACH ROW EXECUTE FUNCTION before_createup_quest_membership()`);
    await queryInterface.createFunction(
      'after_delete_quest_membership', [], 'trigger', 'plpgsql',
      `SELECT handle INTO memberrole FROM users WHERE id=OLD.user_id;
      SELECT handle INTO questrole FROM quests WHERE id=OLD.quest_id;
      IF questrole IS NOT NULL AND memberrole IS NOT NULL THEN
        curuser := current_user;
        SET LOCAL ROLE ${db_name}__owner;
        EXECUTE 'ALTER GROUP ${db_name}__q_' || questrole || ' DROP USER ${db_name}__m_' || memberrole;
        EXECUTE 'SET LOCAL ROLE ' || curuser;
      END IF;
      RETURN OLD;`, [], {
        force: true,
        variables: [
          { name: 'curuser', type: 'varchar' },
          { name: 'questrole', type: 'varchar' },
          { name: 'memberrole', type: 'varchar' },
        ]});
    await queryInterface.sequelize.query(`
      CREATE TRIGGER after_delete_quest_membership AFTER DELETE ON public.quest_membership
      FOR EACH ROW EXECUTE FUNCTION after_delete_quest_membership()`);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query('DELETE FROM quests');
    await queryInterface.sequelize.query('DROP POLICY quest_membership_update_policy on quest_membership');
    await queryInterface.sequelize.query('DROP POLICY quest_membership_select_policy on quest_membership');
    await queryInterface.sequelize.query('DROP POLICY quest_update_policy on quests');
    await queryInterface.sequelize.query('DROP POLICY quests_select_policy on quests');
    await queryInterface.sequelize.query('DROP POLICY quests_insert_policy on quests');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS before_create_quest ON quests');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS after_create_quest ON quests');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS before_update_quest ON quests');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS after_delete_quest ON quests');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS before_create_quest_membership ON quest_membership');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS before_update_quest_membership ON quest_membership');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS after_delete_quest_membership ON quest_membership');
    await queryInterface.dropFunction('before_createup_quest_membership', []);
    await queryInterface.dropFunction('after_delete_quest_membership', []);
    await queryInterface.dropFunction('before_create_quest', []);
    await queryInterface.dropFunction('before_update_quest', []);
    await queryInterface.dropFunction('after_delete_quest', []);
    await queryInterface.dropFunction('alter_quest_membership', [
      { name: 'quest', type: 'varchar' },
      { name: 'member', type: 'varchar' },
      { name: 'adding', type: 'boolean' }]);
    await queryInterface.dropFunction('is_quest_member', [{
      type: 'varchar', name: 'quest', direction: 'IN'}]);
    await queryInterface.dropFunction('is_quest_id_member', [{
      type: 'integer', name: 'questid', direction: 'IN'}]);
    await queryInterface.dropFunction('quest_permissions', [{
      type: 'varchar', name: 'quest', direction: 'IN'}]);
    await queryInterface.sequelize.query('DROP VIEW public_quests');
    await queryInterface.sequelize.query('DROP VIEW my_quest_memberships');
    await queryInterface.dropTable('quest_membership');
    await queryInterface.dropTable('quests');
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS before_update_user ON users');
    await queryInterface.dropFunction('before_update_user', []);
    await queryInterface.dropFunction('current_user_id', []);
    await queryInterface.dropFunction('has_permission', [
      { name: 'permission', type: 'varchar' }]);
    await queryInterface.dropFunction('scuser_handle', []);
    await queryInterface.dropFunction('role_to_handle', [
      { name: 'role', type: 'varchar' }]);
    await queryInterface.removeColumn('users', 'permissions');
    // TODO: Should I drop the enums? I doubt it
  }
};
