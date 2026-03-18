-- Allow game leaders to see all role_draft channels in their quest/guild
-- This updates the conversation_node_select_policy to include game leaders

BEGIN;

DROP POLICY IF EXISTS conversation_node_select_policy ON public.conversation_node;
CREATE POLICY conversation_node_select_policy ON public.conversation_node FOR SELECT USING (
  status = 'published' OR
  creator_id = current_member_id() OR
  (status = 'submitted' AND public.is_quest_id_member(quest_id)) OR
  (status = 'role_draft' AND guild_id IS NOT NULL AND quest_id IS NOT NULL AND has_game_role(quest_id, guild_id, draft_for_role_id)) OR
  (status = 'role_draft' AND guild_id IS NOT NULL AND quest_id IS NULL AND can_play_role(guild_id, draft_for_role_id)) OR
  -- Game leaders can see all role_draft channels in their quest/guild
  (status = 'role_draft' AND guild_id IS NOT NULL AND quest_id IS NOT NULL AND 
    EXISTS (
      SELECT 1
      FROM casting_role cr
      JOIN role r ON cr.role_id = r.id
      WHERE cr.member_id = current_member_id()
        AND r.name = 'Game leader'
        AND cr.quest_id = conversation_node.quest_id
        AND cr.guild_id = conversation_node.guild_id
    )
  ) OR
  (status > 'role_draft' AND guild_id IS NOT NULL AND guild_id = public.is_playing_quest_in_guild(quest_id)) OR
  (status > 'role_draft' AND guild_id IS NOT NULL AND quest_id IS NULL AND public.is_guild_id_member(guild_id))
);

COMMIT;
