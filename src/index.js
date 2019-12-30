import { component, jzr, render } from "./../modules/jzr";
import { page, link } from "./../modules/jzr/page"
import { section, button, p, div, form, input, span, h1, ul, li, nav } from "./../modules/jzr/elements";

const Message = component(
  {},
  {
    onconnected() {
      console.log("connected!");
    },
    ondisconnected() {
      console.log("disconnected!");
    },
    onpropschange({ state }, changedProps) {
      console.log("Props changed");
      console.dir(changedProps);
      return state;
    }
  },
  props => p(props.slot())
);

const Counter = component(
  { counter: 0 },
  {
    add: ({ state: { counter } }) => ({
      counter: counter + 1
    }),
    less: ({ state: { counter } }) => ({
      counter: counter - 1
    })
  },
  ({ max = 6 }, { counter }, { add, less }) =>
    section(jzr(() => {
      if (counter < max) {
        button({ onclick: add }, "Add");
      } else {
        p("Reached max " + max);
        button({ onclick: less }, "Less");
      }
      Message("Value: " + counter);
    }))
);

const ToDo = component(
  { items: [], item: "" },
  {
    oninput: ({ state }, { target }) => ({ ...state, item: target.value }),
    onsubmit({ state }, event) {
      event.preventDefault();
      event.target.reset();
      const { items, item } = state;
      return item ? { items: [...items, item], item: "" } : state;
    },
    ondelete: ({ state }, index) => ({
      ...state,
      items: state.items.filter((_, _index) => _index !== index)
    })
  },
  (_, { items }, { oninput, onsubmit, ondelete }) =>
    section(jzr(() => {
      form({ onsubmit }, jzr(() => {
        input({ placeholder: "To do item", oninput });
        button("Add item");
      }));
      ul(() => items.map((item, index) =>
        li(jzr(() => {
          span(item);
          button({ onclick: () => ondelete(index) }, "delete");
        }))
      ));
    }))
);

const Navbar = component(() =>
  nav(() => [
    ul(jzr(() => {
      li(() => [link({ href: '/' }, "Home")]);
      li(() => [link({ href: '/counter' }, "Counter")]);
      li(() => [link({ href: '/todo' }, "To Do")]);
    }))
  ])
)

const App = component(({ name }) =>
  div(jzr(() => {
    Navbar();
    page({ path: "/", title: "Home" }, () => h1("Hello " + name));
    page({ path: "/counter", title: "Counter" }, () => Counter());
    page({ path: "/todo", title: "To Do" }, () => ToDo());
  }))
);

render(App({ name: "Jzr!" }), document.getElementById("app"));
