import { mountQuasar } from "@quasar/quasar-app-extension-testing-unit-jest";
import CastingRoleEdit from "../casting_role_edit";
import { QSelect, QCard } from "quasar";
import { createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import { Store } from "vuex-mock-store";
import merge from "lodash.merge";

const localVue = createLocalVue();
localVue.use(Vuex);

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
    propsData: {
      availableRoles: [
        {
          name: "JohnDoe",
          id: 1,
        },
      ],
      castingRole: "lead",
    },
  };
  return mountQuasar(CastingRoleEdit, merge(defaultMountOptions));
}

describe("CastingRoleEdit", () => {
  const storeConfig = {
    state: {
      member: {
        member: {
          id: null,
          handle: null,
        },
      },
    },
    getters: {
      "member/getUser": () => {},
    },
  };
  const wrapper = createWrapper(storeConfig);

  it("QSelect exist in castingRoleEdit component", () => {
    const qselect = wrapper.findComponent(QSelect);
    expect(qselect.exists()).toBe(true);
  });

  it("QSelect recieves proer data", () => {
    const qselect = wrapper.findComponent(QSelect);
    expect(wrapper.props().availableRoles[0]).toHaveProperty(
      qselect.props().optionValue
    );
    expect(wrapper.props().availableRoles[0]).toHaveProperty(
      qselect.props().optionLabel
    );
  });

  it("Check prop casting role", () => {
    expect(wrapper.props().castingRole).toBe("lead");
  });
});
