import { mountQuasar } from "@quasar/quasar-app-extension-testing-unit-jest";
import Vuex from "vuex";
import {
  QBtn,
  QHeader,
  QIcon,
  QLayout,
  QToolbar,
  QToolbarTitle,
  QImg,
  QDrawer,
  QScrollArea,
  QList,
  QItem,
  QItemLabel,
  QItemSection,
  QPageContainer,
  QFooter,
} from "quasar"; // <= cherry pick only the components you actually use
import { createLocalVue, RouterLinkStub } from "@vue/test-utils";
import merge from "lodash/merge"
import { testStore } from "./teststore";

const localVue = createLocalVue();
localVue.use(Vuex);

export default function createWrapper(name, view, router) {
  const defaultMountOptions = {
    mount: {
      mocks: {
        $router: router,
        $route: {
          params: { name },
        },
      },
      localVue,
      store: testStore,
      stubs: ["router-link", "router-view", "ripple", "Screen"],
      RouterLink: RouterLinkStub,
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
        QItemLabel,
        QItemSection,
        QPageContainer,
        QFooter,
        QIcon,
      },
    },
    propsData: {},
  };
  return mountQuasar(view, merge(defaultMountOptions));
}
