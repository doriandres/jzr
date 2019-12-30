import { component, jzr } from "./../../modules/jzr";
import { link } from "./../../modules/jzr/page"
import { ul, li, nav } from "./../../modules/jzr/elements";

export const Navbar = component(() =>
  nav(() => [
    ul(jzr(() => {
      li(() => [link({ href: '/' }, "Home")]);
      li(() => [link({ href: '/counter' }, "Counter")]);
      li(() => [link({ href: '/todo' }, "To Do")]);
    }))
  ])
)
