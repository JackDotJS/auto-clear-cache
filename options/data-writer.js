import { getInputElements, startLoading, stopLoading, markChanged } from './options.js';
import { defaultOptionsSync, defaultOptionsLocal } from '../defaultOptions.js'

const optElems = getInputElements();

export const state = {
  saved: true,
  storageRepo: browser.storage.local
};

const dataLinks = [
  {
    front: `interval.units.value`,
    back: `interval.units`,
  },
  {
    front: `interval.unitType.value`,
    back: `interval.unitType`,
  },
  {
    front: `interval.timeSync.valueAsNumber`,
    back: `interval.timeSync`,
  },
  {
    front: `dataTypes.cache.checked`,
    back: `dataTypes.cache`,
  },
  {
    front: `dataTypes.cookies.checked`,
    back: `dataTypes.cookies`,
  },
  {
    front: `dataTypes.downloads.checked`,
    back: `dataTypes.downloads`,
  },
  {
    front: `dataTypes.formdata.checked`,
    back: `dataTypes.formdata`,
  },
  {
    front: `dataTypes.history.checked`,
    back: `dataTypes.history`,
  },
  {
    front: `dataTypes.localstorage.checked`,
    back: `dataTypes.localstorage`,
  },
  {
    front: `dataTypes.passwords.checked`,
    back: `dataTypes.passwords`,
  },
  {
    front: `onlyRecent.checked`,
    back: `onlyRecent`,
  },
  {
    front: `clearRange.units.value`,
    back: `clearRange.units`,
  },
  {
    front: `clearRange.unitType.value`,
    back: `clearRange.unitType`,
  },
  {
    front: `useHostnames.checked`,
    back: `useHostnames`,
  },
  {
    front: `notifications.enabled.checked`,
    back: `notifications.enabled`,
  },
  {
    front: `notifications.success.checked`,
    back: `notifications.success`,
  },
  {
    front: `notifications.error.checked`,
    back: `notifications.error`,
  },
  {
    front: `notifications.remindersEnabled.checked`,
    back: `notifications.remindersEnabled`,
  },
  {
    front: `syncEnabled.checked`,
    back: `syncEnabled`,
  }
]

// common functions

function loadOptionsIntoUI(options) {
  console.debug(`loading options into UI: `, options);

  const currentElems = getInputElements();

  const triggerChange = new CustomEvent(`change`, { detail: true });

  // handles simple inputs like toggle switches, number inputs, etc 
  for (const link of dataLinks) {
    // convert full string notation to actual object reference
    const frontAccessor = link.front.split(`.`);
    const frontTarget = frontAccessor.pop();
    const frontendElement = frontAccessor.reduce((o, i) => o[i], currentElems);

    const backAccessor = link.back.split(`.`);
    const backTarget = backAccessor.pop();
    const backElement = backAccessor.reduce((o, i) => o[i], options);

    // apply value from options to UI element
    frontendElement[frontTarget] = backElement[backTarget];
    // trigger "change" event manually
    frontendElement.dispatchEvent(triggerChange);
  }

  // special handler for list creators
  const listCreators = document.querySelectorAll(`.list-creator`);
  for (const listCreator of listCreators) {
    const list = listCreator.querySelector(`ul`);
    const template = listCreator.querySelector(`ul > li:first-child`);
    const extras = listCreator.querySelectorAll(`ul > li:not(:first-child)`);

    // remove all except first item
    for (const item of extras) {
      item.remove();
    }

    if (listCreator.id === `hostnames-list`) {
      for (let i = 0; i < options.hostnamesList.length; i++) {
        const hostname = options.hostnamesList[i];

        let target;
        if (i > 0) {
          const newNode = template.cloneNode(true);
          target = newNode.querySelector(`input[type="text"]`);
          list.appendChild(newNode);
        } else {
          target = template.querySelector(`input[type="text"]`);
        }
        
        target.value = hostname;
        target.dispatchEvent(triggerChange);
      }
    }

    if (listCreator.id === `reminders-list`) {
      for (let i = 0; i < options.notifications.reminders.length; i++) {
        const reminder = options.notifications.reminders[i];

        let targetUnits;
        let targetUnitType;
        if (i > 0) {
          const newNode = template.cloneNode(true);
          targetUnits = newNode.querySelector(`input[type="number"]`);
          targetUnitType = newNode.querySelector(`select.time-type`);
          list.appendChild(newNode);
        } else {
          targetUnits = template.querySelector(`input[type="number"]`);
          targetUnitType = template.querySelector(`select.time-type`);
        }
        
        targetUnits.value = reminder.units;
        targetUnitType.value = reminder.unitType;

        targetUnits.dispatchEvent(triggerChange);
        targetUnitType.dispatchEvent(triggerChange);
      }
    }
  }
}

browser.storage.local.get(`syncEnabled`).then((results) => {
  if (results.syncEnabled) state.storageRepo = browser.storage.sync;

  state.storageRepo.get().then((opts) => {
    console.debug(opts);
    loadOptionsIntoUI(opts);

    // small delay to let the UI animations to catch up
    setTimeout(() => {
      stopLoading();
    }, 300);
  });
});

// unsaved changes warning

window.addEventListener(`beforeunload`, (e) => {
  if (!state.saved) e.preventDefault();
});

// save/discard changes logic

function markSaved() {
  state.saved = true;
  document.title = `Options | Auto Clear Cache`;

  const buttons = [optElems.save, optElems.discard];
  for (const button of buttons) {
    button.setAttribute(`disabled`, "");
  }
}

optElems.save.addEventListener(`click`, async (e) => {
  startLoading();

  const currentElems = getInputElements();
  const options = {};

  for (const link of dataLinks) {
    const frontAccessor = link.front.split(`.`);
    const frontTarget = frontAccessor.pop();
    const frontendElement = frontAccessor.reduce((obj, key) => obj[key], currentElems);

    const backAccessor = link.back.split(`.`);
    const backTarget = backAccessor.pop();
    const backElement = backAccessor.reduce((obj, key) => obj[key] = obj[key] || {}, options);

    backElement[backTarget] = frontendElement[frontTarget];
  }

  const listCreators = document.querySelectorAll(`.list-creator`);

  for (const listCreator of listCreators) {
    const items = listCreator.querySelectorAll(`ul > li`);

    if (listCreator.id === `hostnames-list`) {
      options.hostnamesList = [];

      for (const item of items) {
        const hostname = item.querySelector(`input[type="text"]`).value;
        options.hostnamesList.push(hostname);
      }
    }

    if (listCreator.id === `reminders-list`) {
      options.notifications.reminders = [];

      for (const item of items) {
        const units = item.querySelector(`input[type="number"]`).value;
        const unitType = item.querySelector(`select.time-type`).value;
        options.notifications.reminders.push({ units, unitType });
      }
    }
  }

  console.debug(`writing options data: `, options);

  state.storageRepo.set(options).then(() => {
    markSaved();
    stopLoading();
  });

  
});

optElems.discard.addEventListener(`click`, (e) => {
  // i know this technically isn't good UX design, but it's good enough for now.
  // might look into creating an undo/redo system some day
  const confirmed = window.confirm(`Are you sure you want to discard your changes? This cannot be undone.`);

  if (!confirmed) return;

  startLoading();
  state.storageRepo.get().then((opts) => {
    loadOptionsIntoUI(opts);

    // small delay to let the UI animations to catch up
    setTimeout(() => {
      markSaved();
      stopLoading();
    }, 300);
  });
});

// import/export logic

optElems.import.addEventListener(`click`, (e) => {
  // TODO
});

optElems.export.addEventListener(`click`, (e) => {
  // TODO
});

// load defaults logic

optElems.loadDefaults.addEventListener(`click`, (e) => {
  loadOptionsIntoUI({...defaultOptionsSync, ...defaultOptionsLocal});
  markChanged();
});