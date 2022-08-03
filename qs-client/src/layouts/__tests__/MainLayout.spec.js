import MainLayout from "../MainLayout";
import createWrapper from "../../__tests__/create_wrapper";

const mockRouter = {
  push: jest.fn(),
  goto: jest.fn(),
};

describe("MainLayout.vue not logged in button", () => {
  const wrapper = createWrapper("top", MainLayout, mockRouter);

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
