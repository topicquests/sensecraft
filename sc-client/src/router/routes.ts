import { RouteRecordRaw } from 'vue-router';
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        // TODO: clear up the role of each of those four pages.
        path: '/',
        name: 'root',
        component: () => import('pages/HomePage.vue'),
      },
      {
        path: '/home',
        name: 'home',
        component: () => import('pages/HomePage.vue'),
      },
      {
        path: '/lobby',
        name: 'lobby',
        component: () => import('pages/LobbyPage.vue'),
      },
      {
        path: '/admin',
        name: 'admin',
        component: () => import('pages/AdminPage.vue'),
      },
      //Quest pages
      {
        path: '/quest',
        name: 'quest_list',
        component: () => import('pages/QuestList.vue'),
      },
      {
        path: '/quest/create',
        name: 'create_quest',
        component: () => import('pages/CreateQuest.vue'),
      },
      {
        path: '/quest/:quest_id/edit',
        name: 'quest_edit',
        component: () => import('pages/QuestEdit.vue'),
      },
      {
        path: '/quest/:quest_id/node/:node_id(\\d+)',
        name: 'quest_page_node',
        component: () => import('pages/QuestPlayPage.vue'),
        meta: { samePage: 'quest_play' },
      },
      {
        path: '/quest/:quest_id',
        name: 'quest_page',
        component: () => import('pages/QuestPlayPage.vue'),
        meta: { samePage: 'quest_play' },
      },
      {
        path: '/quest/:quest_id/teams',
        name: 'quest_teams',
        component: () => import('pages/QuestTeamPage.vue'),
      },
      {
        path: '/guild',
        name: 'guild_list',
        component: () => import('pages/GuildList.vue'),
      },
      {
        path: 'guild/create',
        name: 'create_guild',
        component: () => import('pages/CreateGuild.vue'),
      },
      {
        path: '/guild/:guild_id',
        name: 'guild',
        component: () => import('pages/GuildPage.vue'),
      },
      {
        path: 'role/create/:guild_id',
        name: 'create_guild_role',
        component: () => import('pages/CreateRole.vue'),
      },
      {
        path: '/guild/:guild_id/admin',
        name: 'guild_admin',
        component: () => import('pages/GuildAdmin.vue'),
      },
      {
        path: '/register',
        name: 'register',
        component: () => import('pages/RegisterPage.vue'),
      },
      {
        path: '/signin',
        name: 'signin',
        component: () => import('pages/SignInPage.vue'),
      },
      {
        path: '/confirm',
        name: 'confirm_registration',
        component: () => import('pages/ConfirmRegistration.vue'),
      },
      {
        path: '/confirmPassword',
        name: 'confirm_password',
        component: () => import('pages/ConfirmPassword.vue'),
      },
      {
        path: '/reset_pass',
        name: 'reset_pass',
        component: () => import('pages/ResetPassword.vue'),
      },
      {
        path: '/guild/:guild_id/channel',
        name: 'guild_channel_list',
        component: () => import('pages/GuildChannelList.vue'),
      },
      {
        path: '/role/:role_id/edit',
        name: 'role_edit',
        component: () => import('pages/RoleEdit.vue'),
      },
      {
        path: '/guild/:guild_id/channel/:channel_id',
        name: 'guild_channel_conversation',
        component: () => import('pages/ChannelPage.vue'),
      },
      {
        path: '/guild/:guild_id/quest/:quest_id/channel',
        name: 'game_channel_list',
        component: () => import('pages/GameChannelList.vue'),
      },
      {
        path: '/guild/:guild_id/quest/:quest_id/channel/:channel_id',
        name: 'game_channel_conversation',
        component: () => import('pages/ChannelPage.vue'),
      },
      {
        path: 'house_rules',
        name: 'house_rules',
        component: () => import('pages/HouseRules.vue'),
      },
      {
        path: '/node/:quest_id',
        name: 'conversation_column',
        component: () => import('pages/ConversationColumn.vue'),
      },
      // Instructions pages
      {
        path: '/instructions',
        name: 'instructions',
        component: () => import('pages/instructions/InstructionsIndex.vue'),
      },
      {
        path: '/instructions/create-quest',
        name: 'instructions_create_quest',
        component: () =>
          import('pages/instructions/CreateQuestInstructions.vue'),
      },
      {
        path: '/instructions/edit-quest',
        name: 'instructions_edit_quest',
        component: () =>
          import('pages/instructions/EditQuestInstructions.vue'),
      },
      {
        path: '/instructions/create-guild',
        name: 'instructions_create_guild',
        component: () =>
          import('pages/instructions/CreateGuildInstructions.vue'),
      },
      {
        path: '/instructions/join-guild',
        name: 'instructions_join_guild',
        component: () =>
          import('pages/instructions/JoinGuildInstructions.vue'),
      },
      {
        path: '/instructions/guild-conversations',
        name: 'instructions_guild_conversations',
        component: () =>
          import('pages/instructions/GuildConversationsInstructions.vue'),
      },
      {
        path: '/instructions/join-quest',
        name: 'instructions_join_quest',
        component: () =>
          import('pages/instructions/JoinQuestInstructions.vue'),
      },
      {
        path: '/instructions/set-roles',
        name: 'instructions_set_roles',
        component: () =>
          import('pages/instructions/SetRolesInstructions.vue'),
      },
      {
        path: '/instructions/channels',
        name: 'instructions_channels',
        component: () =>
          import('pages/instructions/ChannelsInstructions.vue'),
      },
      {
        path: '/instructions/play-quest',
        name: 'instructions_play_quest',
        component: () =>
          import('pages/instructions/PlayQuestInstructions.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
