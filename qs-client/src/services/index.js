import * as member from "./memberService"
import * as guild from "./guildService"
import * as quest from "./questService"
import * as conversation from "./conversationService"

export default Object.assign({}, member, guild, quest, conversation);
