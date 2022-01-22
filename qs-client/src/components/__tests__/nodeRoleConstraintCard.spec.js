import NodeRoleConstraintCard from "../node-Role-Constraint-Table";
import { mountQuasar } from "@quasar/quasar-app-extension-testing-unit-jest";
import { QCard, QInput, QSelect, QBtn } from "quasar";
import { createLocalVue, createWrapper } from "@vue/test-utils";
import { Store } from "vuex-mock-store";
import Vuex from "vuex";
import merge from "lodash.merge";

const localVue = createLocalVue();
localVue.use(Vuex);

const mockRouter = {};

const storeConfig = {
  state: {},
  getters: {},
};
const wrapper = createWrapper(storeConfig);

function createWrapper(storeConfig) {
  const defaultMountOptions = {
    mount: {
      localVue,
      store: new Store(storeConfig),
    },
    quasar: {
      components: {
        QCard,
        QInput,
        QSelect,
        QBtn,
      },
    },
    propsData: {
      role: {
        name: "",
      },
    },
  };
  return mountQuasar(NodeRoleConstraintCard, merge(defaultMountOptions));
}

describe("NodeRoleConstraintCard", () => {
  it("Sanity check", () => expect(true).toBe(true));
});

it("Test for QCard", () => {
  expect(wrapper.findComponent(QCard).exists()).toBe(true);
});
