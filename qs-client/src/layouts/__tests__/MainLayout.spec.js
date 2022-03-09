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
      stubs: ["router-link", "router-view", "ripple", "Screen"],
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
      guilds: {},
      channel: {},
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


