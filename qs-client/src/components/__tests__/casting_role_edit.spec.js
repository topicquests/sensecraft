import { mountQuasar } from "@quasar/quasar-app-extension-testing-unit-jest";
import CastingRoleEdit from "../casting_role_edit";
import { QSelect, QCard } from "quasar";
import { createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import { Store } from "vuex-mock-store";
import merge from "lodash.merge";
import { Member } from "../../types";

const localVue = createLocalVue();
localVue.use(Vuex);

const mockRouter = {
  push: jest.fn(),
  goto: jest.fn(),
};

function createWrapper(storeConfig) {
  const defaultMountOptions = {
    mount: {
      mocks: {},
      localVue,
      store: new Store(storeConfig),
    },
    quasar: {
      components: {
        QSelect,
        QCard,
      },
    },
    propsData: {},
  };
  return mountQuasar(CastingRoleEdit, merge(defaultMountOptions));
}

describe("CastingRoleEdit", () => {
  const storeConfig = {
    state: {
      member: {
        member: null,
      },
    },
    getters: {
      "member/getUser": () => {},
    },
  };
  const wrapper = createWrapper(storeConfig);

  it("QSelect exist in castingRoleEdit component", () => {
    expect(wrapper.findComponent(QSelect).exists()).toBe(true);
  });
});
