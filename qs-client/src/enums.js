export const permission_enum = [
    'superadmin',
    'viewGuild',
    'viewQuest',
    'createQuest',
    'createGuild',
    'acceptGuildMembership',
    'revokeGuildMembership',
    'proposeGuildMembership',
    'publishGameMove',
    'retractGameMove',
    'acceptQuestMembership',
    'revokeQuestMembership',
    'proposeQuestMembership',
    'rejectGameMove',
    'guildAdmin',
    'joinQuest',
];

export const registration_status_enum = [
    'request',
    'invitation',
    'confirmed',
];

export const quest_status_enum = [
    'draft',
    'registration',
    'ongoing',
    'paused',
    'scoring',
    'finished',
];

export const ibis_node_type_enum = [
  'question',
  'answer',
  'pro',
  'con',
  'reference',
];

export const publication_state_enum = [
    'obsolete',
    'private_draft',
    'guild_draft',
    'proposed',
    'submitted',
    'published',
];

export const public_private_bool = [
  {
    label: 'Public',
    value: true
  },
  {
    label: 'Private',
    value: false
  }
];
