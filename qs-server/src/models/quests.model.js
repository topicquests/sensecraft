// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
const Sequelize = require('../utils/pgEnum-fix');
const DataTypes = Sequelize.DataTypes;
const Enums = require('./enums.model');

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const users = sequelizeClient.models.users;
  const quests = sequelizeClient.define('quests', {
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
    status: {
      type: Enums.QuestStatus,
    },
    start: {
      type: DataTypes.DATE,
    },
    end: {
      type: DataTypes.DATE,
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
  const quest_membership = sequelizeClient.define('quest_membership', {
    quest_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: quests,
        key: 'id'
      },
      onUpdate: 'cascade',
      onDelete: 'cascade'
    },
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: users,
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
          'CREATE VIEW public_quests AS select * FROM quests WHERE public');

        await sequelize.query(
          'CREATE VIEW my_quest_memberships AS SELECT * from quest_membership WHERE user_id = current_user_id()');

        await sequelize.query(
          `GRANT SELECT ON quests, quest_membership, public_quests, my_quest_memberships TO ${db_name}__member, ${db_name}__client`);
        await sequelize.query(
          `GRANT INSERT ON quests, quest_membership TO ${db_name}__member`);
        await sequelize.query(
          `GRANT USAGE ON public.quests_id_seq TO ${db_name}__member`);

        await sequelize.queryInterface.createFunction(
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

        await sequelize.queryInterface.createFunction(
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

        await sequelize.queryInterface.createFunction(
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

        await sequelize.query(
          'ALTER TABLE quests ENABLE ROW LEVEL SECURITY');
        await sequelize.query(
          `CREATE POLICY quests_select_policy ON quests FOR SELECT USING
          (public OR creator = current_user_id() OR id IN(SELECT quest_id FROM my_quest_memberships WHERE confirmed))`);
        // could use is_quest_member above, check timing.

        await sequelize.query(
          `CREATE POLICY quests_insert_policy ON quests FOR INSERT WITH CHECK
          (has_permission('createQuest'))`);

        await sequelize.query(
          'ALTER TABLE quest_membership ENABLE ROW LEVEL SECURITY');

        await sequelize.query(
          `CREATE POLICY quest_membership_select_policy ON quest_membership FOR SELECT USING
            (user_id = current_user_id() OR (SELECT id FROM public_quests WHERE public_quests.id = quest_id) IS NOT NULL
            OR quest_id IN(SELECT quest_id FROM my_quest_memberships WHERE confirmed))`);
        await sequelize.query(
          `CREATE POLICY quest_membership_update_policy ON quest_membership FOR UPDATE USING
            (is_quest_id_member(quest_id))`);
        await sequelize.query(
          `CREATE POLICY quest_update_policy ON quests FOR UPDATE USING
            (is_quest_id_member(id))`);

        await sequelize.queryInterface.createFunction(
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
        await sequelize.query(`
          CREATE TRIGGER before_create_quest BEFORE INSERT ON public.quests
          FOR EACH ROW EXECUTE FUNCTION before_create_quest()`);

        await sequelize.queryInterface.createFunction(
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

        await sequelize.queryInterface.createFunction(
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
        await sequelize.query(`
          CREATE TRIGGER after_create_quest AFTER INSERT ON public.quests
          FOR EACH ROW EXECUTE FUNCTION after_create_quest()`);

        await sequelize.queryInterface.createFunction(
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
        await sequelize.query(
          `CREATE TRIGGER after_delete_quest AFTER DELETE ON public.quests
          FOR EACH ROW EXECUTE FUNCTION after_delete_quest()`);

        await sequelize.queryInterface.createFunction(
          'before_update_quest', [], 'trigger', 'plpgsql',
          `IF NEW.handle <> OLD.handle THEN
            RETURN NULL;
          END IF;
          RETURN NEW;`,
          [], { force: true }
        );
        await sequelize.query(`
          CREATE TRIGGER before_update_quest BEFORE UPDATE ON public.quests
          FOR EACH ROW EXECUTE FUNCTION before_update_quest()`);
        await sequelize.queryInterface.createFunction(
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
        await sequelize.query(`
          CREATE TRIGGER before_create_quest_membership BEFORE INSERT ON public.quest_membership
          FOR EACH ROW EXECUTE FUNCTION before_createup_quest_membership()`);
        await sequelize.query(`
          CREATE TRIGGER before_update_quest_membership BEFORE UPDATE ON public.quest_membership
          FOR EACH ROW EXECUTE FUNCTION before_createup_quest_membership()`);
        await sequelize.queryInterface.createFunction(
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
        await sequelize.query(`
          CREATE TRIGGER after_delete_quest_membership AFTER DELETE ON public.quest_membership
          FOR EACH ROW EXECUTE FUNCTION after_delete_quest_membership()`);

      }
    }
  });
  // eslint-disable-next-line no-unused-vars
  quests.associate = function (models) {
    const users = models.users;
    quests.hasMany(quest_membership);
    quest_membership.hasOne(quests, { sourceKey: 'quest_id', foreignKey: 'id' });
    console.log(users);
    quest_membership.hasOne(users, {sourceKey: 'user_id', foreignKey: 'id'});
    users.hasMany(quest_membership);
    users.belongsToMany(quests, { through: quest_membership, foreignKey: 'quest_id', otherKey: 'user_id' });
    quests.belongsToMany(users, { through: quest_membership, foreignKey: 'user_id', otherKey: 'quest_id'  });

    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return quests;
};
