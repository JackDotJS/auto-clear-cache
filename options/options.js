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
  use_hostnames: false,
  hostnames: [
    "https://example.com"
  ],
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
  ],
  sync_settings: false
}

const options = JSON.parse(JSON.stringify(defaultOptions));

const manifest = browser.runtime.getManifest();
const versionElem = document.getElementById(`ext-version`);
versionElem.innerHTML = `Version ${manifest.version}`;

const saveButton = document.getElementById(`save-button`);
const discardButton = document.getElementById(`discard-button`);

function markChanges(saved) {
  const buttons = [saveButton, discardButton];

  for (const button of buttons) {
    if (saved) {
      button.setAttribute(`disabled`, "");
    } else {
      button.removeAttribute(`disabled`);
    }
  }
}

saveButton.addEventListener(`click`, (e) => {
  markChanges(true);
});

discardButton.addEventListener(`click`, (e) => {
  markChanges(true);
});

function assignTimeUnitInputs(unitElem, typeElem) {
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

    markChanges(false);
  
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
}

const intervalUnitsElem = document.getElementById(`interval-units`);
const intervalTypeElem = document.getElementById(`interval-type`);

assignTimeUnitInputs(intervalUnitsElem, intervalTypeElem);