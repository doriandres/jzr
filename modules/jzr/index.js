const render = (__html, parent) => {
  parent.innerHTML = "";
  parent.appendChild(__html(parent, 0));
};

const component = (defaultState, methods, fn) => (props = {}) => {
  if (defaultState instanceof Function) {
    fn = defaultState;
    methods = {};
    defaultState = {};
  }
  if (methods instanceof Function) {
    fn = methods;
    methods = {};
  }
  const comps = "___comps";
  const result = (parent, index) => {
    const proxiedMethods = {};
    const proxy = method => (...args) => {
      const meta = parent[comps][index];
      const value = method(
        {
          props: { ...meta.props },
          state: meta.state,
          methods: { ...meta.methods }
        },
        ...args
      );
      if (meta.state !== result) {
        parent[comps][index].state = value;
        const result = fn({ ...meta.props }, value, { ...meta.methods })(
          parent,
          index
        );
        if (result !== parent.children[index]) {
          parent.replaceChild(result, parent.children[index]);
        }
      }
    };
    Object.keys(methods)
      .filter(methodName => methods[methodName] instanceof Function)
      .forEach(methodName => {
        proxiedMethods[methodName] = proxy(methods[methodName]);
      });
    if (!Array.isArray(parent[comps])) {
      parent[comps] = [];
    }
    if (!parent[comps][index]) {
      parent[comps][index] = {
        state: defaultState,
        methods: proxiedMethods,
        props
      };
    } else {
      parent[comps][index] = {
        ...parent[comps][index],
        props
      };
    }
    return fn(props, parent[comps][index].state, parent[comps][index].methods)(
      parent,
      index
    );
  };
  if (_jzrMode) {
    _jzr = [..._jzr, result];
  }
  return result;
};
let _jzr = [];
let _jzrMode = false;
const jzr = fn => (...args) => {
  _jzrMode = true;
  fn(...args);
  const result = _jzr;
  _jzr = [];
  _jzrMode = false;
  return result;
};
const html = (tag, props = {}, content) => {
  const result = (parent, index) => {
    if (typeof props !== "object") {
      content = props;
      props = {};
    }
    return _html(tag, props, content, parent, index);
  };
  if (_jzrMode) {
    _jzr = [..._jzr, result];
  }
  return result;
};

const _html = (tag, props, content, parent, parentIndex) => {
  const existingElement =
    parent && parentIndex !== undefined && parent.children[parentIndex];
  const element =
    existingElement &&
    existingElement.localName === tag &&
    existingElement.___parentIndex === parentIndex
      ? existingElement
      : document.createElement(tag);
  Object.assign(element, props);
  element.___parentIndex = parentIndex;
  const contentResult = content instanceof Function ? content() : content;
  if (contentResult) {
    if (Array.isArray(contentResult)) {
      const existingChildren = element.children ? [...element.children] : [];
      const newChildren = contentResult
        .filter(__html => __html instanceof Function)
        .map((__html, index) => __html(element, index));
      if (existingChildren.length > newChildren.length) {
        existingChildren.forEach((ec, index) => {
          const nc = newChildren[index];
          if (!nc) {
            element.removeChild(ec);
          } else if (nc !== ec) {
            element.replaceChild(nc, ec);
          }
        });
      } else if (newChildren.length > existingChildren.length) {
        newChildren.forEach((nc, index) => {
          const ec = existingChildren[index];
          if (!ec) {
            element.appendChild(nc);
          } else if (ec !== nc) {
            element.replaceChild(nc, ec);
          }
        });
      } else if (
        newChildren.length &&
        existingChildren.length &&
        newChildren.length === existingChildren.length
      ) {
        newChildren.forEach((nc, index) => {
          const ec = existingChildren[index];
          if (ec !== nc) {
            element.replaceChild(nc, ec);
          }
        });
      }
    } else {
      element.innerHTML = "";
      element.textContent = String(contentResult);
    }
  }
  return element;
};

module.exports = {
  render,
  component,
  html,
  jzr
};
