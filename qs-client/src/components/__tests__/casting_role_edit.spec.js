import { mountQuasar } from "@quasar/quasar-app-extension-testing-unit-jest";
import CastingRoleEdit from "../casting_role_edit";
import { QSelect, QCard, QItemLabel } from "quasar";

describe("casting_role_edit", () => {
  const wrapper = mountQuasar(CastingRoleEdit, {
    quasar: {
      components: {
        QSelect,
        QCard,
      },
    },
    propsData: {
      cr: "test",
      availableRoles: [
        {
          id: 1,
          name: "researcher",
          guild_id: null,
          permissions: [],
          node_type_constraints: [],
          node_state_constraints: [],
        },
      ],
    },
  });
  it("QSelect exist in castingRoleEdit component", () => {
    expect(wrapper.findComponent(QSelect).exists()).toBe(true);
  });

  it("Qselect options contains an array of roles", () => {
    const qselect = wrapper.findComponent(QSelect);
    console.log(qselect.props().availableRoles);
  });
});
