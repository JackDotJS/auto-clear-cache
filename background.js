import { defaultOptionsSync, defaultOptionsLocal } from './defaultOptions.js'

// set up default options if needed

browser.storage.local.get().then((results) => {
  console.debug(results);

  const checkSettingsExist = (storageRepo) => {
    storageRepo.get(`_version`).then((v) => {
      if (Object.keys(results).length === 0) {
        storageRepo.set(defaultOptionsSync)
      }
    });
  }

  if (Object.keys(results).length === 0) {
    browser.storage.local.set(defaultOptionsLocal);

    if (defaultOptionsLocal.syncEnabled) {
      checkSettingsExist(browser.storage.sync);
    } else {
      checkSettingsExist(browser.storage.local);
    }
  } else if (results.syncEnabled) {
    checkSettingsExist(browser.storage.sync);
  } else {
    checkSettingsExist(browser.storage.local);
  }
});

const canNotify = await browser.permissions.contains({ permissions: [ `notifications` ] });

if (canNotify) {
  browser.notifications.create({
    type: `basic`,
    title: `Auto Clear Cache`,
    message: `bg.js test`
  });
}