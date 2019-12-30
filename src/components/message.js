import { component } from "./../../modules/jzr";
import { p } from "./../../modules/jzr/elements";

export const Message = component(
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