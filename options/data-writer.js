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

// unsaved changes warning

window.addEventListener(`beforeunload`, (e) => {
  if (!state.saved) e.preventDefault();
});

// save and discard buttons

const saveButton = document.getElementById(`save-button`);
const discardButton = document.getElementById(`discard-button`);

function markSaved() {
  const buttons = [optElems.save, optElems.discard];

  for (const button of buttons) {
    button.setAttribute(`disabled`, "");
  }
}

saveButton.addEventListener(`click`, (e) => {
  const currentElems = getInputElements();

  console.debug(`writing options: `, currentElems);
});

discardButton.addEventListener(`click`, (e) => {
  // TODO
});