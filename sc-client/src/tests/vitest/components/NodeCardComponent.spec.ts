import { createTestingPinia } from '@pinia/testing';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import nodeCardComponent from 'src/components/node-card.vue';
import { describe, it, expect, beforeEach } from 'vitest';
import { mockNode } from '../../utilities/StoreMocks';

installQuasarPlugin();

describe('NodeCardComponent', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(nodeCardComponent, {
      props: {
        node: mockNode,
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              conversation: {
                node: mockNode,
              },
            },
          }),
        ],
      },
    });
  });
  it('renders the IbisButton with the node type icon and node title', () => {
    const icon = wrapper.find('img');
    expect(icon.exists()).toBe(true);
    expect(icon.attributes('src')).toBe('/icons/ibis/issue.png');
    const title = wrapper.find('h3');
    expect(title.exists()).toBe(true);
    expect(wrapper.text()).toContain('Test Node');
  });
  it('if node url exist then link to url', async () => {
    await wrapper.setProps({
      node: { ...mockNode, url: 'https://example.com' },
    });
    const anchor = wrapper.find('a');
    expect(anchor.exists()).toBe(true);
    expect(anchor.attributes('href')).toBe('https://example.com');
    expect(anchor.text()).toContain('Open Related Link');
  });
  it('show node card description', () => {
    const descriptionEl = wrapper.find('.node-description');
    expect(descriptionEl.exists()).toBe(true);
    expect(descriptionEl.attributes('src')).toContain('Test node');
  });
});
