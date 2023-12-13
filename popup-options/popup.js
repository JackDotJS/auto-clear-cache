import { getNextRemovalDate } from '../global.js';

let storageRepo = browser.storage.local;

const syncCheck = await browser.storage.local.get(`syncEnabled`);
if (syncCheck.syncEnabled) storageRepo = browser.storage.sync;

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

// current settings display

const timeLeftElem = document.getElementById(`timeLeft`);
const willConfirmElem = document.getElementById(`will-confirm`);

getNextRemovalDate().then(result => {
  const now = Date.now();
  const remaining = result.getTime() - now;
  let string = ``;

  const year = (1000 * 60 * 60 * 24 * 365);
  const month = (1000 * 60 * 60 * 24 * 30);
  const week = (1000 * 60 * 60 * 24 * 7);
  const day = (1000 * 60 * 60 * 24);

  if (remaining > year) string = `${Math.round(remaining / year)} years`;
  else if (remaining > month) string = `${Math.round(remaining / month)} months`;
  else if (remaining > week) string = `${Math.round(remaining / week)} weeks`;
  else if (remaining > day) string = `${Math.round(remaining / day)} days`;
  else string = `less than 1 day`;

  console.debug(result.toUTCString());

  timeLeftElem.innerHTML = string;
});

storageRepo.get(`neverConfirm`).then(result => {
  willConfirmElem.querySelector(`span`).innerHTML = ``;

  if (result.neverConfirm) {
    willConfirmElem.classList.add(`false`);
    willConfirmElem.classList.remove(`true`);
  } else {
    willConfirmElem.classList.add(`true`);
    willConfirmElem.classList.remove(`false`);
  }
});