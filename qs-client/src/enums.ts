export enum permission_enum {
  superadmin = "superadmin",
  viewGuild = "viewGuild",
  viewQuest = "viewQuest",
  createQuest = "createQuest",
  createGuild = "createGuild",
  acceptGuildMembership = "acceptGuildMembership",
  revokeGuildMembership = "revokeGuildMembership",
  proposeGuildMembership = "proposeGuildMembership",
  publishGameMove = "publishGameMove",
  retractGameMove = "retractGameMove",
  acceptQuestMembership = "acceptQuestMembership",
  revokeQuestMembership = "revokeQuestMembership",
  proposeQuestMembership = "proposeQuestMembership",
  rejectGameMove = "rejectGameMove",
  guildAdmin = "guildAdmin",
  joinQuest = "joinQuest",
}

export type permission_type = keyof typeof permission_enum;
export const permission_list: permission_type[] = Object.keys(
  permission_enum
) as permission_type[];

export enum registration_status_enum {
  request = "request",
  invitation = "invitation",
  confirmed = "confirmed",
}

export type registration_status_type = keyof typeof registration_status_enum;
export const registration_status_list: registration_status_type[] = Object.keys(
  registration_status_enum
) as registration_status_type[];

export enum quest_status_enum {
  registration = "registration",
  draft = "draft",
  ongoing = "ongoing",
  paused = "paused",
  scoring = "scoring",
  finished = "finished",
}

export type quest_status_type = keyof typeof quest_status_enum;
export const quest_status_list: quest_status_type[] = Object.keys(
  quest_status_enum
) as quest_status_type[];

export enum ibis_node_type_enum {
  question = "question",
  answer = "answer",
  pro = "pro",
  con = "con",
  reference = "reference",
  quest = "quest",
  channel = "channel",
}

export type ibis_node_type_type = keyof typeof ibis_node_type_enum;
export const ibis_node_type_list: ibis_node_type_type[] = Object.keys(
  ibis_node_type_enum
) as ibis_node_type_type[];

export enum publication_state_enum {
  obsolete = "obsolete",
  private_draft = "private_draft",
  role_draft = "role_draft",
  guild_draft = "guild_draft",
  proposed = "proposed",
  submitted = "submitted",
  published = "published",
}

export type publication_state_type = keyof typeof publication_state_enum;
export const publication_state_list: publication_state_type[] = Object.keys(
  publication_state_enum
) as publication_state_type[];

export enum meta_type_enum {
  obsolete = "obsolete",
  private_draft = "private_draft",
  role_draft = "role_draft",
  guild_draft = "guild_draft",
  proposed = "proposed",
  submitted = "submitted",
  published = "published",
}

export type meta_type_type = keyof typeof meta_type_enum;
export const meta_type_list: meta_type_type[] = Object.keys(
  meta_type_enum
) as meta_type_type[];

export const public_private_bool = [
  {
    label: "Public",
    value: true,
  },
  {
    label: "Private",
    value: false,
  },
];
