import { Store } from "vuex-mock-store";
import { mountQuasar } from "@quasar/quasar-app-extension-testing-unit-jest";
import {
  QBtn,
  QHeader,
  QIcon,
  QLayout,
  QToolbar,
  QToolbarTitle,
  QImg,
  QDrawer,
  QScrollArea,
  QList,
  QItem,
  QPageContainer,
  QFooter,
} from "quasar"; // <= cherry pick only the components you actually use
import { createLocalVue } from "@vue/test-utils";
import VueRouter from "vue-router";
import router from "../../router";

const localVue = createLocalVue();
localVue.use(VueRouter);

import MainLayout from "../MainLayout";

// create the Store mock
const store = new Store({
  state: {
    member: {
      isAuthenticated: true,
      member: {
        id: 1,
      },
    },
    conversation: {},
  },
  getters: {
    hasPermission: () => true,
    "conversation/getNeighbourhoodTree": () => [],
  },
});
// add other mocks here so they are accessible in every component
const mocks = {
  $store: store,
};

// reset spies, initial state and getters
afterEach(() => store.reset());

describe("MainLayout.vue", () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mountQuasar(MainLayout, {
      mount: {
        mocks,
        localVue,
        router: router(),
      },
      quasar: {
        components: {
          QBtn,
          QHeader,
          QLayout,
          QToolbar,
          QToolbarTitle,
          QImg,
          QDrawer,
          QScrollArea,
          QList,
          QItem,
          QPageContainer,
          QFooter,
          QIcon,
        },
      },
      propsData: {},
    });
    expect(wrapper).toBeTruthy();
  });

  afterEach(() => store.reset());

  //Home image button
  it("renders home image button", () => {
    expect(wrapper.find("#home_image").exists()).toBe(true);
  });

  //Left drawer
  it("renders leftdrawer button", () => {
    expect(wrapper.find("#leftDrawer").exists()).toBe(true);
  });

  //Signup Button
  it("renders signup button", () => {
    expect(wrapper.find("#register").exists()).toBe(true);
  });

  it("logout button is hid if no user authenticated", () => {});
  it("logout button is shown if user authenticated", () => {});

  //Logoff Button
  it("renders logout button", () => {
    expect(wrapper.find("#logoff").exists()).toBe(true);
  });
  it("logs out", async () => {
    const button = wrapper.find("#logoff");
    button.vm.$q.notify = jest.fn();
    await button.vm.$emit("click");
    expect(store.dispatch).toHaveBeenCalledWith("member/logout");
  });

  it("logout button is hid if no user authenticated", () => {});
  it("logout button is shown if user authenticated", () => {});

  //Conversation node tree Button
  it("renders conversation node tree button", () => {
    expect(wrapper.find("#conversation_tree").exists()).toBe(true);
  });

  //Menu item lobby
  it("renders menu item lobby", () => {
    expect(wrapper.find("#lobby").exists()).toBe(true);
  });

  //Menu item quest view
  it("renders menu item quest view", () => {
    expect(wrapper.find("#questView").exists()).toBe(true);
  });

  //Menu item create quest
  it("renders menu item create quest", () => {
    expect(wrapper.find("#createQuest").exists()).toBe(true);
  });

  //Menu item guild list
  it("renders menu item guild list", () => {
    expect(wrapper.find("#guildView").exists()).toBe(true);
  });

  //Menu item create guild
  it("renders menu item create guild", () => {
    expect(wrapper.find("#createGuild").exists()).toBe(true);
  });

  //Menu item home
  it("renders menu item home", () => {
    expect(wrapper.find("#home").exists()).toBe(true);
  });

  //Menu item admin
  it("renders menu item admin", () => {
    expect(wrapper.find("#admin").exists()).toBe(true);
  });
});
