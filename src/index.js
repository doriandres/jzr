import { component, jzr, render } from "./../modules/jzr";
import { div } from "./../modules/jzr/elements";
import { page } from "./../modules/jzr/page";
import { Navbar } from "./components/navbar";
import { Home } from "./pages/home";
import { Counter } from "./pages/counter";
import { ToDo } from "./pages/todo";

const App = component(() =>
  div(jzr(() => {
    Navbar();
    page({ path: "/", title: "Home" }, () => Home());
    page({ path: "/counter", title: "Counter" }, () => Counter());
    page({ path: "/todo", title: "To Do" }, () => ToDo());
  }))
);

render(App(), document.getElementById("app"));
