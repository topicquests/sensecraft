import { Store } from "vuex-mock-store";
import { mountQuasar } from "@quasar/quasar-app-extension-testing-unit-jest";
import {
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
} from "quasar"; // <= cherry pick only the components you actually use
import { createLocalVue } from "@vue/test-utils";
import VueRouter from "vue-router";

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
        },
      },
      propsData: {},
    });

    expect(wrapper).toBeTruthy();
  });
  afterEach(() => store.reset());

  it("renders logout button", () => {
    expect(wrapper.find("#logoff").exists()).toBe(true);
  });
  it("logs out", () => {
    wrapper.find("#logoff").trigger("click");
    // these two should work
    expect(store.dispatch).toHaveBeenCalledOnce();
    expect(store.dispatch).toHaveBeenCalledWith("member/logout");
    // this one should not because mock store
    // expect(store.state.member.isAuthenticated).toBe(false)
  });
});
