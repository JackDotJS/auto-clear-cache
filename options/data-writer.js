import { getInputElements, startLoading, stopLoading } from './options.js';
import { defaultOptionsSync, defaultOptionsLocal } from '../defaultOptions.js'

const optElems = getInputElements();

export const state = {
  saved: true,
  storageRepo: browser.storage.local
};

// common functions

function loadOptionsIntoUI(options) {
  /**
   * TODO
   * 
   * will be used for the following:
   * - loading current options on page load
   * - loading current options on discarding changes
   * - loading options from imported file 
   * - loading options from sync storage once enabled
   */
}

browser.storage.local.get(`syncEnabled`).then((results) => {
  if (results.syncEnabled) state.storageRepo = browser.storage.sync;

  state.storageRepo.get().then((opts) => {
    console.debug(results);
    loadOptionsIntoUI(opts);
    stopLoading();
  });
});

// unsaved changes warning

window.addEventListener(`beforeunload`, (e) => {
  if (!state.saved) e.preventDefault();
});

// save/discard changes logic

function markSaved() {
  const buttons = [optElems.save, optElems.discard];

  for (const button of buttons) {
    button.setAttribute(`disabled`, "");
  }
}

optElems.save.addEventListener(`click`, (e) => {
  // TODO
  const currentElems = getInputElements();

  console.debug(`writing options: `, currentElems);
});

optElems.discard.addEventListener(`click`, (e) => {
  // TODO
});

// import/export logic

optElems.import.addEventListener(`click`, (e) => {
  // TODO
});

optElems.export.addEventListener(`click`, (e) => {
  // TODO
});