<template>
  <q-page padding>
   <div class="column items-center" v-if="pastQuests.length > 0">
      <div class="col-4" style="width: 900px">
        <q-card>
          <q-table title="Past Quests" :data="pastQuests" :columns="columns1" row-key = "desc" id="quest_table">
            <template slot="body" slot-scope="props">
              <q-tr :props="props">
                <q-td key="desc" :props="props"> {{props.row.name}}</q-td>
                <q-td key="handle" :props="props">{{props.row.handle}}</q-td>
                <q-td key="status" :props="props">{{props.row.status}}</q-td>
                <q-td key="end" :props="props">{{props.row.end}}</q-td>
                <q-td key="questNodeId" auto-width :props="props">
                  <router-link :to="{ name: 'quest', params: { quest_id:  props.row.id }}" >Enter</router-link>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>

    <div class="column items-center" v-if="canRegisterToQuest && (potentialQuests.length > 0)">
      <div class="col-4" style="width: 900px">
        <q-card>
          <q-table title="Potential Quests" :data="potentialQuests" :columns="columns1" row-key = "desc" id="quest_table">
            <template slot="body" slot-scope="props">
              <q-tr :props="props">
                <q-td key="desc" :props="props"> {{props.row.name}}</q-td>
                <q-td key="handle" :props="props">{{props.row.handle}}</q-td>
                <q-td key="status" :props="props">{{props.row.status}}</q-td>
                <q-td key="start" :props="props">{{props.row.start}}</q-td>
                <span v-if="findPlayOfGuild(props.row.game_play)">
                  <span v-if="findPlayOfGuild(props.row.game_play).status == 'invitation'">
                    <q-td key="questNodeId" auto-width :props="props">
                      <q-btn label="Invitation" @click="doRegister(props.row.id)" class = "q-mr-md q-ml-md"/>
                    </q-td>
                  </span>
                  <span v-if="findPlayOfGuild(props.row.game_play).status == 'requested'">
                    <q-td key="questNodeId" auto-width :props="props">
                      Waiting for response
                    </q-td>
                  </span>
                </span>
                <span v-if="!props.row.game_play.find(function(gp) { return gp.guild_id == currentGuildId })">
                  <q-td key="questNodeId" auto-width :props="props">
                    <q-btn label="Register" @click="doRegister(props.row.id)" class = "q-mr-md q-ml-md"/>
                  </q-td>
                </span>
              </q-tr>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  // name: 'PageName',
}
</script>
