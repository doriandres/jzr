import { component, jzr, render } from "./../modules/jzr";
import {
  section,
  button,
  p,
  div,
  form,
  input,
  span,
  h1,
  ul,
  li
} from "./../modules/jzr/elements";

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
  props => p(props.message)
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
    section(
      jzr(() => {
        if (counter < max) {
          button({ onclick: add }, "Add");
        } else {
          p("Reached max " + max);
          button({ onclick: less }, "Less");
        }
        Message({ message: "Value: " + counter });
      })
    )
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
    section(
      jzr(() => {
        form(
          { onsubmit },
          jzr(() => {
            input({ placeholder: "To do item", oninput });
            button("Add item");
          })
        );
        ul(() =>
          items.map((item, index) =>
            li(
              jzr(() => {
                span(item);
                button({ onclick: () => ondelete(index) }, "delete");
              })
            )
          )
        );
      })
    )
);

const App = component(({ name }) => {
  return div(
    jzr(() => {
      h1("Hello " + name);
      Counter();
      ToDo();
    })
  );
});

render(App({ name: "Jazer" }), document.getElementById("app"));
