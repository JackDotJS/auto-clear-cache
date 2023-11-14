import { state } from './data-writer.js';

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

const saveButton = document.getElementById(`save-button`);
const discardButton = document.getElementById(`discard-button`);

function markChanged() {
  const buttons = [saveButton, discardButton];

  state.saved = false;

  for (const button of buttons) {
    button.removeAttribute(`disabled`);
  }
}

// data clearing interval

const intervalUnitsElem = document.getElementById(`interval-units`);
const intervalTypeElem = document.getElementById(`interval-type`);
setupTimeUnitInput(intervalUnitsElem, intervalTypeElem);

// browser data types

const clearDataTypes = document.querySelectorAll(`#datatype-select input`);

for (const input of clearDataTypes) {
  input.addEventListener(`change`, (e) => {
    console.debug(e.target.id, e.target.checked);
    markChanged();
  });
}

// clear recent data

const clearRecentElem = document.getElementById(`clearrecent`);
const clearRecentToggleable = document.getElementById(`data-clear-range`);
setupToggleable(clearRecentToggleable, clearRecentElem);

const clearRangeUnitsElem = document.getElementById(`clear-range-units`);
const clearRangeTypeElem = document.getElementById(`clear-range-type`);
setupTimeUnitInput(clearRangeUnitsElem, clearRangeTypeElem);

// only specific hostnames

const usehostnamesElem = document.getElementById(`usehostnames`);
const hostnamesListCreator = document.getElementById(`hostnames-list`);
setupToggleable(hostnamesListCreator, usehostnamesElem);

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

const noConfirmElem = document.getElementById(`no-confirm`);
noConfirmElem.addEventListener(`change`, (e) => {
  markChanged();
});

// enable notifications

const notifsElem = document.getElementById(`notif-enabled`);
const notifSuccessElem = document.getElementById(`notif-success`);
const notifErrorElem = document.getElementById(`notif-error`);
const notifReminderElem = document.getElementById(`notif-reminder`);
setupToggleable(notifSuccessElem.parentElement, notifsElem);
setupToggleable(notifErrorElem.parentElement, notifsElem);
setupToggleable(notifReminderElem.parentElement, notifsElem);

const notifReminderListCreator = document.getElementById(`reminders-list`);
setupToggleable(notifReminderListCreator, notifsElem, notifReminderElem);

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

// TODO: requires data-writer.js

// import/export

// TODO: requires data-writer.js