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
import routes from "../../router/routes";
import router from "../../router";

const localVue = createLocalVue();
// localVue.use(VueRouter);
var store;
var storeOptions;
var wrapper;

import MainLayout from "../MainLayout";

// reset spies, initial state and getters
afterEach(() => store.reset());

const mockRouter = {
  // route: routes,
  push: jest.fn(),
  goto: jest.fn(),
};

describe("MainLayout.vue not logged in", () => {
  beforeEach(() => {
    storeOptions = {
      state: {
        member: {
          isAuthenticated: false,
        },
        conversation: {},
      },
      getters: {
        hasPermission: () => false,
        "conversation/getNeighbourhoodTree": () => [],
      },
    };
    // create the Store mock
    store = new Store(storeOptions);
    // add other mocks here so they are accessible in every component
    const mocks = {
      $store: store,
      $route: routes,
      $router: mockRouter,
    };

    wrapper = mountQuasar(MainLayout, {
      mount: {
        mocks,
        localVue,
        router: router(),
        stubs: ["router-link", "router-view"],
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
  it("Signup button visible if no user authenticated", () => {
    expect(wrapper.find("#register").isVisible()).toBe(true);
  });

  //Signin Button
  it("renders signin button", () => {
    expect(wrapper.find("#signin").exists()).toBe(true);
  });
  it("Signin button is visible if no user authenticated", () => {
    expect(wrapper.find("#signin").isVisible()).toBe(true);
  });
  // TODO: test signin

  //Logoff Button
  it("renders logout button", () => {
    expect(wrapper.find("#logoff").exists()).toBe(true);
  });
  it("Logoff buttun is not visible no user authenticated", () => {
    expect(wrapper.find("#logoff").isVisible()).toBe(false);
  });
  it("logs out", async () => {
    // TODO: This should actually fail. Why logout when you're not logged in?
    const button = wrapper.find("#logoff");
    button.vm.$q.notify = jest.fn();
    await button.vm.$emit("click");
    expect(store.dispatch).toHaveBeenCalledWith("member/logout");
  });

  //Conversation node tree Button
  it("renders conversation node tree button", () => {
    expect(wrapper.find("#conversation_tree").exists()).toBe(true);
  });

  //Menu item lobby
  it("renders menu item lobby", () => {
    expect(wrapper.find("#lobby").exists()).toBe(true);
  });
  it("Lobby buttun not visible no user authenticated", () => {
    expect(wrapper.find("#lobby").isVisible()).toBe(false);
  });

  //Menu item quest view
  it("renders menu item quest view", () => {
    expect(wrapper.find("#questView").exists()).toBe(true);
  });
  it("quest view buttun is always visible", () => {
    expect(wrapper.find("#questView").isVisible()).toBe(true);
  });

  //Menu item create quest
  it("renders menu item create quest", () => {
    expect(wrapper.find("#createQuest").exists()).toBe(true);
  });
  it("quest create buttun is not visible no permission", () => {
    expect(wrapper.find("#createQuest").isVisible()).toBe(false);
  });

  //Menu item guild list
  it("renders menu item guild list", () => {
    expect(wrapper.find("#guildView").exists()).toBe(true);
  });
  it("guild view buttun is always visible", () => {
    expect(wrapper.find("#guildView").isVisible()).toBe(true);
  });

  //Menu item create guild
  it("renders menu item create guild", () => {
    expect(wrapper.find("#createGuild").exists()).toBe(true);
  });
  it("quild create buttun is not visible no permission", () => {
    expect(wrapper.find("#createGuild").isVisible()).toBe(false);
  });

  //Menu item home
  it("renders menu item home", () => {
    expect(wrapper.find("#home").exists()).toBe(true);
  });
  it("home buttun is always visible", () => {
    expect(wrapper.find("#home").isVisible()).toBe(true);
  });

  //Menu item admin
  it("renders menu item admin", () => {
    expect(wrapper.find("#admin").exists()).toBe(false);
  });
});

describe("MainLayout.logged in", () => {
  beforeEach(() => {
    storeOptions = {
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
    };
    // create the Store mock
    store = new Store(storeOptions);
    // add other mocks here so they are accessible in every component
    const mocks = {
      $store: store,
      $route: routes,
      $router: mockRouter,
    };

    wrapper = mountQuasar(MainLayout, {
      mount: {
        mocks,
        localVue,
        $route: routes,
        stubs: ["router-link", "router-view"],
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

  //Signup Button
  it("Signup button not visible if user authenticated", () => {
    expect(wrapper.find("#register").isVisible()).toBe(false);
  });

  //Signin Button
  it("Signin button not visible if user authenticated", () => {
    expect(wrapper.find("#signin").isVisible()).toBe(false);
  });

  //Logoff Button
  it("Logoff buttun is visible if user authenticated", () => {
    expect(wrapper.find("#logoff").isVisible()).toBe(true);
  });
  it("logs out", async () => {
    const button = wrapper.find("#logoff");
    button.vm.$q.notify = jest.fn();
    await button.vm.$emit("click");
    expect(store.dispatch).toHaveBeenCalledWith("member/logout");
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "home" });
  });

  //Conversation node tree Button
  it("renders conversation node tree button", () => {
    expect(wrapper.find("#conversation_tree").exists()).toBe(true);
  });

  //Menu item lobby
  it("Lobby buttun visible if user authenticated", () => {
    expect(wrapper.find("#lobby").isVisible()).toBe(true);
  });

  //Menu item quest view
  it("quest view buttun is always visible", () => {
    expect(wrapper.find("#questView").isVisible()).toBe(true);
  });

  //Menu item create quest
  it("quest create buttun is visible user has permission", () => {
    expect(wrapper.find("#createQuest").isVisible()).toBe(true);
  });

  //Menu item guild list
  it("guild view buttun is always visible", () => {
    expect(wrapper.find("#guildView").isVisible()).toBe(true);
  });

  //Menu item create guild
  it("quild create link is visible user has permission", () => {
    expect(wrapper.find("#createGuild").isVisible()).toBe(true);
  });

  //Menu item home
  it("home buttun is always visible", () => {
    expect(wrapper.find("#home").isVisible()).toBe(true);
  });

  //Menu item admin
  it("admin link is visible user has permission", () => {
    expect(wrapper.find("#admin").isVisible()).toBe(true);
  });
});
