import RoleTable from "../role-table";
import { mountQuasar } from "@quasar/quasar-app-extension-testing-unit-jest";
import { QTable } from "quasar";
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
        QTable,
      },
    },
    propsData: {},
  };
  return mountQuasar(RoleTable, merge(defaultMountOptions));
}

describe("roleTable", () => {
  it("Sanity check", () => expect(true).toBe(true));
});

it("Test for table", () => {
  expect(wrapper.findComponent(QTable).exists()).toBe(true);
});
