import MainLayout from "../MainLayout";
import { mountQuasar } from "@quasar/quasar-app-extension-testing-unit-jest";
import Vuex from "vuex";
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
  QItemLabel,
  QItemSection,
  QPageContainer,
  QFooter,
} from "quasar"; // <= cherry pick only the components you actually use
import { createLocalVue, createWrapper, RouterLinkStub } from "@vue/test-utils";
import routes from "../../router/routes";
import merge from "lodash.merge";
import { Store } from "vuex-mock-store";

const localVue = createLocalVue();
localVue.use(Vuex);

const mockRouter = {
  push: jest.fn(),
  goto: jest.fn(),
};

function createWrapper(storeConfig) {
  const defaultMountOptions = {
    mount: {
      mocks: {
        $route: routes,
        $router: mockRouter,
        $route: {
          params: { name: "top" },
        },
      },
      localVue,
      store: new Store(storeConfig),
      stubs: ["router-link", "router-view", "ripple"],
      RouterLink: RouterLinkStub,
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
        QItemLabel,
        QItemSection,
        QPageContainer,
        QFooter,
        QIcon,
      },
    },
    propsData: {},
  };
  return mountQuasar(MainLayout, merge(defaultMountOptions));
}

describe("MainLayout.vue not logged in button", () => {
  const storeConfig = {
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
  const wrapper = createWrapper(storeConfig);

  //Home image button
  it("renders home image button", () => {
    expect(wrapper.find("#home").exists()).toBe(true);
  });

  //Left drawer
  it("renders leftdrawer button", () => {
    expect(wrapper.find("#leftDrawer").exists()).toBe(true);
    expect(wrapper.find("#leftDrawer").isVisible()).toBe(true);
    wrapper.find("#leftDrawer").trigger("@click");
  });

  //Signup Button
  it("Signup button visible if no user authenticated", async () => {
    const button = wrapper.find("#register");
    expect(wrapper.find("#register").exists()).toBe(true);
    expect(wrapper.find("#register").isVisible()).toBe(true);
    await button.vm.$emit("click");
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "register" });
  });

  //   //Signin Button
  it("Signin button is visible if no user authenticated", async () => {
    const button = wrapper.find("#signin");
    expect(button.exists()).toBe(true);
    expect(button.isVisible()).toBe(true);
    await button.vm.$emit("click");
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "signin" });
  });

  //Logoff Button
  it("Logoff buttun is not visible no user authenticated", () => {
    const button = wrapper.find("#logoff");
    expect(button.exists()).toBe(false);
  });
});

describe("MainLayout.vue logged in button", () => {
  const storeConfig = {
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
  const wrapper = createWrapper(storeConfig);

  //   //Conversation node tree Button
  it("renders conversation node tree button", () => {
    expect(wrapper.find("#conversation_tree").exists()).toBe(false);
  });

  //Menu item lobby
  it("renders menu item lobby", () => {
    expect(wrapper.find("#lobby").exists()).toBe(true);
  });
  it("Lobby buttun not visible no user authenticated", () => {
    expect(wrapper.find("#lobby").isVisible()).toBe(true);
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
    expect(wrapper.find("#createQuest").isVisible()).toBe(true);
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
    expect(wrapper.find("#createGuild").isVisible()).toBe(true);
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
    expect(wrapper.find("#admin").exists()).toBe(true);
  });
});

describe("MainLayout.vue not logged in button", () => {
  const storeConfig = {
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
  const wrapper = createWrapper(storeConfig);

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
    //expect(store.dispatch).toHaveBeenCalledWith("member/logout");
    expect(mockRouter.push).toHaveBeenCalledWith({ name: "home" });
  });

  //Conversation node tree Button
  it("renders conversation node tree button", () => {
    expect(wrapper.find("#conversation_tree").exists()).toBe(false);
  });

  //Menu item lobby
  it("Lobby item visible if user authenticated", () => {
    const item_lobby = wrapper.find("#lobby");
    expect(item_lobby.isVisible()).toBe(true);
  });
  it("test router link lobby", () => {
    const item_lobby = wrapper.find("#lobby");
    const lobby_link = wrapper.find("#lobby_link");
    expect(wrapper.find("#lobby").props().to).toBe(undefined);
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
