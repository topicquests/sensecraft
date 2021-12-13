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
  it("logs out", async () => {
    const button = wrapper.find("#logoff");
    // mock the notify function
    button.vm.$q.notify = jest.fn();
    // wrapper.find("#logoff").trigger("click");
    await button.vm.$emit("click");
    expect(store.dispatch).toHaveBeenCalledWith("member/logout");

    // this one should fail because mock store is not updated
    // expect(store.state.member.isAuthenticated).toBe(false)
  });
});
