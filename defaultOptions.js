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