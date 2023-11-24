export const defaultOptionsSync = {
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
  range: {
    use_range: false,
    units: 1,
    unit_type: "days"
  },
  hostnames: {
    enabled: false,
    list: [
      "https://example.com"
    ]
  },
  never_ask_confirm: false,
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
  ]
}

export const defaultOptionsLocal = {
  syncEnabled: false,
  extensionEnabled: true
}