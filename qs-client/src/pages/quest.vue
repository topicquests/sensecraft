<template>
  <q-page class = 'bg-secondary'>  
    
    <div>
        <q-card>
          <div>
            <q-table title="Not Started Quests" :data="notStartedQuests" :columns="columns" row-key = "desc">
              <template slot="body" slot-scope="props">
                <q-tr :props="props">
                  <q-td key="desc" :props="props"> {{props.row.name}}</q-td>
                  <q-td key="label" :props="props">{{props.row.label}}</q-td>
                  <q-td key="handle" :props="props">{{props.row.handle}}</q-td>
                  <q-td key="status" :props="props">{{props.row.status}}</q-td>
                  <q-td key="date" :props="props">{{props.row.createdAt}}</q-td>
                  <q-td key="nodeId" auto-width :props="props">
                    <router-link :to="{ name: 'questview', params: { id:  props.row.id }}">View</router-link>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
        </q-card>
    </div>
    <div>
        <q-card>
          <div>
           <q-table title="In Progress Quests" :data="ongoingQuests" :columns="columns" row-key = "desc">
            <template slot="body" slot-scope="props">
              <q-tr :props="props">
                <q-td key="desc" :props="props"> {{props.row.name}}</q-td>
                <q-td key="label" :props="props">{{props.row.label}}</q-td>
                <q-td key="handle" :props="props">{{props.row.handle}}</q-td>
                <q-td key="status" :props="props">{{props.row.status}}</q-td>
                <q-td key="date" :props="props">{{props.row.createdAt}}</q-td>
                <q-td key="nodeId" auto-width :props="props">
                  <router-link :to="{ name: 'questview', params: { id:  props.row.id }}">View</router-link>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>
      </q-card>
    </div>
    <div> 
    <q-card>
      <div>
        <q-table title="Completed Quests" :data="finishedQuests" :columns="columns" row-key = "desc">
          <template slot="body" slot-scope="props">
            <q-tr :props="props">
              <q-td key="desc" :props="props"> {{props.row.name}}</q-td>
              <q-td key="label" :props="props">{{props.row.label}}</q-td>
              <q-td key="handle" :props="props">{{props.row.handle}}</q-td>
              <q-td key="status" :props="props">{{props.row.status}}</q-td>
              <q-td key="date" :props="props">{{props.row.createdAt}}</q-td>
              <q-td key="nodeId" auto-width :props="props">
                <router-link :to="{ name: 'questview', params: { id:  props.row.id }}">View</router-link>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </q-card>
    </div>       
  </q-page>
</template>

<script>

import { mapGetters } from "vuex";


export default {
  props: ["user"],
  data() {
    return {
      columns: [       
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
          name: "status",
          required: false,
          label: "Status",
          align: "left",
          field: "status",
          sortable: true
        },
        {
          name: "date",
          required: true,
          label: "Date",
          align: "left",
          field: "createdAt",
          sortable: true
        },
        {
          name: "nodeId",
          required: false,
          label: "Action",
          align: "left",
          field: "id",
          sortable: true
        }        
      ] 
    }
  },

  computed: {
    notStartedQuests() {   
     let found = this.$store.getters.getQuestByStatus('draft') 
     console.log("Quests with draft", found);
   
      return  this.$store.getters.getQuestByStatus('draft');
    },
    
    ongoingQuests() {     
       return  this.$store.getters.getQuestByStatus('ongoing');
    },

    finishedQuests() {     
       return  this.$store.getters.getQuestByStatus('finished');
    }     
  } 
};
</script>
