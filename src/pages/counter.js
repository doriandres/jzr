import { component, jzr } from "./../../modules/jzr";
import { section, button, p } from "./../../modules/jzr/elements";
import { Message } from "./../components/message";

export const Counter = component(
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