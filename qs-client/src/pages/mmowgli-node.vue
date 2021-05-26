<template>
  <q-page :padding="true">
    <!-- Create a card centered in an upper row -->
    <q-card inline style="width: 500px margin: auto;
      width: 60%;">
      <!-- guessing on label -->
      <q-card-title>{{ label }}</q-card-title>
      <!-- todo 
        needs 
          an ibis icon - how to bring that in, depends on
          node type,
          link to parent - could pass that in
          context - passed in allows to know whether transcluded
          maybe other things
          -->
    </q-card>
<!-- What follows is any child nodes
   and tags around this topic
   tags dragged here from FeatherWeight
   they will be removed for the demo, but returned later -->
    <q-list>
      <q-collapsible image="statics/images/issue.png" label="Questions" >
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
      </q-collapsible>
      <q-collapsible image="statics/images/position.png" label="Answers"      >
        <div>
          <div v-if="isAuthenticated" class="node">
            <a :href="`/nodeedit/answer/${q.type}/${q.nodeId}`">
              New Answer</a>
          </div>
        </div>
        <q-list>
          <q-item class="node" v-for="answer in q.answers" :key="answer.nodeId">
            <router-link :to="{ name: 'questview', params: { id: answer.nodeId }}">{{ answer.label }}</router-link>
          </q-item>
        </q-list>
      </q-collapsible>
      <q-collapsible image="statics/images/plus.png" label="Pro Arguments">
        <div>
          <div v-if="isAuthenticated" class="node">
            <a :href="`/nodeedit/pro/${q.type}/${q.nodeId}`">
              New Pro Argument</a>
          </div>
        </div>
        <q-list>
          <q-item class="node" v-for="pro in q.pros" :key="pro.nodeId">
            <router-link :to="{ name: 'questview', params: { id: pro.nodeId }}">{{ pro.label }}</router-link>
          </q-item>
        </q-list>
      </q-collapsible>
      <q-collapsible image="statics/images/minus.png" label="Con Arguments">
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
      </q-collapsible>
      <q-collapsible v-if="isTopic" image="statics/images/cogwheel.png" label="Subclasses">
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
      </q-collapsible>
      <q-collapsible v-if="isTopic" image="statics/images/cogwheel.png" label="Instances">
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
      </q-collapsible>
      <q-collapsible image="statics/images/tag.png" label="Tags">
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
      </q-collapsible>
      <q-collapsible image="statics/images/link.png" label="Connections">
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
      </q-collapsible>
      <q-collapsible image="statics/images/properties.png" label="Properties">
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
      </q-collapsible>
    </q-list> 
  </q-page>
</template>

<script>
  export default {
    //id = this node's id
    //context = the context of this node: if empty
    //  this node is not a transcluded node
    //  if not empty, this node must be painted in the
    //  appropriate context (parent and children)
    props: ["id", "context"],
    data () {
      return {
        
        label: ''
        //details: '',
        //url: '',
        // id: '',
        // user: 
      }
    },
    computed: {
      isAuthenticated () {
        return this.$store.getters.isAuthenticated
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