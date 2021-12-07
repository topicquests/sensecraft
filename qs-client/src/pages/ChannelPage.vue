<template>
  <q-page class="page">
    <div class="col-3 q-md q-mb-md">
      <div v-if="selectedNodeId">
        <!-- cloned from GamePlay-->
        <node-form
          v-if="canEdit(selectedNodeId)"
          v-bind:nodeInput="selectedNode(true)"
          v-bind:allowAddChild="true"
          :editing="true"
          v-bind:ibisTypes="selectedIbisTypes"
          v-on:action="updateNode"
          v-on:addChild="addChild"
        />
        <node-form v-else v-bind:nodeInput="selectedNode()" />
        <q-btn
          v-if="!canEdit(selectedNodeId)"
          @click="addChild()"
          label="Add Child"
        />
      </div>
    </div>
  </q-page>
</template>
<script>
import { mapGetters, mapActions, mapState } from "vuex";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import questCard from "../components/quest-card.vue";
import nodeCard from "../components/node-card.vue";
import nodeForm from "../components/node-form.vue";
import nodeTree from "../components/node-tree.vue";
import {
  ibis_node_type_enum,
  ibis_node_type_type,
  ibis_node_type_list,
  publication_state_list,
  public_private_bool,
} from "../enums";
import app from "../App.vue";
import {
  ConversationState,
  ConversationGetterTypes,
  ConversationActionTypes,
  ibis_child_types,
} from "../store/conversation";
import {
  QuestsState,
  QuestsActionTypes,
  QuestsGetterTypes,
} from "../store/quests";
import {
  GuildsState,
  GuildsGetterTypes,
  GuildsActionTypes,
} from "../store/guilds";
import {
  MemberState,
  MemberGetterTypes,
  MemberActionTypes,
} from "../store/member";
import {
  registration_status_enum,
  quest_status_enum,
  permission_enum,
} from "../enums";
import {
  Quest,
  Guild,
  GamePlay,
  Casting,
  ConversationNode,
  Member,
} from "../types";
import Vue from "vue";
import Component from "vue-class-component";
import { MembersGetterTypes, MembersActionTypes } from "../store/members";
import { BaseGetterTypes } from "../store/baseStore";
</script>

<style></style>
