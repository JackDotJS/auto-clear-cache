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
    unitType: "days"
  },
  useHostnames: false,
  hostnamesList: [
    "https://example.com"
  ],
  neverConfirm: false,
  notifications: {
    enabled: false,
    success: false,
    failure: false,
    remindersEnabled: false,
    reminders: [
      {
        units: 1,
        unit_type: "days"
      }
    ]
  }
}

export const defaultOptionsLocal = {
  syncEnabled: false,
  extensionEnabled: true
}