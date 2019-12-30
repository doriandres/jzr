import { component, jzr, render } from "./../../modules/jzr";
import { section, button, form, input, span, ul, li } from "./../../modules/jzr/elements";

export const ToDo = component(
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