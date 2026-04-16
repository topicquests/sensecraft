import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import RegistrationForm from '../../../components/registration-form.vue';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';

installQuasarPlugin();

describe('RegistrationForm', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(RegistrationForm);
  });
  it('renders the form correctly', () => {
    expect(wrapper.find('input[name="email"]').exists()).toBe(true);
    expect(wrapper.find('input[name="name"]').exists()).toBe(true);
    expect(wrapper.find('input[name="handle"]').exists()).toBe(true);
    expect(wrapper.find('input[name="password"]').exists()).toBe(true);
    expect(wrapper.find('button[name="registerButton"]').exists()).toBe(true);
  });
  it('emits doRegister event with form data when Get Started button is clicked', async () => {
    const formdata = wrapper.vm.formdata;
    const formData = {
      email: 'test@example.com',
      name: 'Test Name',
      handle: 'testHandle',
      password: 'password123',
    };
    Object.assign(formdata, formData);
    await wrapper
      .find('input[name="confirmPassword"]')
      .setValue('password123');
    const qForm = wrapper.findComponent({ name: 'QForm' });
    await qForm.vm.$emit('submit', new Event('submit'));
    expect(wrapper.emitted('doRegister')).toBeTruthy();
    expect(wrapper.emitted('doRegister')?.[0]).toEqual([formdata]);
  });
  it('toggles password visibility', async () => {
    const passwordInput = wrapper.find('input[type="password"]');
    await passwordInput.setValue('password');
    const iconElement = wrapper.findAll('i.q-icon').at(5);
    expect(iconElement.exists()).toBe(true);
    expect(iconElement.text()).toBe('visibility_off');
    await iconElement.trigger('click');
    expect(passwordInput.attributes('type')).toBe('text');
    await iconElement.trigger('click');
    expect(passwordInput.attributes('type')).toBe('password');
  });
});
