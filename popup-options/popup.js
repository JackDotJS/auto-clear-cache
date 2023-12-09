// quick toggle switch

const enabledElem = document.getElementById(`quicktoggle`);

browser.storage.local.get(`extensionEnabled`).then((opts) => {
  enabledElem.checked = opts.extensionEnabled;
});

enabledElem.addEventListener(`change`, (e) => {
  browser.storage.local.set({
    extensionEnabled: e.target.checked
  });
});

// extension version

const manifest = browser.runtime.getManifest();
const versionElem = document.getElementById(`ext-version`);
const optionsButton = document.getElementById(`open-options`);

versionElem.innerHTML = `Version ${manifest.version}`;

// options page button

optionsButton.addEventListener(`click`, () => {
  browser.runtime.openOptionsPage();
  window.close();
});