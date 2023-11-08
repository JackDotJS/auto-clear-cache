const manifest = browser.runtime.getManifest();
const versionElem = document.getElementById(`ext-version`);
const optionsButton = document.getElementById(`open-options`);

versionElem.innerHTML = `Version ${manifest.version}`;

optionsButton.addEventListener(`click`, () => {
  browser.runtime.openOptionsPage();
  window.close();
});