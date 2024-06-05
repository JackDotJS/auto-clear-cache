export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    browser.tabs.create({
      url: "/welcome.html"
    });
  });
});