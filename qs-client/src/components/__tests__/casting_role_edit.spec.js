import { mountQuasar } from "@quasar/quasar-app-extension-testing-unit-jest";
import CastingRoleEdit from "../casting_role_edit";
import { QSelect } from "quasar";
describe("casting_role_edit", () => {
  const wrapper = mountQuasar(CastingRoleEdit, {
    quasar: {
      components: {
        QSelect,
      },
    },
    propsData: {},
  });
  it("CastingRoleEdit", () => {
    expect(wrapper.findComponent(QSelect).exists()).toBe(true);
  });
});
