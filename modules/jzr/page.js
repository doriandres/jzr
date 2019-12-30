import { html, jzr, component } from "./index";

export const goTo = (href) => {
  history.pushState(null, null, href);
  subscriptions.forEach(fn => fn());
};

const subscriptions = new Set();
const subscribe = fn => subscriptions.add(fn);
const unsubscribe = fn => subscriptions.delete(fn);

export const page = component({ path: '/' }, {
  onconnected({ methods, props }) {
    const state = { path: window.location.pathname, listener: () => methods.updatePath() };
    subscribe(state.listener);
    if (state.path === props.path) {
      document.title = props.title ? props.title instanceof Function ? props.title() : String(props.title) : document.title
    }
    return state;
  },
  updatePath({ state, props }) {
    state = { ...state, path: window.location.pathname };
    if (state.path === props.path) {
      document.title = props.title ? props.title instanceof Function ? props.title() : String(props.title) : document.title
    }
    return state;
  },
  ondisconnected({ state }) {
    unsubscribe(state.listener);
  }
}, (props, state) => html("div", () => [
  state.path === props.path ? props.slot() : null
]));

export const link = component((props) => html("a", {
  ...props,
  onclick(event) {
    if (props.onclick instanceof Function) {
      props.onclick(event);
    }
    if (!event.defaultPrevented) {
      event.preventDefault();
      goTo(props.href);
    }
  }
}, props.slot));