export const defaultOptionsSync = {
  _version: 1,
  interval: {
    units: 1,
    unitType: "week",
    timeSync: 0
  },
  dataTypes: {
    cache: false,
    cookies: false,
    downloads: false,
    formdata: false,
    history: false,
    localstorage: false,
    passwords: false
  },
  onlyRecent: false,
  clearRange: {
    units: 1,
    unitType: "day"
  },
  useHostnames: false,
  hostnamesList: [ "" ],
  neverConfirm: false,
  notifications: {
    enabled: false,
    success: false,
    error: false,
    remindersEnabled: false,
    reminders: [
      {
        units: 1,
        unitType: "day"
      }
    ]
  }
}

export const defaultOptionsLocal = {
  syncEnabled: false,
  extensionEnabled: true
}

export async function getNextRemovalDate() {
  const now = new Date();
  const syncCheck = await browser.storage.local.get(`syncEnabled`);
  let storageRepo = browser.storage.local;
  if (syncCheck.syncEnabled) storageRepo = browser.storage.sync;

  const opts = await storageRepo.get(`interval`);
  const timeSync = new Date(opts.interval.timeSync);

  console.debug(opts);

  const yearDiff = now.getFullYear() - timeSync.getFullYear();
  const monthDiff = now.getMonth() - timeSync.getMonth();
  const dayDiff = now.getDate() - timeSync.getDate();
  
  const nextRemoval = new Date(opts.interval.timeSync);
  
  if (opts.interval.unitType === `year`) {
    const periods = Math.floor(yearDiff / opts.interval.units);
    const upcomingTotalYears = Math.ceil(opts.interval.units * (periods + 1));

    nextRemoval.setFullYear(nextRemoval.getFullYear() + upcomingTotalYears);
  } else if (opts.interval.unitType === `month`) {
    // removes 1 month if date difference is in the negative
    // means there are more days in the timeSync month than the current time month
    // which then means the current time month should *not* be counted
    const correction = (dayDiff < 0) ? -1 : 0;

    const monthsElapsed = (yearDiff * 12) + monthDiff + correction;
    const periods = Math.floor(monthsElapsed / opts.interval.units);
    const upcomingTotalMonths = Math.ceil(opts.interval.units * (periods + 1));

    nextRemoval.setMonth(nextRemoval.getMonth() + upcomingTotalMonths);
  } else if (opts.interval.unitType === `week`) {
    const weekMills = (1000 * 60 * 60 * 24 * 7);
    const weeksElapsed = (now.getTime() - timeSync.getTime()) / weekMills;
    const periods = Math.floor(weeksElapsed / opts.interval.units);
    const upcomingTotalWeeks = Math.ceil(opts.interval.units * (periods + 1));

    console.debug(weeksElapsed, periods, upcomingTotalWeeks);

    nextRemoval.setTime(nextRemoval.getTime() + (upcomingTotalWeeks * weekMills));
  } else if (opts.interval.unitType === `day`) {
    const dayMills = (1000 * 60 * 60 * 24);
    const daysElapsed = (now.getTime() - timeSync.getTime()) / dayMills;
    const periods = Math.floor(daysElapsed / opts.interval.units);
    const upcomingTotalDays = Math.ceil(opts.interval.units * (periods + 1));

    nextRemoval.setTime(nextRemoval.getTime() + (upcomingTotalDays * dayMills));
  }

  return nextRemoval;
}