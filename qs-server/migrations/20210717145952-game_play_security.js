'use strict';

module.exports = {
  up: async (queryInterface) => {
    const db_name = queryInterface.sequelize.getDatabaseName();
    await queryInterface.sequelize.query(
      `GRANT SELECT ON game_play TO ${db_name}__client`);
    await queryInterface.sequelize.query(
      `GRANT SELECT, INSERT, UPDATE, DELETE ON game_play TO ${db_name}__member`);
    await queryInterface.sequelize.query(
      `ALTER TYPE enum_guild_membership_permissions
      ADD VALUE IF NOT EXISTS 'joinQuest'`);
    await queryInterface.sequelize.query(
      'ALTER TABLE game_play ALTER COLUMN "createdAt" SET DEFAULT now()');
    await queryInterface.sequelize.query(
      'ALTER TABLE game_play ALTER COLUMN scores SET DEFAULT \'{}\'');
    await queryInterface.sequelize.query(
      'ALTER TABLE game_play ALTER COLUMN status SET DEFAULT \'confirmed\'');

    await queryInterface.sequelize.query(
      'ALTER TABLE game_play ENABLE ROW LEVEL SECURITY');

    await queryInterface.sequelize.query(
      'DROP POLICY IF EXISTS game_play_select_policy ON game_play');
    await queryInterface.sequelize.query(
      'DROP POLICY IF EXISTS game_play_update_policy ON game_play');
    await queryInterface.sequelize.query(
      'DROP POLICY IF EXISTS game_play_insert_policy ON game_play');
    await queryInterface.sequelize.query(
      'DROP POLICY IF EXISTS game_play_delete_policy ON game_play');
    await queryInterface.sequelize.query(
      `CREATE POLICY game_play_select_policy ON game_play FOR SELECT USING
        (((SELECT public FROM guilds WHERE guilds.id = guild_id) AND
        (SELECT public FROM quests WHERE quests.id = quest_id))
         OR is_guild_id_member(guild_id) OR is_quest_id_member(quest_id))`);
    await queryInterface.sequelize.query(
      `CREATE POLICY game_play_update_policy ON game_play FOR UPDATE USING
        (is_quest_id_member(quest_id) OR has_guild_permission(guild_id, 'joinQuest'::enum_guild_membership_permissions))`);
    await queryInterface.sequelize.query(
      `CREATE POLICY game_play_insert_policy ON game_play FOR INSERT WITH CHECK
        (is_quest_id_member(quest_id) OR has_guild_permission(guild_id, 'joinQuest'::enum_guild_membership_permissions))`);
    await queryInterface.sequelize.query(
      `CREATE POLICY game_play_delete_policy ON game_play FOR DELETE USING
        (is_quest_id_member(quest_id) OR has_guild_permission(guild_id, 'joinQuest'::enum_guild_membership_permissions))`);

    await queryInterface.createFunction(
      'before_createup_game_play', [], 'trigger', 'plpgsql', `
      IF OLD IS NOT NULL THEN
        NEW.quest_id = OLD.quest_id;
        NEW.guild_id = OLD.guild_id;
      END IF;
      SELECT status INTO STRICT quest_status FROM quests where quests.id = NEW.quest_id;
      is_requested := NOT (OLD IS NULL OR OLD.status = 'invitation');
      is_invited := NOT (OLD IS NULL OR OLD.status = 'request');
      IF has_guild_permission(NEW.guild_id, 'joinQuest'::enum_guild_membership_permissions)
         AND (quest_status = 'registration' OR quest_status = 'ongoing') THEN
        is_requested := is_requested OR (NEW.status != 'invitation');
      ELSE
        IF OLD IS NULL OR OLD.status != NEW.status THEN
          RETURN NULL;
        END IF;
      END IF;
      IF is_quest_id_member(NEW.quest_id) THEN
        is_invited := is_invited OR (NEW.status != 'request');
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
      RETURN NEW;
      `, [], {
        force: true,
        variables: [
          { name: 'is_requested', type: 'boolean' },
          { name: 'is_invited', type: 'boolean' },
          { name: 'quest_status', type: 'enum_quests_status' },
        ]});

    await queryInterface.sequelize.query(`
      CREATE TRIGGER before_create_game_play BEFORE INSERT ON public.game_play
      FOR EACH ROW EXECUTE FUNCTION before_createup_game_play()`);
    await queryInterface.sequelize.query(`
      CREATE TRIGGER before_update_game_play BEFORE UPDATE ON public.game_play
      FOR EACH ROW EXECUTE FUNCTION before_createup_game_play()`);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(
      'ALTER TABLE game_play DISABLE ROW LEVEL SECURITY');
    await queryInterface.sequelize.query(
      'DROP TRIGGER IF EXISTS before_update_game_play ON game_play');
    await queryInterface.sequelize.query(
      'DROP TRIGGER IF EXISTS before_create_game_play ON game_play');
    await queryInterface.sequelize.query(
      'ALTER TABLE game_play ALTER COLUMN "createdAt" DROP DEFAULT');
    await queryInterface.sequelize.query(
      'ALTER TABLE game_play ALTER COLUMN scores DROP DEFAULT');
    await queryInterface.sequelize.query(
      'ALTER TABLE game_play ALTER COLUMN status SET DEFAULT \'request\'');
  }
};
