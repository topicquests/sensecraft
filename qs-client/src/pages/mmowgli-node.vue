<template>
  <q-page :padding="true">
    <!-- Create a card centered in an upper row -->
    <div inline style="width: 500px margin: auto;
      width: 60%;">
      <!-- guessing on label -->
      <h2><img style="margin-right:4px;" :src="q.img" >{{ q.label }}</h2>
      <!-- todo 
        needs 
          an ibis icon - how to bring that in, depends on
          node type,
          link to parent - could pass that in
          context - passed in allows to know whether transcluded
          maybe other things
          -->
    </div>
    <div class="details">
        <div  v-html="q.details"></div>
    </div>
       
    <!--<br/><br/> -->
<!-- What follows is any child nodes
   and tags around this topic
   tags dragged here from FeatherWeight
   they will be removed for the demo, but returned later -->
    <q-list> <!-- start expansion items -->
      <!-- TODO
        issues painting icons
        router settings need to reflect proper routes and prams
      -->
      <q-expansion-item icon="icons/ibis/issue_sm.png" label="Questions" >
        <div>
          <div v-if="isAuthenticated" class="node">
            <a :href="`/nodeedit/question/${q.type}/${q.nodeId}`">
              New Question</a>
          </div>
          <q-list>
            <q-item class="node wordwrap" v-for="question in q.questions" :key="question.nodeId">
              <router-link :to="{ name: 'questview', params: { id: question.nodeId }}">{{ question.label }}</router-link>
            </q-item>
          </q-list>
        </div>
      </q-expansion-item>
      <q-expansion-item icon="icons/ibis/position_sm.png" label="Answers"      >
        <div>
          <div v-if="isAuthenticated" class="node">
            <a :href="`/nodeedit/answer/${q.type}/${q.nodeId}`">
              New Answer</a>
          </div>
        </div>
        <q-list>
          <q-item class="node" v-for="answer in q.answers" :key="answer.nodeId">
            <router-link :to="{ name: 'quest', params: { quest_id: answer.nodeId }}">{{ answer.label }}</router-link>
          </q-item>
        </q-list>
      </q-expansion-item>
      <q-expansion-item icon="icons/ibis/plus_sm.png" label="Pro Arguments">
        <div>
          <div v-if="isAuthenticated" class="node">
            <a :href="`/nodeedit/pro/${q.type}/${q.nodeId}`">
              New Pro Argument</a>
          </div>
        </div>
        <q-list>
          <q-item class="node" v-for="pro in q.pros" :key="pro.nodeId">
            <router-link :to="{ name: 'quest', params: { quest_id: pro.nodeId }}">{{ pro.label }}</router-link>
          </q-item>
        </q-list>
      </q-expansion-item>
      <q-expansion-item icon="icons/ibis/minus_sm.png" label="Con Arguments">
        <div>
          <div v-if="isAuthenticated" class="node">
            <a :href="`/nodeedit/con/${q.type}/${q.nodeId}`">
              New Con Argument</a>
          </div>
        </div>
        <q-list>
          <q-item class="node" v-for="con in q.cons" :key="con.nodeId">
            <router-link :to="{ name: 'questview', params: { id: con.nodeId }}">{{ con.label }}</router-link>
          </q-item>
        </q-list>
      </q-expansion-item>
      <!--
      <q-expansion-item v-if="isTopic" image="statics/images/cogwheel.png" label="Subclasses">
        <div>
          <div v-if="isAuthenticated" class="node">
            <a :href="`/topicchild/${q.nodeId}/subclass`">
              New Subclass Topic</a>
          </div>
        </div>
        
        <q-list>
          <q-item class="node" v-for="sub in q.subclasses" :key="sub.nodeId">
            <router-link :to="{ name: 'topicview', params: { id: sub.nodeId }}">{{ sub.label }}</router-link>
          </q-item>
        </q-list> 
      </q-expansion-item>
      
      <q-expansion-item v-if="isTopic" image="statics/images/cogwheel.png" label="Instances">
        <div>
          <div v-if="isAuthenticated" class="node">
            <a :href="`/topicchild/${q.nodeId}/instance`">
              New Instance Topic</a>
          </div>
        <q-list>
          <q-item class="node" v-for="inst in q.instances" :key="inst.nodeId">
            <router-link :to="{ name: 'topicview', params: { id: inst.nodeId }}">{{ inst.label }}</router-link>
          </q-item>
        </q-list>
        </div>
      </q-expansion-item>-->
      <!--
      <q-expansion-item image="statics/images/tag.png" label="Tags">
        <div>
          <div v-if="isAuthenticated" class="node">
            <a :href="`/tagform/${q.nodeId}`">
              Add Tags</a>
          </div>
        </div>
  
        <q-list>
          <q-item class="node" v-for="tag in q.tags" :key="tag.nodeId">
            <router-link :to="{ name: 'tagview', params: { id: tag.nodeId }}">{{ tag.label }}</router-link>
          </q-item>
        </q-list>
      </q-expansion-item>
      <q-expansion-item image="statics/images/link.png" label="Connections">
        <div>
          <div>
            <div v-if="isAuthenticated" class="node">
              <a :href="`/connedit/${q.nodeId}`">
                New Connection</a>
            </div>
          </div>
          <q-list>
            <q-item class="node" v-for="reln in q.relations" :key="reln.nodeId">
              <router-link :to="{ name: 'topicview', params: { id: reln.nodeId}}">{{ reln.label }}</router-link>
            </q-item>
          </q-list>
        </div>
      </q-expansion-item>
      <q-expansion-item image="statics/images/properties.png" label="Properties">
        <div>
          <div>
            <div v-if="isAuthenticated" class="node">
              <a :href="`/props/${q.nodeId}`">
                New Property</a>
            </div>
          </div>
          <q-list>
<q-item class="node" v-for="{value, key} in q.properties" :key="key">
             <b>Key:</b> {{key}} &nbsp; <b>Value:</b> {{cleanup(value)}}
   </q-item>          </q-list>
        </div>
      </q-expansion-item>
      -->
    </q-list> <!-- end expansion items -->
  </q-page>
</template>

<script>
  //TODO
  // There are template fixes in mmowgli-node-alt which need
  // to be patched in here
  export default {
    //id = this node's id
    //context = the context of this node: if empty
    //  this node is not a transcluded node
    //  if not empty, this node must be painted in the
    //  appropriate context (parent and children)
    props: ["id", "context"],
    data () {
      return {
        label: '',
        q: ''
        
      }
    },
    computed: {
      canEdit () {
        return false;
        //TODO
      },
      isAuthenticated () {
        return true;
        //TODO return this.$store.getters.isAuthenticated
      }
    },
    mounted () {
      this.nodeId = this.$route.params.id
      //this.$data.rightDrawerOpen = false
      //turn off conversation tree
      //this.$store.commit('questView', false)

      
      this.initialize(this.nodeId)
    },
    methods: {
  
      async initialize (id = null) {
        //this.$store.commit('questView', true)        
        const nodeId = id || this.$route.params.id
        console.info('Initialize', 'fetching data for ', nodeId)
        this.q = this.mock(); //this.$store.quest.getters.getNode(); //('foo')
        console.info('node', this.q)
        if (this.q !== null) {
          //this.label = q.label;
          //add image to q
          this.getImage();
        } else {
          this.label = 'Bad'
        }
      },

        /*try {
          const result = await this.findConversations({
            query: { nodeId },
            depth: 1
          });
          console.info("Initialize", "result", { result });
          const {
            data: [single]
          } = result;

          this.setCurrentConversation(single);
          console.info("Initialize", "fetching data for ", nodeId, "success");
          console.info("SINGLE", JSON.stringify(single));
        } catch (e) {
          console.info("Initialize", "fetching data for ", nodeId, "error", e);
        }

        const self = this
        try {
          //TODO treeview must look for 'topic' 
          // rather than 'map' to paint a tree view
          treeview.get(nodeId)
            .then(function (tree) {
              console.info('TopicTreeView', tree)
              //const img = tree.img
              // only show the tree if the root is a map
              //if (img === 'statics/images/map_sm.png' ||
              //    img === 'statics/images/bookmark_sm.png') {
                const result = []
                result.push(tree)
                self.$store.commit('tree', result)
                self.$store.commit('questView', true)
              //}
            })     
        } catch (err) {
          console.log('QuestViewTreeError', err)
        }
        */
      getImage () {
        const type = this.q.type;
        const rslt = 'icons/ibis/issue.png';
        console.log('ICON', type, rslt);
        this.q.img = rslt;
      },
      mock () {
        const node = {};
        node.nodeId= 'foo',
        node.label= 'Why is the sky blue?',
        node.type= 'Question',
        node.details= "Now is the time for all good men to come to the aid of their country.",
        node.questions= [],
        node.answers= [];
        node.pro= [],
        node.cons=[],
        node.refs= []
        return node;
      }
      
    }
  }
  

</script>
<style lang="styl">
.q-item-image {
    min-width: 20px;
    max-width: 20px;
}

.scroll.relative-position.overflow-hidden.fit.q-touch {
  user-select: auto !important;
}


.details {
  max-width: 960px;
  height: 400px;
  overflow: auto;
  overflow-wrap: normal;
}


.headerimage {
  float: left;
  vertical-align: middle;
  margin-right: 4px;
}

.node {
  margin-top: 4px;
  float: top;
  border: 1px solid black;
  border-radius: 3px;
  min-height: 40px;
  overflow-wrap: inherit;
  font-family: pragmatica-web, sans-serif;
  white-space: -moz-pre-wrap !important; /* Mozilla, since 1999 */
  white-space: -pre-wrap; /* Opera 4-6 */
  white-space: -o-pre-wrap; /* Opera 7 */
  white-space: pre-wrap; /* css-3 */
  word-wrap: break-word; /* Internet Explorer 5.5+ */
  white-space: -webkit-pre-wrap; /* Newer versions of Chrome/Safari*/
  white-space: normal;
}

.node:hover {
  background-color: rgba(255, 255, 0, 0.801);
}


/*
 * width: 958px;
 */
#topbox {
  border: 1px solid black;
  background: white;
  margin: 12px;
  font-family: pragmatica-web, sans-serif;
  border-radius: 3px;
}
</style>