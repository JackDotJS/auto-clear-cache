import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener(() => {
  browser.tabs.create({
    url: "./src/welcome.html"
  });
});