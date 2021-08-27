<template>
  <q-card >
            <q-table style="color: darkgreen; background-color: lightblue;" title="Quests" :data="this.quests" :columns="columns1" row-key = "desc">
              <template slot="body" slot-scope="props">
                <q-tr :props="props">
                  <q-td key="desc" :props="props"> {{props.row.name}}</q-td>
                  <q-td key="label" :props="props">{{props.row.label}}</q-td>
                  <q-td key="handle" :props="props">{{props.row.handle}}</q-td>
                  <q-td key="questNodeId" auto-width :props="props">
                    <router-link :to="{ name: 'questedit', params: { quest_id:  props.row.id }}">Edit</router-link>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
  </q-card>
</template>

<script>
import {mapState} from 'vuex';
export default {
  // name: 'ComponentName',
  data () {
    return {
      columns1: [
        {
          name: 'desc',
          required: true,
          label: "Label",
          align: "left",
          field: "name",
          sortable: true
        },
        {
          name: "handle",
          required: false,
          label: "Handle",
          align: "left",
          field: "handle",
          sortable: true
        },

        {
          name: "questNodeId",
          required: false,
          label: "Action",
          align: "left",
          field: "id",
          sortable: true
        }
      ],
    }
  },

  computed: {
    ...mapState('quests', {
       quests: state => state.quests
    }),
  }
}
</script>
