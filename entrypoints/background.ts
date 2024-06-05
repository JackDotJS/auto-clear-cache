export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    browser.tabs.create({
      url: "./src/welcome.html"
    });
  });
});