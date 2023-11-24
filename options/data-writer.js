import { getInputElements } from './options.js';

const defaultOptions = {
  _version: 1,
  interval: {
    units: 1,
    unit_type: "week",
    timesync: 0
  },
  datatypes: {
    cache: false,
    cookies: false,
    downloads: false,
    formdata: false,
    history: false,
    localstorage: false,
    passwords: false
  },
  range: {
    use_range: false,
    units: 1,
    unit_type: "days"
  },
  hostnames: {
    enabled: false,
    list: [
      "https://example.com"
    ]
  },
  never_ask_confirm: false,
  notifications: {
    success: true,
    failure: true,
    reminder: true
  },
  reminders: [
    {
      units: 1,
      unit_type: "days"
    }
  ]
}

const optElems = getInputElements();

export const state = {
  saved: true,
  options: JSON.parse(JSON.stringify(defaultOptions))
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