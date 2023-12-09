import { defaultOptionsSync, defaultOptionsLocal } from './defaultOptions.js'

// set up default options if needed

browser.storage.local.get().then((results) => {
  console.debug(results);

  const combinedDefaults = {...defaultOptionsSync, ...defaultOptionsLocal}
  const currentKeys = Object.keys(results);
  const defaultKeys = Object.keys(combinedDefaults);

  const missingKeys = defaultKeys.filter((key) => !currentKeys.includes(key));
  if (missingKeys.length === 0) return;

  console.warn(`missing keys from storage: `, missingKeys);

  const missingData = {};
  for (const key of missingKeys) {
    missingData[key] = combinedDefaults[key];
  }

  browser.storage.local.set(missingData)
});

const canNotify = await browser.permissions.contains({ permissions: [ `notifications` ] });

if (canNotify) {
  browser.notifications.create({
    type: `basic`,
    title: `Auto Clear Cache`,
    message: `bg.js test`
  });
}