import { Show } from "solid-js";

import style from './Header.module.css';

interface HeaderProps {
  style: string
}

const Header = (props: HeaderProps) => {
  const headerStyle = () => props.style;

  return (
    <header class={headerStyle() === "large" ? style.largeHeader : style.smallHeader}>
      <picture class={style.logo}>
        <source srcset="/light_256x.png" media="(prefers-color-scheme: dark)" />
        <img src="/dark_256x.png" />
      </picture>
      <div>
        <h1 class={style.title}>Auto Clear Cache</h1>
        <h3 class={style.version}>Version {browser.runtime.getManifest().version}</h3>
        <Show when={headerStyle() === "large"}>
          <nav class={style.extlinks}>
            <a href="https://github.com/JackDotJS/auto-clear-cache">GitHub</a>
            <a href="https://jackdotjs.github.io/">My Website</a>
          </nav>
        </Show>
      </div>
    </header>
  );
};

export default Header;
