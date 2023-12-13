import { state } from './data-writer.js';

export function getInputElements() {
  return {
    save: document.getElementById(`save-button`),
    discard: document.getElementById(`discard-button`),
    interval: {
      units: document.getElementById(`interval-units`),
      unitType: document.getElementById(`interval-type`),
      timeSync: document.getElementById(`timesync`)
    },
    dataTypes: {
      cache: document.getElementById(`datatype-cache`),
      cookies: document.getElementById(`datatype-cookies`),
      downloads: document.getElementById(`datatype-downloads`),
      formdata: document.getElementById(`datatype-formdata`),
      history: document.getElementById(`datatype-history`),
      localstorage: document.getElementById(`datatype-localstorage`),
      passwords: document.getElementById(`datatype-passwords`),
    },
    onlyRecent: document.getElementById(`clearrecent`),
    clearRange: {
      units: document.getElementById(`clear-range-units`),
      unitType: document.getElementById(`clear-range-type`)
    },
    useHostnames: document.getElementById(`usehostnames`),
    hostnamesList: document.querySelectorAll(`#hostnames-list ul > li`),
    neverConfirm: document.getElementById(`no-confirm`),
    notifications: {
      enabled: document.getElementById(`notif-enabled`),
      success: document.getElementById(`notif-success`),
      error: document.getElementById(`notif-error`),
      remindersEnabled: document.getElementById(`notif-reminder`),
      remindersList: document.querySelectorAll(`#reminders-list ul > li`)
    },
    syncEnabled: document.getElementById(`sync-toggle`),
    import: document.getElementById(`import-button`),
    export: document.getElementById(`export-button`),
    loadDefaults: document.getElementById(`load-defaults`)
  }
}

export function startLoading() {
  document.documentElement.classList.add(`busy`);
  document.documentElement.setAttribute(`aria-hidden`, `true`);
}

export function stopLoading() {
  document.documentElement.classList.remove(`busy`);
  document.documentElement.removeAttribute(`aria-hidden`);
}

const optElems = getInputElements();

// common functions

function setupTimeUnitInput(unitElem, typeElem) {
  const checkPlural = () => {
    const typeOpts = typeElem.querySelectorAll(`option`);
    let val = parseInt(unitElem.value);

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
  }

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

    if (!e.detail) markChanged();

    checkPlural();
  
    //console.debug(min, max, val);
  });

  unitElem.addEventListener(`input`, checkPlural);

  typeElem.addEventListener(`change`, (e) => {
    if (!e.detail) markChanged();
  });

  // in case the value is not 1 to begin with
  checkPlural();
}

function setupToggleable(toggleableElem, ...switchElems) {
  for (const switchElem of switchElems) {
    switchElem.addEventListener(`change`, (e) => {
      if (!e.detail) markChanged();
    
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

function setupListCreator(addItemButton, listElem, newItemFunc) {
  const observer = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      if (mutation.addedNodes.length === 0) continue;
      markChanged();
      if (newItemFunc != null) {
        for (const newNode of mutation.addedNodes) {
          const deleteButton = newNode.querySelector(`button`);
          deleteButton.addEventListener(`click`, () => {
            newNode.remove();
          });

          newItemFunc(newNode);
        }
      }
    }
  });

  observer.observe(listElem, { childList: true })

  addItemButton.addEventListener(`click`, (e) => {
    const template = listElem.querySelector(`li:last-of-type`);
    const newItem = template.cloneNode(true);
    listElem.appendChild(newItem);
  });
}

// extension version info

const manifest = browser.runtime.getManifest();
const versionElem = document.getElementById(`ext-version`);
versionElem.innerHTML = `Version ${manifest.version}`;

// save and discard buttons

export function markChanged() {
  state.saved = false;
  document.title = `*Options | Auto Clear Cache`;

  const buttons = [optElems.save, optElems.discard];
  for (const button of buttons) {
    button.removeAttribute(`disabled`);
  }
}

// data clearing interval

setupTimeUnitInput(
  optElems.interval.units,
  optElems.interval.unitType
);

optElems.interval.timeSync.addEventListener(`change`, (e) => {
  if (!e.detail) markChanged();
  if (isNaN(e.target.valueAsNumber)) e.target.valueAsNumber = new Date().getTime();
});

// browser data types

for (const dataType of Object.keys(optElems.dataTypes)) {
  const input = optElems.dataTypes[dataType];

  input.addEventListener(`change`, (e) => {
    if (e.detail) return;
    console.debug(e.target.id, e.target.checked);
    markChanged();
  });
}

// clear recent data

const clearRecentToggleable = document.getElementById(`data-clear-range`);
setupToggleable(clearRecentToggleable, optElems.onlyRecent);

setupTimeUnitInput(
  optElems.clearRange.units,
  optElems.clearRange.unitType
);

// only specific hostnames


const hostnamesListCreator = document.getElementById(`hostnames-list`);
setupToggleable(hostnamesListCreator, optElems.useHostnames);

const templateHostname = document.querySelector(`#hostnames-list li input`);
templateHostname.addEventListener(`change`, (e) => {
  if (!e.detail) markChanged();
});

const newHostnameButton = document.querySelector(`#hostnames-list > button`);
const hostnameList = document.querySelector(`#hostnames-list > ul`);
setupListCreator(newHostnameButton, hostnameList, (newHostname) => {
  newHostname.addEventListener(`change`, (e) => {
    if (!e.detail) markChanged();
  });
});

// dont ask for confirmation

optElems.neverConfirm.addEventListener(`change`, (e) => {
  if (!e.detail) markChanged();
});

// enable notifications

optElems.notifications.enabled.addEventListener(`change`, (e) => {
  if (e.target.checked && !e.detail) {
    // immediately cancel so we can check perms first
    e.target.checked = false;
    startLoading();

    browser.permissions.request({
      permissions: [ `notifications` ]
    }).then((granted) => {
      stopLoading();
      if (granted) {
        // *now* we can mark as checked
        e.target.checked = true;
        // also dispatch the change event again so linked elements update normally
        e.target.dispatchEvent(new CustomEvent(`change`, { detail: true }));
      }
    });
  }
});

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
  if (!e.detail) markChanged();
});