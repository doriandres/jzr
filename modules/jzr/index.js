const render = (__html, parent) => {
  parent.innerHTML = "";
  const result = __html(parent, 0);
  parent.appendChild(result);
};

const assignAndCompare = (host, existing, novo) => {
  let propsChanges = {};
  const newProps = Object.keys(novo);
  const existingProps = Object.keys(existing);
  if (existingProps.length > newProps.length) {
    existingProps.forEach((ep, index) => {
      const np = newProps[index];
      if (novo[np] === undefined) {
        delete host[ep];
        propsChanges[ep] = { from: existing[ep], to: undefined };
      } else if (novo[np] !== existing[ep]) {
        host[np] = novo[np];
        propsChanges[np] = { from: existing[ep], to: novo[np] };
      }
    });
  } else if (newProps.length > existingProps.length) {
    newProps.forEach((np, index) => {
      const ep = existingProps[index];
      if (existing[ep] === undefined || existing[ep] !== novo[np]) {
        host[np] = novo[np];
        propsChanges[np] = { from: existing[ep], to: novo[np] };
      }
    });
  } else if (
    newProps.length &&
    existingProps.length &&
    newProps.length === existingProps.length
  ) {
    newProps.forEach((np, index) => {
      const ep = existingProps[index];
      if (existing[ep] !== novo[np]) {
        host[np] = novo[np];
        propsChanges[np] = { from: existing[ep], to: novo[np] };
      }
    });
  }
  return propsChanges;
};

const component = (defaultState, methods, fn) => (props = {}) => {
  if (defaultState instanceof Function) {
    fn = defaultState;
    methods = {};
    defaultState = undefined;
  }
  if (methods instanceof Function) {
    fn = methods;
    methods = {};
  }
  const comps = "___comps";
  const result = (parent, index) => {
    const proxiedMethods = {};
    const proxy = (name, method) => (...args) => {
      const meta = parent[comps][index];
      const value = method(
        {
          props: { ...meta.props },
          state: meta.state,
          methods: { ...meta.methods }
        },
        ...args
      );

      if (meta.state !== result && name !== "ondisconnected") {
        parent[comps][index].state = value;
        const result = fn({ ...meta.props }, value, { ...meta.methods })(
          parent,
          index,
          meta.methods
        );
        if (result !== parent.children[index]) {
          parent.replaceChild(result, parent.children[index]);
        }
      }
    };
    Object.keys(methods)
      .filter(methodName => methods[methodName] instanceof Function)
      .forEach(methodName => {
        proxiedMethods[methodName] = proxy(methodName, methods[methodName]);
      });
    if (!Array.isArray(parent[comps])) {
      parent[comps] = [];
    }
    let changedProps = {};
    if (!parent[comps][index]) {
      parent[comps][index] = {
        state: defaultState,
        methods: proxiedMethods,
        props
      };
    } else {
      const copiedMeta = {
        ...parent[comps][index]
      };
      changedProps = assignAndCompare(
        copiedMeta.props,
        { ...copiedMeta.props },
        props
      );
      parent[comps][index] = copiedMeta;
    }

    const meta = parent[comps][index];
    const fnResult = fn(props, meta.state, meta.methods);
    if (Object.keys(changedProps).length && meta.methods.onpropschange) {
      meta.methods.onpropschange(changedProps);
    }
    return fnResult(parent, index, meta.methods);
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
  const result = (parent, index, methods) => {
    if (typeof props !== "object") {
      content = props;
      props = {};
    }
    return _html(tag, props, content, parent, index, methods);
  };
  if (_jzrMode) {
    _jzr = [..._jzr, result];
  }
  return result;
};

const _html = (tag, props, content, parent, parentIndex, methods = {}) => {
  const existingElement =
    parent && parentIndex !== undefined && parent.children[parentIndex];
  const element =
    existingElement &&
    existingElement.localName === tag &&
    existingElement.___parentIndex === parentIndex
      ? existingElement
      : document.createElement(tag);

  let propsChanges = {};
  if (existingElement) {
    const _props = existingElement.___props;
    propsChanges = assignAndCompare(element, _props, props);
  } else {
    Object.assign(element, props);
  }
  element.___methods = element.___methods || methods;
  element.___props = props;

  element.___parentIndex = parentIndex;
  const contentResult = content instanceof Function ? content() : content;
  if (contentResult) {
    if (Array.isArray(contentResult)) {
      const existingChildren = element.children ? [...element.children] : [];
      const newChildren = contentResult
        .filter(__html => __html instanceof Function)
        .map((__html, index) => __html(element, index));
      const callDisconnected = node => {
        setTimeout(() => {
          if (node.___methods.ondisconnected instanceof Function) {
            node.___methods.ondisconnected();
          }
        });
      };
      if (existingChildren.length > newChildren.length) {
        existingChildren.forEach((ec, index) => {
          const nc = newChildren[index];
          if (!nc) {
            element.removeChild(ec);
            callDisconnected(ec);
          } else if (nc !== ec) {
            element.replaceChild(nc, ec);
            callDisconnected(ec);
          }
        });
      } else if (newChildren.length > existingChildren.length) {
        newChildren.forEach((nc, index) => {
          const ec = existingChildren[index];
          if (!ec) {
            element.appendChild(nc);
          } else if (ec !== nc) {
            element.replaceChild(nc, ec);
            callDisconnected(ec);
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
            callDisconnected(ec);
          }
        });
      }
    } else {
      element.innerHTML = "";
      element.textContent = String(contentResult);
    }
  }

  const connected = element.isConnected;
  setTimeout(() => {
    if (
      !connected &&
      element.isConnected &&
      methods.onconnected instanceof Function
    ) {
      methods.onconnected();
    }
    if (
      connected &&
      Object.keys(propsChanges).length &&
      methods.onpropschange instanceof Function
    ) {
      methods.onpropschange(propsChanges);
    }
  });
  return element;
};

module.exports = {
  render,
  component,
  html,
  jzr
};
