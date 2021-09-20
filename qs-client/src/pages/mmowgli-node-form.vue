<template>
  <q-page :padding="true">

      <h6>Topic Edit Form</h6>
      <h6 v-if="type">New Child Topic</h6>
      <div>
        <b>Subject</b><br/>
        <q-input v-model="label" />
      </div>
      <div>
        <b>Details</b><br/>
        <q-input v-model="details" />
      </div>
      <div>
        <q-btn label="Submit" @click="doSubmit" /><q-btn label="Cancel" @click="$router.push({name: '/home'})" />
      </div>
  </q-page>
</template>


<script>
//Called by two routes from TopicView.vue:
//  topicedit no params for a new topic
//  topicchild/:id/:type  where id is parentId, and type is oneOf 'subclass' or 'instance'
//Note that topic nodes are edited with NodeForm.vue
//https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/vuejs.html

//import api from 'src/api'
const api = null;
//TODO we may use another method for node ID
//const uuidv4 = require('uuid/v4')
const conversation = api.service('conversation')
var router

export default {
  // parentId required on new nodes
  // id not required on new nodes
  props: ["id", "type", parentId],
  data () {
    return {

      label: '',
      details: '',
      url: '',
      is_details: false //default
      // id: '',
      // member:
    }
  },
  computed: {
    member() {
      return this.$store.getters.member;
    }
  },
  methods: {
    doSubmit: function () {
      // alert(this.label);
      // alert(this.details);
      // alert(this.type);
      var mytype = this.type
      //console.log('TopicEditDid', mytype)
      var json = {}
     // json.nodeId = uuidv4()
      json.label = this.label
      json.url = this.url
      json.details = this.details
      json.img = 'statics/images/cogwheel.png'
      json.imgsm = 'statics/images/cogwheel_sm.png'
      json.creator = this.member._id
      json.handle = this.member.handle
      json.date = new Date()
      json.type = 'topic'
      if (mytype) {
        //only a mytype if this is a child of some other topic
        var kid
        if (mytype === 'subclass') {
          //subclass we are only allowing single inheritance for now
          json.subOf = this.id
        } else {
          json.instanceOf = this.id
        }
      }
      console.info('QFT-1', this.member)
      console.info('QFT-2', JSON.stringify(json))
      // use the conversation node database
      conversation.create(json).then((response) => {
          router.push('/topics')
          // parents, if any, set in server
      })
    }
  },
  mounted () {
    console.info('MMOWGLIEdit', 'mounted', this.type, this.id, this.isDetails);

    router = this.$router
    //TODO set is_details from isDetails

    //this.$store.commit('questView', false)
  },
  computed: {
    //member () {
      //return this.$store.getters.member
    }
  }

</script>

<style>
.details {
  max-width: 960px;
  height: 400px;
  overflow-wrap: normal;
}
</style>
