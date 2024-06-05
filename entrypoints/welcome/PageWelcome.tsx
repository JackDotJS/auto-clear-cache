import { Component } from "solid-js";
import Header from '~/components/Header';

import style from './PageWelcome.module.css';

const PageWelcome: Component = () => {
  return (
    <>
      <Header style="small"/>
      <main>
        <h1 class={style.welcome}>Welcome!</h1>
        <p>Thanks for installing my web extension! I've spent countless hours developing this, so I hope it works well for you. Before you leave, there's a few things you should know:</p>
        <h2>This extension does nothing until you explicitly tell it to.</h2>
        <p>Throughout the development this extension, I've made a rule to avoid touching any browser data until the user (that's you!) gives explicit permission to. I don't want to be responsible for any unintentional data loss, so you should take a minute to go through the options page and make sure everything is set up to your heart's content.</p>
        <h2>Despite my best efforts, some things may break</h2>
        <p>I'm never gonna claim to be a good developer, but I do try my best to make things work. If you find a bug, I strongly encourage you to write a bug report on this project's GitHub repository.</p>
        {/* TODO: github and website links here */}
      </main>
    </>
  );
};

export default PageWelcome;
