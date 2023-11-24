import { state } from './data-writer.js';

export function getInputElements() {
  return {
    save: document.getElementById(`save-button`),
    discard: document.getElementById(`discard-button`),
    dataRemoval: {
      interval: {
        units: document.getElementById(`interval-units`),
        type: document.getElementById(`interval-type`),
        timeSync: document.getElementById(`timesync`)
      },
      dataTypes: document.querySelectorAll(`#datatype-select input`),
      onlyRecent: document.getElementById(`clearrecent`),
      clearRange: {
        units: document.getElementById(`clear-range-units`),
        type: document.getElementById(`clear-range-type`)
      },
      useHostnames: document.getElementById(`usehostnames`),
      hostnamesList: document.querySelectorAll(`#hostnames-list ul > li`),
      neverConfirm: document.getElementById(`no-confirm`)
    },
    notifications: {
      enabled: document.getElementById(`notif-enabled`),
      success: document.getElementById(`notif-success`),
      error: document.getElementById(`notif-error`),
      remindersEnabled: document.getElementById(`notif-reminder`),
      remindersList: document.querySelectorAll(`#reminders-list ul > li`)
    },
    syncEnabled: document.getElementById(`sync-toggle`),
    import: document.getElementById(`import-button`),
    export: document.getElementById(`export-button`)
  }
}

const optElems = getInputElements();

// common functions

function setupTimeUnitInput(unitElem, typeElem) {
  unitElem.addEventListener(`change`, (e) => {
    const min = parseInt(e.target.getAttribute(`min`));
    const max = parseInt(e.target.getAttribute(`max`));
    const val = parseInt(e.target.value);
  
    // value is empty
    if (isNaN(val)) {
      if (!isNaN(min)) {
        e.target.value = min;
      } else {
        e.target.value = 0;
      }
    }
  
    // value is under minimum
    if (!isNaN(min) && val < min) {
      e.target.value = min;
    }
  
    // value is over maximum
    if (!isNaN(max) && val > max) {
      e.target.value = e.target.value.substring(0, 3);
    }

    markChanged();
  
    //console.debug(min, max, val);
  });

  unitElem.addEventListener(`input`, (e) => {
    const typeOpts = typeElem.querySelectorAll(`option`);
    let val = parseInt(e.target.value);

    //console.debug(val, typeOpts);
    if (isNaN(val)) val = 1;
    if (typeOpts.length === 0) return;

    if (val === 1) {
      for (const option of typeOpts) {
        const optval = option.getAttribute(`value`);
        switch (optval) {
          case `day`:
            option.innerText = `day`;
            break;
          case `week`:
            option.innerText = `week`;
            break;
          case `month`:
            option.innerText = `month`;
            break;
          case `year`:
            option.innerText = `year`;
            break;
        }
      }
    } else {
      for (const option of typeOpts) {
        const optval = option.getAttribute(`value`);
        switch (optval) {
          case `day`:
            option.innerText = `days`;
            break;
          case `week`:
            option.innerText = `weeks`;
            break;
          case `month`:
            option.innerText = `months`;
            break;
          case `year`:
            option.innerText = `years`;
            break;
        }
      }
    }
  });

  typeElem.addEventListener(`change`, (e) => {
    markChanged();
  });
}

function setupToggleable(toggleableElem, ...switchElems) {
  for (const switchElem of switchElems) {
    switchElem.addEventListener(`change`, (e) => {
      markChanged();
    
      const descendants = toggleableElem.querySelectorAll(`*`);
      console.debug(descendants);

      const allStatesChecked = switchElems.every((elem) => elem.checked);
    
      if (allStatesChecked) {
        toggleableElem.classList.remove(`disabled`);
  
        if (descendants.length > 0) {
          for (const element of descendants) {
            element.removeAttribute(`disabled`);
            element.removeAttribute(`tabindex`);
          }
        }
      } else {
        toggleableElem.classList.add(`disabled`);
  
        if (descendants.length > 0) {
          for (const element of descendants) {
            element.setAttribute(`disabled`, "");
            element.setAttribute(`tabindex`, "-1");
          }
        }
      }
    });
  }
}

function setupListCreator(addItemButton, listElem, customFunc) {
  addItemButton.addEventListener(`click`, (e) => {
    markChanged();

    const template = listElem.querySelector(`li:last-of-type`);
    const newItem = template.cloneNode(true);

    listElem.appendChild(newItem);

    if (customFunc != null) customFunc(newItem);
  });
}

// extension version info

const manifest = browser.runtime.getManifest();
const versionElem = document.getElementById(`ext-version`);
versionElem.innerHTML = `Version ${manifest.version}`;

// save and discard buttons

function markChanged() {
  const buttons = [optElems.save, optElems.discard];

  state.saved = false;

  for (const button of buttons) {
    button.removeAttribute(`disabled`);
  }
}

// data clearing interval

setupTimeUnitInput(
  optElems.dataRemoval.interval.units,
  optElems.dataRemoval.interval.type
);

// browser data types

for (const input of optElems.dataRemoval.dataTypes) {
  input.addEventListener(`change`, (e) => {
    console.debug(e.target.id, e.target.checked);
    markChanged();
  });
}

// clear recent data

const clearRecentToggleable = document.getElementById(`data-clear-range`);
setupToggleable(clearRecentToggleable, optElems.dataRemoval.onlyRecent);

setupTimeUnitInput(
  optElems.dataRemoval.clearRange.units,
  optElems.dataRemoval.clearRange.type
);

// only specific hostnames


const hostnamesListCreator = document.getElementById(`hostnames-list`);
setupToggleable(hostnamesListCreator, optElems.dataRemoval.useHostnames);

const templateHostname = document.querySelector(`#hostnames-list li input`);
templateHostname.addEventListener(`change`, (e) => {
  markChanged();
});

const newHostnameButton = document.querySelector(`#hostnames-list > button`);
const hostnameList = document.querySelector(`#hostnames-list > ul`);
setupListCreator(newHostnameButton, hostnameList, (newHostname) => {
  newHostname.addEventListener(`change`, (e) => {
    markChanged();
  });
});

// dont ask for confirmation

optElems.dataRemoval.neverConfirm.addEventListener(`change`, (e) => {
  markChanged();
});

// enable notifications

setupToggleable(
  optElems.notifications.success.parentElement,
  optElems.notifications.enabled
);
setupToggleable(
  optElems.notifications.error.parentElement,
  optElems.notifications.enabled
);
setupToggleable(
  optElems.notifications.remindersEnabled.parentElement,
  optElems.notifications.enabled
);

const notifReminderListCreator = document.getElementById(`reminders-list`);
setupToggleable(
  notifReminderListCreator,
  optElems.notifications.enabled,
  optElems.notifications.remindersEnabled
);

const templateReminderUnitElem = document.querySelector(`#reminders-list li input`);
const templateReminderTypeElem = document.querySelector(`#reminders-list li select`);
setupTimeUnitInput(templateReminderUnitElem, templateReminderTypeElem);

const newReminderButton = document.querySelector(`#reminders-list > button`);
const notifRemindersList = document.querySelector(`#reminders-list > ul`);
setupListCreator(newReminderButton, notifRemindersList, (newReminder) => {
  const reminderUnitElem = newReminder.querySelector(`input`);
  const reminderTypeElem = newReminder.querySelector(`select`);
  setupTimeUnitInput(reminderUnitElem, reminderTypeElem);
});

// enable sync

optElems.syncEnabled.addEventListener(`change`, (e) => {
  markChanged();
});

// import/export

// TODO: requires data-writer.js