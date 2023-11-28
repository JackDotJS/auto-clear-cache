import { getInputElements, startLoading, stopLoading, markChanged } from './options.js';
import { defaultOptionsSync, defaultOptionsLocal } from '../defaultOptions.js'

const optElems = getInputElements();

export const state = {
  saved: true,
  storageRepo: browser.storage.local,
  fs: {
    importElem: null,
    exportURL: null,
    exportElem: null
  }
};

// this is stupid as fuck but i can't think of any other way to do this right now
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
    front: `neverConfirm.checked`,
    back: `neverConfirm`
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

function loadOptionsIntoUI(options, triggerChange) {
  console.debug(`loading options into UI: `, options);

  const currentElems = getInputElements();

  const changeEvent = new CustomEvent(`change`, { detail: !triggerChange });

  // handles simple inputs like toggle switches, number inputs, etc 
  for (const link of dataLinks) {
    // convert full string notation to actual object reference
    const frontAccessor = link.front.split(`.`);
    const frontTarget = frontAccessor.pop();
    const frontendElement = frontAccessor.reduce((o, i) => o[i], currentElems);

    const backAccessor = link.back.split(`.`);
    const backTarget = backAccessor.pop();
    const backElement = backAccessor.reduce((o, i) => o[i], options);

    // update and dispatch event only if necessary
    const frontValue = frontendElement[frontTarget];
    const backValue = backElement[backTarget];

    console.debug(link, parseInt(frontValue), frontValue, backValue)

    const isEqualNumber = parseInt(frontValue) === backValue;
    const isEqualGeneric = frontValue === backValue;

    if (frontendElement.type === `number` ? !isEqualNumber : !isEqualGeneric) {
      // apply value from options to UI element
      frontendElement[frontTarget] = backElement[backTarget];
      // trigger "change" event manually
      frontendElement.dispatchEvent(changeEvent);
    }
  }

  // special handler for list creators
  const listCreators = document.querySelectorAll(`.list-creator`);
  mainLoop: for (const listCreator of listCreators) {
    const list = listCreator.querySelector(`ul`);
    const template = listCreator.querySelector(`ul > li:first-child`);
    const extras = listCreator.querySelectorAll(`ul > li:not(:first-child)`);

    if (listCreator.id === `hostnames-list`) {
      // check if changes need to be made
      const listData = options.hostnamesList;
      // AAAAAGGGHHH I FUCKING HATE NODELISTS WHY CANT YOU JUST USE ARRAYS YOU FUCKING PIECE OF SHIT FUCK YOU
      const currentData = Array.from(listCreator.querySelectorAll(`ul > li input[type="text"]`));
      const result = currentData.filter((elem) => listData.includes(elem.value));

      console.debug(
        `hostnames-list unchanged check: `,
        result.length,
        listData.length,
        currentData.length,
        listData,
        currentData
      );

      if (result.length === listData.length && result.length === currentData.length) continue mainLoop;

      // remove all except first item
      for (const item of extras) {
        item.remove();
      }

      for (let i = 0; i < listData.length; i++) {
        const hostname = listData[i];

        let target;
        if (i > 0) {
          const newNode = template.cloneNode(true);
          target = newNode.querySelector(`input[type="text"]`);
          list.appendChild(newNode);
        } else {
          target = template.querySelector(`input[type="text"]`);
        }
        
        target.value = hostname;
        target.dispatchEvent(changeEvent);
      }
    }

    if (listCreator.id === `reminders-list`) {
      // check if changes need to be made
      const listData = options.notifications.reminders;
      // AAAAAGGGHHH I FUCKING HATE NODELISTS WHY CANT YOU JUST USE ARRAYS YOU FUCKING PIECE OF SHIT FUCK YOU
      const currentData = Array.from(listCreator.querySelectorAll(`ul > li`));
      const result = currentData.filter((elem) => listData.some((item) => {
        const frontUnits = parseInt(elem.querySelector(`input[type="number"]`).value);
        const frontUnitType = elem.querySelector(`select.time-type`).value;
        const backUnits = parseInt(item.units);

        console.debug(backUnits, frontUnits, item.unitType, frontUnitType);

        return (backUnits === frontUnits && item.unitType === frontUnitType);
      }));

      console.debug(
        `reminders-list unchanged check: `,
        result.length,
        listData.length,
        currentData.length,
        listData,
        currentData
      );

      if (result.length === listData.length && result.length === currentData.length) continue mainLoop;

      // remove all except first item
      for (const item of extras) {
        item.remove();
      }

      for (let i = 0; i < listData.length; i++) {
        const reminder = listData[i];

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

        targetUnits.dispatchEvent(changeEvent);
        targetUnitType.dispatchEvent(changeEvent);
      }
    }
  }
}

function getOptionsFromUI() {
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

  return options;
}

// load current options on page load

browser.storage.local.get(`syncEnabled`).then((results) => {
  if (results.syncEnabled) state.storageRepo = browser.storage.sync;

  state.storageRepo.get().then((opts) => {
    console.debug(opts);
    loadOptionsIntoUI(opts, false);

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
  const newOptions = getOptionsFromUI();

  console.debug(`writing options data: `, newOptions);

  state.storageRepo.set(newOptions).then(() => {
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
    loadOptionsIntoUI(opts, false);

    // small delay to let the UI animations to catch up
    setTimeout(() => {
      markSaved();
      stopLoading();
    }, 300);
  });
});

// import/export logic

optElems.import.addEventListener(`click`, (e) => {
  const input = state.fs.importElem ?? document.createElement(`input`);
  input.type = `file`;
  input.accept = `.json,application/json`
  
  if (state.fs.importElem == null) {
    input.addEventListener(`change`, (e) => {
      if (input.files.length === 0) return;

      startLoading();

      const reader = new FileReader();
      reader.addEventListener(`load`, (e2) => {
        const data = e2.target.result;
        const options = JSON.parse(data);

        loadOptionsIntoUI(options, true);

        // small delay to let the UI animations to catch up
        setTimeout(() => {
          stopLoading();
        }, 300);
      });

      reader.readAsText(input.files[0]);
    });
  }

  input.click();
});

optElems.export.addEventListener(`click`, (e) => {
  if (state.fs.exportURL != null) URL.revokeObjectURL(state.fs.exportURL);

  const newOptions = getOptionsFromUI();

  const file = new File(
    [ JSON.stringify(newOptions) ],
    `acc-options.json`,
    { type: `application/json` }
  );

  state.fs.exportURL = URL.createObjectURL(file);

  const a = state.fs.exportElem ?? document.createElement(`a`);
  a.href = state.fs.exportURL;
  a.download = file.name;
  a.style.position = `fixed`;
  state.fs.exportElem = a;

  document.body.appendChild(a);
  a.click();
});

// load defaults logic

optElems.loadDefaults.addEventListener(`click`, (e) => {
  loadOptionsIntoUI({...defaultOptionsSync, ...defaultOptionsLocal}, true);
});