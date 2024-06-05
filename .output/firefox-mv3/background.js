var _background = (function () {
  'use strict';

  // src/index.ts
  var _MatchPattern = class {
    constructor(matchPattern) {
      if (matchPattern === "<all_urls>") {
        this.isAllUrls = true;
        this.protocolMatches = [..._MatchPattern.PROTOCOLS];
        this.hostnameMatch = "*";
        this.pathnameMatch = "*";
      } else {
        const groups = /(.*):\/\/(.*?)(\/.*)/.exec(matchPattern);
        if (groups == null)
          throw new InvalidMatchPattern(matchPattern, "Incorrect format");
        const [_, protocol, hostname, pathname] = groups;
        validateProtocol(matchPattern, protocol);
        validateHostname(matchPattern, hostname);
        this.protocolMatches = protocol === "*" ? ["http", "https"] : [protocol];
        this.hostnameMatch = hostname;
        this.pathnameMatch = pathname;
      }
    }
    includes(url) {
      if (this.isAllUrls)
        return true;
      const u = typeof url === "string" ? new URL(url) : url instanceof Location ? new URL(url.href) : url;
      return !!this.protocolMatches.find((protocol) => {
        if (protocol === "http")
          return this.isHttpMatch(u);
        if (protocol === "https")
          return this.isHttpsMatch(u);
        if (protocol === "file")
          return this.isFileMatch(u);
        if (protocol === "ftp")
          return this.isFtpMatch(u);
        if (protocol === "urn")
          return this.isUrnMatch(u);
      });
    }
    isHttpMatch(url) {
      return url.protocol === "http:" && this.isHostPathMatch(url);
    }
    isHttpsMatch(url) {
      return url.protocol === "https:" && this.isHostPathMatch(url);
    }
    isHostPathMatch(url) {
      if (!this.hostnameMatch || !this.pathnameMatch)
        return false;
      const hostnameMatchRegexs = [
        this.convertPatternToRegex(this.hostnameMatch),
        this.convertPatternToRegex(this.hostnameMatch.replace(/^\*\./, ""))
      ];
      const pathnameMatchRegex = this.convertPatternToRegex(this.pathnameMatch);
      return !!hostnameMatchRegexs.find((regex) => regex.test(url.hostname)) && pathnameMatchRegex.test(url.pathname);
    }
    isFileMatch(url) {
      throw Error("Not implemented: file:// pattern matching. Open a PR to add support");
    }
    isFtpMatch(url) {
      throw Error("Not implemented: ftp:// pattern matching. Open a PR to add support");
    }
    isUrnMatch(url) {
      throw Error("Not implemented: urn:// pattern matching. Open a PR to add support");
    }
    convertPatternToRegex(pattern) {
      const escaped = this.escapeForRegex(pattern);
      const starsReplaced = escaped.replace(/\\\*/g, ".*");
      return RegExp(`^${starsReplaced}$`);
    }
    escapeForRegex(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  };
  var MatchPattern = _MatchPattern;
  MatchPattern.PROTOCOLS = ["http", "https", "file", "ftp", "urn"];
  var InvalidMatchPattern = class extends Error {
    constructor(matchPattern, reason) {
      super(`Invalid match pattern "${matchPattern}": ${reason}`);
    }
  };
  function validateProtocol(matchPattern, protocol) {
    if (!MatchPattern.PROTOCOLS.includes(protocol) && protocol !== "*")
      throw new InvalidMatchPattern(
        matchPattern,
        `${protocol} not a valid protocol (${MatchPattern.PROTOCOLS.join(", ")})`
      );
  }
  function validateHostname(matchPattern, hostname) {
    if (hostname.includes(":"))
      throw new InvalidMatchPattern(matchPattern, `Hostname cannot include a port`);
    if (hostname.includes("*") && hostname.length > 1 && !hostname.startsWith("*."))
      throw new InvalidMatchPattern(
        matchPattern,
        `If using a wildcard (*), it must go at the start of the hostname`
      );
  }

  // src/sandbox/define-unlisted-script.ts

  // src/sandbox/define-background.ts
  function defineBackground(arg) {
    if (typeof arg === "function")
      return { main: arg };
    return arg;
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  var browserPolyfill = {exports: {}};

  (function (module, exports) {
  	(function (global, factory) {
  	  {
  	    factory(module);
  	  }
  	})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : commonjsGlobal, function (module) {

  	  if (!globalThis.chrome?.runtime?.id) {
  	    throw new Error("This script should only be loaded in a browser extension.");
  	  }

  	  if (typeof globalThis.browser === "undefined" || Object.getPrototypeOf(globalThis.browser) !== Object.prototype) {
  	    const CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE = "The message port closed before a response was received."; // Wrapping the bulk of this polyfill in a one-time-use function is a minor
  	    // optimization for Firefox. Since Spidermonkey does not fully parse the
  	    // contents of a function until the first time it's called, and since it will
  	    // never actually need to be called, this allows the polyfill to be included
  	    // in Firefox nearly for free.

  	    const wrapAPIs = extensionAPIs => {
  	      // NOTE: apiMetadata is associated to the content of the api-metadata.json file
  	      // at build time by replacing the following "include" with the content of the
  	      // JSON file.
  	      const apiMetadata = {
  	        "alarms": {
  	          "clear": {
  	            "minArgs": 0,
  	            "maxArgs": 1
  	          },
  	          "clearAll": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          },
  	          "get": {
  	            "minArgs": 0,
  	            "maxArgs": 1
  	          },
  	          "getAll": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          }
  	        },
  	        "bookmarks": {
  	          "create": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "get": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "getChildren": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "getRecent": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "getSubTree": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "getTree": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          },
  	          "move": {
  	            "minArgs": 2,
  	            "maxArgs": 2
  	          },
  	          "remove": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "removeTree": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "search": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "update": {
  	            "minArgs": 2,
  	            "maxArgs": 2
  	          }
  	        },
  	        "browserAction": {
  	          "disable": {
  	            "minArgs": 0,
  	            "maxArgs": 1,
  	            "fallbackToNoCallback": true
  	          },
  	          "enable": {
  	            "minArgs": 0,
  	            "maxArgs": 1,
  	            "fallbackToNoCallback": true
  	          },
  	          "getBadgeBackgroundColor": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "getBadgeText": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "getPopup": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "getTitle": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "openPopup": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          },
  	          "setBadgeBackgroundColor": {
  	            "minArgs": 1,
  	            "maxArgs": 1,
  	            "fallbackToNoCallback": true
  	          },
  	          "setBadgeText": {
  	            "minArgs": 1,
  	            "maxArgs": 1,
  	            "fallbackToNoCallback": true
  	          },
  	          "setIcon": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "setPopup": {
  	            "minArgs": 1,
  	            "maxArgs": 1,
  	            "fallbackToNoCallback": true
  	          },
  	          "setTitle": {
  	            "minArgs": 1,
  	            "maxArgs": 1,
  	            "fallbackToNoCallback": true
  	          }
  	        },
  	        "browsingData": {
  	          "remove": {
  	            "minArgs": 2,
  	            "maxArgs": 2
  	          },
  	          "removeCache": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "removeCookies": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "removeDownloads": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "removeFormData": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "removeHistory": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "removeLocalStorage": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "removePasswords": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "removePluginData": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "settings": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          }
  	        },
  	        "commands": {
  	          "getAll": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          }
  	        },
  	        "contextMenus": {
  	          "remove": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "removeAll": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          },
  	          "update": {
  	            "minArgs": 2,
  	            "maxArgs": 2
  	          }
  	        },
  	        "cookies": {
  	          "get": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "getAll": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "getAllCookieStores": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          },
  	          "remove": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "set": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          }
  	        },
  	        "devtools": {
  	          "inspectedWindow": {
  	            "eval": {
  	              "minArgs": 1,
  	              "maxArgs": 2,
  	              "singleCallbackArg": false
  	            }
  	          },
  	          "panels": {
  	            "create": {
  	              "minArgs": 3,
  	              "maxArgs": 3,
  	              "singleCallbackArg": true
  	            },
  	            "elements": {
  	              "createSidebarPane": {
  	                "minArgs": 1,
  	                "maxArgs": 1
  	              }
  	            }
  	          }
  	        },
  	        "downloads": {
  	          "cancel": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "download": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "erase": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "getFileIcon": {
  	            "minArgs": 1,
  	            "maxArgs": 2
  	          },
  	          "open": {
  	            "minArgs": 1,
  	            "maxArgs": 1,
  	            "fallbackToNoCallback": true
  	          },
  	          "pause": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "removeFile": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "resume": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "search": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "show": {
  	            "minArgs": 1,
  	            "maxArgs": 1,
  	            "fallbackToNoCallback": true
  	          }
  	        },
  	        "extension": {
  	          "isAllowedFileSchemeAccess": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          },
  	          "isAllowedIncognitoAccess": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          }
  	        },
  	        "history": {
  	          "addUrl": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "deleteAll": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          },
  	          "deleteRange": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "deleteUrl": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "getVisits": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "search": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          }
  	        },
  	        "i18n": {
  	          "detectLanguage": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "getAcceptLanguages": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          }
  	        },
  	        "identity": {
  	          "launchWebAuthFlow": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          }
  	        },
  	        "idle": {
  	          "queryState": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          }
  	        },
  	        "management": {
  	          "get": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "getAll": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          },
  	          "getSelf": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          },
  	          "setEnabled": {
  	            "minArgs": 2,
  	            "maxArgs": 2
  	          },
  	          "uninstallSelf": {
  	            "minArgs": 0,
  	            "maxArgs": 1
  	          }
  	        },
  	        "notifications": {
  	          "clear": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "create": {
  	            "minArgs": 1,
  	            "maxArgs": 2
  	          },
  	          "getAll": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          },
  	          "getPermissionLevel": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          },
  	          "update": {
  	            "minArgs": 2,
  	            "maxArgs": 2
  	          }
  	        },
  	        "pageAction": {
  	          "getPopup": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "getTitle": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "hide": {
  	            "minArgs": 1,
  	            "maxArgs": 1,
  	            "fallbackToNoCallback": true
  	          },
  	          "setIcon": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "setPopup": {
  	            "minArgs": 1,
  	            "maxArgs": 1,
  	            "fallbackToNoCallback": true
  	          },
  	          "setTitle": {
  	            "minArgs": 1,
  	            "maxArgs": 1,
  	            "fallbackToNoCallback": true
  	          },
  	          "show": {
  	            "minArgs": 1,
  	            "maxArgs": 1,
  	            "fallbackToNoCallback": true
  	          }
  	        },
  	        "permissions": {
  	          "contains": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "getAll": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          },
  	          "remove": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "request": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          }
  	        },
  	        "runtime": {
  	          "getBackgroundPage": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          },
  	          "getPlatformInfo": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          },
  	          "openOptionsPage": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          },
  	          "requestUpdateCheck": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          },
  	          "sendMessage": {
  	            "minArgs": 1,
  	            "maxArgs": 3
  	          },
  	          "sendNativeMessage": {
  	            "minArgs": 2,
  	            "maxArgs": 2
  	          },
  	          "setUninstallURL": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          }
  	        },
  	        "sessions": {
  	          "getDevices": {
  	            "minArgs": 0,
  	            "maxArgs": 1
  	          },
  	          "getRecentlyClosed": {
  	            "minArgs": 0,
  	            "maxArgs": 1
  	          },
  	          "restore": {
  	            "minArgs": 0,
  	            "maxArgs": 1
  	          }
  	        },
  	        "storage": {
  	          "local": {
  	            "clear": {
  	              "minArgs": 0,
  	              "maxArgs": 0
  	            },
  	            "get": {
  	              "minArgs": 0,
  	              "maxArgs": 1
  	            },
  	            "getBytesInUse": {
  	              "minArgs": 0,
  	              "maxArgs": 1
  	            },
  	            "remove": {
  	              "minArgs": 1,
  	              "maxArgs": 1
  	            },
  	            "set": {
  	              "minArgs": 1,
  	              "maxArgs": 1
  	            }
  	          },
  	          "managed": {
  	            "get": {
  	              "minArgs": 0,
  	              "maxArgs": 1
  	            },
  	            "getBytesInUse": {
  	              "minArgs": 0,
  	              "maxArgs": 1
  	            }
  	          },
  	          "sync": {
  	            "clear": {
  	              "minArgs": 0,
  	              "maxArgs": 0
  	            },
  	            "get": {
  	              "minArgs": 0,
  	              "maxArgs": 1
  	            },
  	            "getBytesInUse": {
  	              "minArgs": 0,
  	              "maxArgs": 1
  	            },
  	            "remove": {
  	              "minArgs": 1,
  	              "maxArgs": 1
  	            },
  	            "set": {
  	              "minArgs": 1,
  	              "maxArgs": 1
  	            }
  	          }
  	        },
  	        "tabs": {
  	          "captureVisibleTab": {
  	            "minArgs": 0,
  	            "maxArgs": 2
  	          },
  	          "create": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "detectLanguage": {
  	            "minArgs": 0,
  	            "maxArgs": 1
  	          },
  	          "discard": {
  	            "minArgs": 0,
  	            "maxArgs": 1
  	          },
  	          "duplicate": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "executeScript": {
  	            "minArgs": 1,
  	            "maxArgs": 2
  	          },
  	          "get": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "getCurrent": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          },
  	          "getZoom": {
  	            "minArgs": 0,
  	            "maxArgs": 1
  	          },
  	          "getZoomSettings": {
  	            "minArgs": 0,
  	            "maxArgs": 1
  	          },
  	          "goBack": {
  	            "minArgs": 0,
  	            "maxArgs": 1
  	          },
  	          "goForward": {
  	            "minArgs": 0,
  	            "maxArgs": 1
  	          },
  	          "highlight": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "insertCSS": {
  	            "minArgs": 1,
  	            "maxArgs": 2
  	          },
  	          "move": {
  	            "minArgs": 2,
  	            "maxArgs": 2
  	          },
  	          "query": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "reload": {
  	            "minArgs": 0,
  	            "maxArgs": 2
  	          },
  	          "remove": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "removeCSS": {
  	            "minArgs": 1,
  	            "maxArgs": 2
  	          },
  	          "sendMessage": {
  	            "minArgs": 2,
  	            "maxArgs": 3
  	          },
  	          "setZoom": {
  	            "minArgs": 1,
  	            "maxArgs": 2
  	          },
  	          "setZoomSettings": {
  	            "minArgs": 1,
  	            "maxArgs": 2
  	          },
  	          "update": {
  	            "minArgs": 1,
  	            "maxArgs": 2
  	          }
  	        },
  	        "topSites": {
  	          "get": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          }
  	        },
  	        "webNavigation": {
  	          "getAllFrames": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "getFrame": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          }
  	        },
  	        "webRequest": {
  	          "handlerBehaviorChanged": {
  	            "minArgs": 0,
  	            "maxArgs": 0
  	          }
  	        },
  	        "windows": {
  	          "create": {
  	            "minArgs": 0,
  	            "maxArgs": 1
  	          },
  	          "get": {
  	            "minArgs": 1,
  	            "maxArgs": 2
  	          },
  	          "getAll": {
  	            "minArgs": 0,
  	            "maxArgs": 1
  	          },
  	          "getCurrent": {
  	            "minArgs": 0,
  	            "maxArgs": 1
  	          },
  	          "getLastFocused": {
  	            "minArgs": 0,
  	            "maxArgs": 1
  	          },
  	          "remove": {
  	            "minArgs": 1,
  	            "maxArgs": 1
  	          },
  	          "update": {
  	            "minArgs": 2,
  	            "maxArgs": 2
  	          }
  	        }
  	      };

  	      if (Object.keys(apiMetadata).length === 0) {
  	        throw new Error("api-metadata.json has not been included in browser-polyfill");
  	      }
  	      /**
  	       * A WeakMap subclass which creates and stores a value for any key which does
  	       * not exist when accessed, but behaves exactly as an ordinary WeakMap
  	       * otherwise.
  	       *
  	       * @param {function} createItem
  	       *        A function which will be called in order to create the value for any
  	       *        key which does not exist, the first time it is accessed. The
  	       *        function receives, as its only argument, the key being created.
  	       */


  	      class DefaultWeakMap extends WeakMap {
  	        constructor(createItem, items = undefined) {
  	          super(items);
  	          this.createItem = createItem;
  	        }

  	        get(key) {
  	          if (!this.has(key)) {
  	            this.set(key, this.createItem(key));
  	          }

  	          return super.get(key);
  	        }

  	      }
  	      /**
  	       * Returns true if the given object is an object with a `then` method, and can
  	       * therefore be assumed to behave as a Promise.
  	       *
  	       * @param {*} value The value to test.
  	       * @returns {boolean} True if the value is thenable.
  	       */


  	      const isThenable = value => {
  	        return value && typeof value === "object" && typeof value.then === "function";
  	      };
  	      /**
  	       * Creates and returns a function which, when called, will resolve or reject
  	       * the given promise based on how it is called:
  	       *
  	       * - If, when called, `chrome.runtime.lastError` contains a non-null object,
  	       *   the promise is rejected with that value.
  	       * - If the function is called with exactly one argument, the promise is
  	       *   resolved to that value.
  	       * - Otherwise, the promise is resolved to an array containing all of the
  	       *   function's arguments.
  	       *
  	       * @param {object} promise
  	       *        An object containing the resolution and rejection functions of a
  	       *        promise.
  	       * @param {function} promise.resolve
  	       *        The promise's resolution function.
  	       * @param {function} promise.reject
  	       *        The promise's rejection function.
  	       * @param {object} metadata
  	       *        Metadata about the wrapped method which has created the callback.
  	       * @param {boolean} metadata.singleCallbackArg
  	       *        Whether or not the promise is resolved with only the first
  	       *        argument of the callback, alternatively an array of all the
  	       *        callback arguments is resolved. By default, if the callback
  	       *        function is invoked with only a single argument, that will be
  	       *        resolved to the promise, while all arguments will be resolved as
  	       *        an array if multiple are given.
  	       *
  	       * @returns {function}
  	       *        The generated callback function.
  	       */


  	      const makeCallback = (promise, metadata) => {
  	        return (...callbackArgs) => {
  	          if (extensionAPIs.runtime.lastError) {
  	            promise.reject(new Error(extensionAPIs.runtime.lastError.message));
  	          } else if (metadata.singleCallbackArg || callbackArgs.length <= 1 && metadata.singleCallbackArg !== false) {
  	            promise.resolve(callbackArgs[0]);
  	          } else {
  	            promise.resolve(callbackArgs);
  	          }
  	        };
  	      };

  	      const pluralizeArguments = numArgs => numArgs == 1 ? "argument" : "arguments";
  	      /**
  	       * Creates a wrapper function for a method with the given name and metadata.
  	       *
  	       * @param {string} name
  	       *        The name of the method which is being wrapped.
  	       * @param {object} metadata
  	       *        Metadata about the method being wrapped.
  	       * @param {integer} metadata.minArgs
  	       *        The minimum number of arguments which must be passed to the
  	       *        function. If called with fewer than this number of arguments, the
  	       *        wrapper will raise an exception.
  	       * @param {integer} metadata.maxArgs
  	       *        The maximum number of arguments which may be passed to the
  	       *        function. If called with more than this number of arguments, the
  	       *        wrapper will raise an exception.
  	       * @param {boolean} metadata.singleCallbackArg
  	       *        Whether or not the promise is resolved with only the first
  	       *        argument of the callback, alternatively an array of all the
  	       *        callback arguments is resolved. By default, if the callback
  	       *        function is invoked with only a single argument, that will be
  	       *        resolved to the promise, while all arguments will be resolved as
  	       *        an array if multiple are given.
  	       *
  	       * @returns {function(object, ...*)}
  	       *       The generated wrapper function.
  	       */


  	      const wrapAsyncFunction = (name, metadata) => {
  	        return function asyncFunctionWrapper(target, ...args) {
  	          if (args.length < metadata.minArgs) {
  	            throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
  	          }

  	          if (args.length > metadata.maxArgs) {
  	            throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
  	          }

  	          return new Promise((resolve, reject) => {
  	            if (metadata.fallbackToNoCallback) {
  	              // This API method has currently no callback on Chrome, but it return a promise on Firefox,
  	              // and so the polyfill will try to call it with a callback first, and it will fallback
  	              // to not passing the callback if the first call fails.
  	              try {
  	                target[name](...args, makeCallback({
  	                  resolve,
  	                  reject
  	                }, metadata));
  	              } catch (cbError) {
  	                console.warn(`${name} API method doesn't seem to support the callback parameter, ` + "falling back to call it without a callback: ", cbError);
  	                target[name](...args); // Update the API method metadata, so that the next API calls will not try to
  	                // use the unsupported callback anymore.

  	                metadata.fallbackToNoCallback = false;
  	                metadata.noCallback = true;
  	                resolve();
  	              }
  	            } else if (metadata.noCallback) {
  	              target[name](...args);
  	              resolve();
  	            } else {
  	              target[name](...args, makeCallback({
  	                resolve,
  	                reject
  	              }, metadata));
  	            }
  	          });
  	        };
  	      };
  	      /**
  	       * Wraps an existing method of the target object, so that calls to it are
  	       * intercepted by the given wrapper function. The wrapper function receives,
  	       * as its first argument, the original `target` object, followed by each of
  	       * the arguments passed to the original method.
  	       *
  	       * @param {object} target
  	       *        The original target object that the wrapped method belongs to.
  	       * @param {function} method
  	       *        The method being wrapped. This is used as the target of the Proxy
  	       *        object which is created to wrap the method.
  	       * @param {function} wrapper
  	       *        The wrapper function which is called in place of a direct invocation
  	       *        of the wrapped method.
  	       *
  	       * @returns {Proxy<function>}
  	       *        A Proxy object for the given method, which invokes the given wrapper
  	       *        method in its place.
  	       */


  	      const wrapMethod = (target, method, wrapper) => {
  	        return new Proxy(method, {
  	          apply(targetMethod, thisObj, args) {
  	            return wrapper.call(thisObj, target, ...args);
  	          }

  	        });
  	      };

  	      let hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
  	      /**
  	       * Wraps an object in a Proxy which intercepts and wraps certain methods
  	       * based on the given `wrappers` and `metadata` objects.
  	       *
  	       * @param {object} target
  	       *        The target object to wrap.
  	       *
  	       * @param {object} [wrappers = {}]
  	       *        An object tree containing wrapper functions for special cases. Any
  	       *        function present in this object tree is called in place of the
  	       *        method in the same location in the `target` object tree. These
  	       *        wrapper methods are invoked as described in {@see wrapMethod}.
  	       *
  	       * @param {object} [metadata = {}]
  	       *        An object tree containing metadata used to automatically generate
  	       *        Promise-based wrapper functions for asynchronous. Any function in
  	       *        the `target` object tree which has a corresponding metadata object
  	       *        in the same location in the `metadata` tree is replaced with an
  	       *        automatically-generated wrapper function, as described in
  	       *        {@see wrapAsyncFunction}
  	       *
  	       * @returns {Proxy<object>}
  	       */

  	      const wrapObject = (target, wrappers = {}, metadata = {}) => {
  	        let cache = Object.create(null);
  	        let handlers = {
  	          has(proxyTarget, prop) {
  	            return prop in target || prop in cache;
  	          },

  	          get(proxyTarget, prop, receiver) {
  	            if (prop in cache) {
  	              return cache[prop];
  	            }

  	            if (!(prop in target)) {
  	              return undefined;
  	            }

  	            let value = target[prop];

  	            if (typeof value === "function") {
  	              // This is a method on the underlying object. Check if we need to do
  	              // any wrapping.
  	              if (typeof wrappers[prop] === "function") {
  	                // We have a special-case wrapper for this method.
  	                value = wrapMethod(target, target[prop], wrappers[prop]);
  	              } else if (hasOwnProperty(metadata, prop)) {
  	                // This is an async method that we have metadata for. Create a
  	                // Promise wrapper for it.
  	                let wrapper = wrapAsyncFunction(prop, metadata[prop]);
  	                value = wrapMethod(target, target[prop], wrapper);
  	              } else {
  	                // This is a method that we don't know or care about. Return the
  	                // original method, bound to the underlying object.
  	                value = value.bind(target);
  	              }
  	            } else if (typeof value === "object" && value !== null && (hasOwnProperty(wrappers, prop) || hasOwnProperty(metadata, prop))) {
  	              // This is an object that we need to do some wrapping for the children
  	              // of. Create a sub-object wrapper for it with the appropriate child
  	              // metadata.
  	              value = wrapObject(value, wrappers[prop], metadata[prop]);
  	            } else if (hasOwnProperty(metadata, "*")) {
  	              // Wrap all properties in * namespace.
  	              value = wrapObject(value, wrappers[prop], metadata["*"]);
  	            } else {
  	              // We don't need to do any wrapping for this property,
  	              // so just forward all access to the underlying object.
  	              Object.defineProperty(cache, prop, {
  	                configurable: true,
  	                enumerable: true,

  	                get() {
  	                  return target[prop];
  	                },

  	                set(value) {
  	                  target[prop] = value;
  	                }

  	              });
  	              return value;
  	            }

  	            cache[prop] = value;
  	            return value;
  	          },

  	          set(proxyTarget, prop, value, receiver) {
  	            if (prop in cache) {
  	              cache[prop] = value;
  	            } else {
  	              target[prop] = value;
  	            }

  	            return true;
  	          },

  	          defineProperty(proxyTarget, prop, desc) {
  	            return Reflect.defineProperty(cache, prop, desc);
  	          },

  	          deleteProperty(proxyTarget, prop) {
  	            return Reflect.deleteProperty(cache, prop);
  	          }

  	        }; // Per contract of the Proxy API, the "get" proxy handler must return the
  	        // original value of the target if that value is declared read-only and
  	        // non-configurable. For this reason, we create an object with the
  	        // prototype set to `target` instead of using `target` directly.
  	        // Otherwise we cannot return a custom object for APIs that
  	        // are declared read-only and non-configurable, such as `chrome.devtools`.
  	        //
  	        // The proxy handlers themselves will still use the original `target`
  	        // instead of the `proxyTarget`, so that the methods and properties are
  	        // dereferenced via the original targets.

  	        let proxyTarget = Object.create(target);
  	        return new Proxy(proxyTarget, handlers);
  	      };
  	      /**
  	       * Creates a set of wrapper functions for an event object, which handles
  	       * wrapping of listener functions that those messages are passed.
  	       *
  	       * A single wrapper is created for each listener function, and stored in a
  	       * map. Subsequent calls to `addListener`, `hasListener`, or `removeListener`
  	       * retrieve the original wrapper, so that  attempts to remove a
  	       * previously-added listener work as expected.
  	       *
  	       * @param {DefaultWeakMap<function, function>} wrapperMap
  	       *        A DefaultWeakMap object which will create the appropriate wrapper
  	       *        for a given listener function when one does not exist, and retrieve
  	       *        an existing one when it does.
  	       *
  	       * @returns {object}
  	       */


  	      const wrapEvent = wrapperMap => ({
  	        addListener(target, listener, ...args) {
  	          target.addListener(wrapperMap.get(listener), ...args);
  	        },

  	        hasListener(target, listener) {
  	          return target.hasListener(wrapperMap.get(listener));
  	        },

  	        removeListener(target, listener) {
  	          target.removeListener(wrapperMap.get(listener));
  	        }

  	      });

  	      const onRequestFinishedWrappers = new DefaultWeakMap(listener => {
  	        if (typeof listener !== "function") {
  	          return listener;
  	        }
  	        /**
  	         * Wraps an onRequestFinished listener function so that it will return a
  	         * `getContent()` property which returns a `Promise` rather than using a
  	         * callback API.
  	         *
  	         * @param {object} req
  	         *        The HAR entry object representing the network request.
  	         */


  	        return function onRequestFinished(req) {
  	          const wrappedReq = wrapObject(req, {}
  	          /* wrappers */
  	          , {
  	            getContent: {
  	              minArgs: 0,
  	              maxArgs: 0
  	            }
  	          });
  	          listener(wrappedReq);
  	        };
  	      });
  	      const onMessageWrappers = new DefaultWeakMap(listener => {
  	        if (typeof listener !== "function") {
  	          return listener;
  	        }
  	        /**
  	         * Wraps a message listener function so that it may send responses based on
  	         * its return value, rather than by returning a sentinel value and calling a
  	         * callback. If the listener function returns a Promise, the response is
  	         * sent when the promise either resolves or rejects.
  	         *
  	         * @param {*} message
  	         *        The message sent by the other end of the channel.
  	         * @param {object} sender
  	         *        Details about the sender of the message.
  	         * @param {function(*)} sendResponse
  	         *        A callback which, when called with an arbitrary argument, sends
  	         *        that value as a response.
  	         * @returns {boolean}
  	         *        True if the wrapped listener returned a Promise, which will later
  	         *        yield a response. False otherwise.
  	         */


  	        return function onMessage(message, sender, sendResponse) {
  	          let didCallSendResponse = false;
  	          let wrappedSendResponse;
  	          let sendResponsePromise = new Promise(resolve => {
  	            wrappedSendResponse = function (response) {
  	              didCallSendResponse = true;
  	              resolve(response);
  	            };
  	          });
  	          let result;

  	          try {
  	            result = listener(message, sender, wrappedSendResponse);
  	          } catch (err) {
  	            result = Promise.reject(err);
  	          }

  	          const isResultThenable = result !== true && isThenable(result); // If the listener didn't returned true or a Promise, or called
  	          // wrappedSendResponse synchronously, we can exit earlier
  	          // because there will be no response sent from this listener.

  	          if (result !== true && !isResultThenable && !didCallSendResponse) {
  	            return false;
  	          } // A small helper to send the message if the promise resolves
  	          // and an error if the promise rejects (a wrapped sendMessage has
  	          // to translate the message into a resolved promise or a rejected
  	          // promise).


  	          const sendPromisedResult = promise => {
  	            promise.then(msg => {
  	              // send the message value.
  	              sendResponse(msg);
  	            }, error => {
  	              // Send a JSON representation of the error if the rejected value
  	              // is an instance of error, or the object itself otherwise.
  	              let message;

  	              if (error && (error instanceof Error || typeof error.message === "string")) {
  	                message = error.message;
  	              } else {
  	                message = "An unexpected error occurred";
  	              }

  	              sendResponse({
  	                __mozWebExtensionPolyfillReject__: true,
  	                message
  	              });
  	            }).catch(err => {
  	              // Print an error on the console if unable to send the response.
  	              console.error("Failed to send onMessage rejected reply", err);
  	            });
  	          }; // If the listener returned a Promise, send the resolved value as a
  	          // result, otherwise wait the promise related to the wrappedSendResponse
  	          // callback to resolve and send it as a response.


  	          if (isResultThenable) {
  	            sendPromisedResult(result);
  	          } else {
  	            sendPromisedResult(sendResponsePromise);
  	          } // Let Chrome know that the listener is replying.


  	          return true;
  	        };
  	      });

  	      const wrappedSendMessageCallback = ({
  	        reject,
  	        resolve
  	      }, reply) => {
  	        if (extensionAPIs.runtime.lastError) {
  	          // Detect when none of the listeners replied to the sendMessage call and resolve
  	          // the promise to undefined as in Firefox.
  	          // See https://github.com/mozilla/webextension-polyfill/issues/130
  	          if (extensionAPIs.runtime.lastError.message === CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE) {
  	            resolve();
  	          } else {
  	            reject(new Error(extensionAPIs.runtime.lastError.message));
  	          }
  	        } else if (reply && reply.__mozWebExtensionPolyfillReject__) {
  	          // Convert back the JSON representation of the error into
  	          // an Error instance.
  	          reject(new Error(reply.message));
  	        } else {
  	          resolve(reply);
  	        }
  	      };

  	      const wrappedSendMessage = (name, metadata, apiNamespaceObj, ...args) => {
  	        if (args.length < metadata.minArgs) {
  	          throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
  	        }

  	        if (args.length > metadata.maxArgs) {
  	          throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
  	        }

  	        return new Promise((resolve, reject) => {
  	          const wrappedCb = wrappedSendMessageCallback.bind(null, {
  	            resolve,
  	            reject
  	          });
  	          args.push(wrappedCb);
  	          apiNamespaceObj.sendMessage(...args);
  	        });
  	      };

  	      const staticWrappers = {
  	        devtools: {
  	          network: {
  	            onRequestFinished: wrapEvent(onRequestFinishedWrappers)
  	          }
  	        },
  	        runtime: {
  	          onMessage: wrapEvent(onMessageWrappers),
  	          onMessageExternal: wrapEvent(onMessageWrappers),
  	          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
  	            minArgs: 1,
  	            maxArgs: 3
  	          })
  	        },
  	        tabs: {
  	          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
  	            minArgs: 2,
  	            maxArgs: 3
  	          })
  	        }
  	      };
  	      const settingMetadata = {
  	        clear: {
  	          minArgs: 1,
  	          maxArgs: 1
  	        },
  	        get: {
  	          minArgs: 1,
  	          maxArgs: 1
  	        },
  	        set: {
  	          minArgs: 1,
  	          maxArgs: 1
  	        }
  	      };
  	      apiMetadata.privacy = {
  	        network: {
  	          "*": settingMetadata
  	        },
  	        services: {
  	          "*": settingMetadata
  	        },
  	        websites: {
  	          "*": settingMetadata
  	        }
  	      };
  	      return wrapObject(extensionAPIs, staticWrappers, apiMetadata);
  	    }; // The build process adds a UMD wrapper around this file, which makes the
  	    // `module` variable available.


  	    module.exports = wrapAPIs(chrome);
  	  } else {
  	    module.exports = globalThis.browser;
  	  }
  	});
  	
  } (browserPolyfill));

  var browserPolyfillExports = browserPolyfill.exports;
  const originalBrowser = /*@__PURE__*/getDefaultExportFromCjs(browserPolyfillExports);

  // src/browser.ts
  var browser = originalBrowser;

  const definition = defineBackground(() => {
    browser.runtime.onInstalled.addListener(() => {
      browser.tabs.create({
        url: "./src/welcome.html"
      });
    });
  });
  _background;

  function print(method, ...args) {
    if (typeof args[0] === "string") {
      const message = args.shift();
      method(`[wxt] ${message}`, ...args);
    } else {
      method("[wxt]", ...args);
    }
  }
  var logger = {
    debug: (...args) => print(console.debug, ...args),
    log: (...args) => print(console.log, ...args),
    warn: (...args) => print(console.warn, ...args),
    error: (...args) => print(console.error, ...args)
  };
  function setupWebSocket(onMessage) {
    const serverUrl = `${"ws:"}//${"localhost"}:${3e3}`;
    logger.debug("Connecting to dev server @", serverUrl);
    const ws = new WebSocket(serverUrl, "vite-hmr");
    ws.addEventListener("open", () => {
      logger.debug("Connected to dev server");
    });
    ws.addEventListener("close", () => {
      logger.debug("Disconnected from dev server");
    });
    ws.addEventListener("error", (event) => {
      logger.error("Failed to connect to dev server", event);
    });
    ws.addEventListener("message", (e) => {
      try {
        const message = JSON.parse(e.data);
        if (message.type === "custom" && message.event?.startsWith?.("wxt:")) {
          onMessage?.(message);
        }
      } catch (err) {
        logger.error("Failed to handle message", err);
      }
    });
    return ws;
  }
  function keepServiceWorkerAlive() {
    setInterval(async () => {
      await browser.runtime.getPlatformInfo();
    }, 5e3);
  }
  function reloadContentScript(payload) {
    const manifest = browser.runtime.getManifest();
    if (manifest.manifest_version == 2) {
      void reloadContentScriptMv2();
    } else {
      void reloadContentScriptMv3(payload);
    }
  }
  async function reloadContentScriptMv3({
    registration,
    contentScript
  }) {
    if (registration === "runtime") {
      await reloadRuntimeContentScriptMv3(contentScript);
    } else {
      await reloadManifestContentScriptMv3(contentScript);
    }
  }
  async function reloadManifestContentScriptMv3(contentScript) {
    const id = `wxt:${contentScript.js[0]}`;
    logger.log("Reloading content script:", contentScript);
    const registered = await browser.scripting.getRegisteredContentScripts();
    logger.debug("Existing scripts:", registered);
    const existing = registered.find((cs) => cs.id === id);
    if (existing) {
      logger.debug("Updating content script", existing);
      await browser.scripting.updateContentScripts([{ ...contentScript, id }]);
    } else {
      logger.debug("Registering new content script...");
      await browser.scripting.registerContentScripts([{ ...contentScript, id }]);
    }
    await reloadTabsForContentScript(contentScript);
  }
  async function reloadRuntimeContentScriptMv3(contentScript) {
    logger.log("Reloading content script:", contentScript);
    const registered = await browser.scripting.getRegisteredContentScripts();
    logger.debug("Existing scripts:", registered);
    const matches = registered.filter((cs) => {
      const hasJs = contentScript.js?.find((js) => cs.js?.includes(js));
      const hasCss = contentScript.css?.find((css) => cs.css?.includes(css));
      return hasJs || hasCss;
    });
    if (matches.length === 0) {
      logger.log(
        "Content script is not registered yet, nothing to reload",
        contentScript
      );
      return;
    }
    await browser.scripting.updateContentScripts(matches);
    await reloadTabsForContentScript(contentScript);
  }
  async function reloadTabsForContentScript(contentScript) {
    const allTabs = await browser.tabs.query({});
    const matchPatterns = contentScript.matches.map(
      (match) => new MatchPattern(match)
    );
    const matchingTabs = allTabs.filter((tab) => {
      const url = tab.url;
      if (!url)
        return false;
      return !!matchPatterns.find((pattern) => pattern.includes(url));
    });
    await Promise.all(matchingTabs.map((tab) => browser.tabs.reload(tab.id)));
  }
  async function reloadContentScriptMv2(_payload) {
    throw Error("TODO: reloadContentScriptMv2");
  }
  {
    try {
      const ws = setupWebSocket((message) => {
        if (message.event === "wxt:reload-extension")
          browser.runtime.reload();
        if (message.event === "wxt:reload-content-script" && message.data != null)
          reloadContentScript(message.data);
      });
      if (true) {
        ws.addEventListener("open", () => {
          const msg = { type: "custom", event: "wxt:background-initialized" };
          ws.send(JSON.stringify(msg));
        });
        keepServiceWorkerAlive();
      }
    } catch (err) {
      logger.error("Failed to setup web socket connection with dev server", err);
    }
    browser.commands.onCommand.addListener((command) => {
      if (command === "wxt:reload-extension") {
        browser.runtime.reload();
      }
    });
  }
  var result;
  try {
    result = definition.main();
    if (result instanceof Promise) {
      console.warn(
        "The background's main() function return a promise, but it must be synchronous"
      );
    }
  } catch (err) {
    logger.error("The background crashed on startup!");
    throw err;
  }
  var background_entrypoint_default = result;

  return background_entrypoint_default;

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0B3ZWJleHQtY29yZSttYXRjaC1wYXR0ZXJuc0AxLjAuMy9ub2RlX21vZHVsZXMvQHdlYmV4dC1jb3JlL21hdGNoLXBhdHRlcm5zL2xpYi9pbmRleC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93eHRAMC4xOC40L25vZGVfbW9kdWxlcy93eHQvZGlzdC9zYW5kYm94LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3dlYmV4dGVuc2lvbi1wb2x5ZmlsbEAwLjEwLjAvbm9kZV9tb2R1bGVzL3dlYmV4dGVuc2lvbi1wb2x5ZmlsbC9kaXN0L2Jyb3dzZXItcG9seWZpbGwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vd3h0QDAuMTguNC9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvY2h1bmstRk5URTJMMjcuanMiLCIuLi8uLi9lbnRyeXBvaW50cy9iYWNrZ3JvdW5kLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIHNyYy9pbmRleC50c1xudmFyIF9NYXRjaFBhdHRlcm4gPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKG1hdGNoUGF0dGVybikge1xuICAgIGlmIChtYXRjaFBhdHRlcm4gPT09IFwiPGFsbF91cmxzPlwiKSB7XG4gICAgICB0aGlzLmlzQWxsVXJscyA9IHRydWU7XG4gICAgICB0aGlzLnByb3RvY29sTWF0Y2hlcyA9IFsuLi5fTWF0Y2hQYXR0ZXJuLlBST1RPQ09MU107XG4gICAgICB0aGlzLmhvc3RuYW1lTWF0Y2ggPSBcIipcIjtcbiAgICAgIHRoaXMucGF0aG5hbWVNYXRjaCA9IFwiKlwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBncm91cHMgPSAvKC4qKTpcXC9cXC8oLio/KShcXC8uKikvLmV4ZWMobWF0Y2hQYXR0ZXJuKTtcbiAgICAgIGlmIChncm91cHMgPT0gbnVsbClcbiAgICAgICAgdGhyb3cgbmV3IEludmFsaWRNYXRjaFBhdHRlcm4obWF0Y2hQYXR0ZXJuLCBcIkluY29ycmVjdCBmb3JtYXRcIik7XG4gICAgICBjb25zdCBbXywgcHJvdG9jb2wsIGhvc3RuYW1lLCBwYXRobmFtZV0gPSBncm91cHM7XG4gICAgICB2YWxpZGF0ZVByb3RvY29sKG1hdGNoUGF0dGVybiwgcHJvdG9jb2wpO1xuICAgICAgdmFsaWRhdGVIb3N0bmFtZShtYXRjaFBhdHRlcm4sIGhvc3RuYW1lKTtcbiAgICAgIHZhbGlkYXRlUGF0aG5hbWUobWF0Y2hQYXR0ZXJuLCBwYXRobmFtZSk7XG4gICAgICB0aGlzLnByb3RvY29sTWF0Y2hlcyA9IHByb3RvY29sID09PSBcIipcIiA/IFtcImh0dHBcIiwgXCJodHRwc1wiXSA6IFtwcm90b2NvbF07XG4gICAgICB0aGlzLmhvc3RuYW1lTWF0Y2ggPSBob3N0bmFtZTtcbiAgICAgIHRoaXMucGF0aG5hbWVNYXRjaCA9IHBhdGhuYW1lO1xuICAgIH1cbiAgfVxuICBpbmNsdWRlcyh1cmwpIHtcbiAgICBpZiAodGhpcy5pc0FsbFVybHMpXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICBjb25zdCB1ID0gdHlwZW9mIHVybCA9PT0gXCJzdHJpbmdcIiA/IG5ldyBVUkwodXJsKSA6IHVybCBpbnN0YW5jZW9mIExvY2F0aW9uID8gbmV3IFVSTCh1cmwuaHJlZikgOiB1cmw7XG4gICAgcmV0dXJuICEhdGhpcy5wcm90b2NvbE1hdGNoZXMuZmluZCgocHJvdG9jb2wpID0+IHtcbiAgICAgIGlmIChwcm90b2NvbCA9PT0gXCJodHRwXCIpXG4gICAgICAgIHJldHVybiB0aGlzLmlzSHR0cE1hdGNoKHUpO1xuICAgICAgaWYgKHByb3RvY29sID09PSBcImh0dHBzXCIpXG4gICAgICAgIHJldHVybiB0aGlzLmlzSHR0cHNNYXRjaCh1KTtcbiAgICAgIGlmIChwcm90b2NvbCA9PT0gXCJmaWxlXCIpXG4gICAgICAgIHJldHVybiB0aGlzLmlzRmlsZU1hdGNoKHUpO1xuICAgICAgaWYgKHByb3RvY29sID09PSBcImZ0cFwiKVxuICAgICAgICByZXR1cm4gdGhpcy5pc0Z0cE1hdGNoKHUpO1xuICAgICAgaWYgKHByb3RvY29sID09PSBcInVyblwiKVxuICAgICAgICByZXR1cm4gdGhpcy5pc1Vybk1hdGNoKHUpO1xuICAgIH0pO1xuICB9XG4gIGlzSHR0cE1hdGNoKHVybCkge1xuICAgIHJldHVybiB1cmwucHJvdG9jb2wgPT09IFwiaHR0cDpcIiAmJiB0aGlzLmlzSG9zdFBhdGhNYXRjaCh1cmwpO1xuICB9XG4gIGlzSHR0cHNNYXRjaCh1cmwpIHtcbiAgICByZXR1cm4gdXJsLnByb3RvY29sID09PSBcImh0dHBzOlwiICYmIHRoaXMuaXNIb3N0UGF0aE1hdGNoKHVybCk7XG4gIH1cbiAgaXNIb3N0UGF0aE1hdGNoKHVybCkge1xuICAgIGlmICghdGhpcy5ob3N0bmFtZU1hdGNoIHx8ICF0aGlzLnBhdGhuYW1lTWF0Y2gpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgaG9zdG5hbWVNYXRjaFJlZ2V4cyA9IFtcbiAgICAgIHRoaXMuY29udmVydFBhdHRlcm5Ub1JlZ2V4KHRoaXMuaG9zdG5hbWVNYXRjaCksXG4gICAgICB0aGlzLmNvbnZlcnRQYXR0ZXJuVG9SZWdleCh0aGlzLmhvc3RuYW1lTWF0Y2gucmVwbGFjZSgvXlxcKlxcLi8sIFwiXCIpKVxuICAgIF07XG4gICAgY29uc3QgcGF0aG5hbWVNYXRjaFJlZ2V4ID0gdGhpcy5jb252ZXJ0UGF0dGVyblRvUmVnZXgodGhpcy5wYXRobmFtZU1hdGNoKTtcbiAgICByZXR1cm4gISFob3N0bmFtZU1hdGNoUmVnZXhzLmZpbmQoKHJlZ2V4KSA9PiByZWdleC50ZXN0KHVybC5ob3N0bmFtZSkpICYmIHBhdGhuYW1lTWF0Y2hSZWdleC50ZXN0KHVybC5wYXRobmFtZSk7XG4gIH1cbiAgaXNGaWxlTWF0Y2godXJsKSB7XG4gICAgdGhyb3cgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWQ6IGZpbGU6Ly8gcGF0dGVybiBtYXRjaGluZy4gT3BlbiBhIFBSIHRvIGFkZCBzdXBwb3J0XCIpO1xuICB9XG4gIGlzRnRwTWF0Y2godXJsKSB7XG4gICAgdGhyb3cgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWQ6IGZ0cDovLyBwYXR0ZXJuIG1hdGNoaW5nLiBPcGVuIGEgUFIgdG8gYWRkIHN1cHBvcnRcIik7XG4gIH1cbiAgaXNVcm5NYXRjaCh1cmwpIHtcbiAgICB0aHJvdyBFcnJvcihcIk5vdCBpbXBsZW1lbnRlZDogdXJuOi8vIHBhdHRlcm4gbWF0Y2hpbmcuIE9wZW4gYSBQUiB0byBhZGQgc3VwcG9ydFwiKTtcbiAgfVxuICBjb252ZXJ0UGF0dGVyblRvUmVnZXgocGF0dGVybikge1xuICAgIGNvbnN0IGVzY2FwZWQgPSB0aGlzLmVzY2FwZUZvclJlZ2V4KHBhdHRlcm4pO1xuICAgIGNvbnN0IHN0YXJzUmVwbGFjZWQgPSBlc2NhcGVkLnJlcGxhY2UoL1xcXFxcXCovZywgXCIuKlwiKTtcbiAgICByZXR1cm4gUmVnRXhwKGBeJHtzdGFyc1JlcGxhY2VkfSRgKTtcbiAgfVxuICBlc2NhcGVGb3JSZWdleChzdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCBcIlxcXFwkJlwiKTtcbiAgfVxufTtcbnZhciBNYXRjaFBhdHRlcm4gPSBfTWF0Y2hQYXR0ZXJuO1xuTWF0Y2hQYXR0ZXJuLlBST1RPQ09MUyA9IFtcImh0dHBcIiwgXCJodHRwc1wiLCBcImZpbGVcIiwgXCJmdHBcIiwgXCJ1cm5cIl07XG52YXIgSW52YWxpZE1hdGNoUGF0dGVybiA9IGNsYXNzIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtYXRjaFBhdHRlcm4sIHJlYXNvbikge1xuICAgIHN1cGVyKGBJbnZhbGlkIG1hdGNoIHBhdHRlcm4gXCIke21hdGNoUGF0dGVybn1cIjogJHtyZWFzb259YCk7XG4gIH1cbn07XG5mdW5jdGlvbiB2YWxpZGF0ZVByb3RvY29sKG1hdGNoUGF0dGVybiwgcHJvdG9jb2wpIHtcbiAgaWYgKCFNYXRjaFBhdHRlcm4uUFJPVE9DT0xTLmluY2x1ZGVzKHByb3RvY29sKSAmJiBwcm90b2NvbCAhPT0gXCIqXCIpXG4gICAgdGhyb3cgbmV3IEludmFsaWRNYXRjaFBhdHRlcm4oXG4gICAgICBtYXRjaFBhdHRlcm4sXG4gICAgICBgJHtwcm90b2NvbH0gbm90IGEgdmFsaWQgcHJvdG9jb2wgKCR7TWF0Y2hQYXR0ZXJuLlBST1RPQ09MUy5qb2luKFwiLCBcIil9KWBcbiAgICApO1xufVxuZnVuY3Rpb24gdmFsaWRhdGVIb3N0bmFtZShtYXRjaFBhdHRlcm4sIGhvc3RuYW1lKSB7XG4gIGlmIChob3N0bmFtZS5pbmNsdWRlcyhcIjpcIikpXG4gICAgdGhyb3cgbmV3IEludmFsaWRNYXRjaFBhdHRlcm4obWF0Y2hQYXR0ZXJuLCBgSG9zdG5hbWUgY2Fubm90IGluY2x1ZGUgYSBwb3J0YCk7XG4gIGlmIChob3N0bmFtZS5pbmNsdWRlcyhcIipcIikgJiYgaG9zdG5hbWUubGVuZ3RoID4gMSAmJiAhaG9zdG5hbWUuc3RhcnRzV2l0aChcIiouXCIpKVxuICAgIHRocm93IG5ldyBJbnZhbGlkTWF0Y2hQYXR0ZXJuKFxuICAgICAgbWF0Y2hQYXR0ZXJuLFxuICAgICAgYElmIHVzaW5nIGEgd2lsZGNhcmQgKCopLCBpdCBtdXN0IGdvIGF0IHRoZSBzdGFydCBvZiB0aGUgaG9zdG5hbWVgXG4gICAgKTtcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlUGF0aG5hbWUobWF0Y2hQYXR0ZXJuLCBwYXRobmFtZSkge1xuICByZXR1cm47XG59XG5leHBvcnQge1xuICBJbnZhbGlkTWF0Y2hQYXR0ZXJuLFxuICBNYXRjaFBhdHRlcm5cbn07XG4iLCIvLyBzcmMvc2FuZGJveC9kZWZpbmUtdW5saXN0ZWQtc2NyaXB0LnRzXG5mdW5jdGlvbiBkZWZpbmVVbmxpc3RlZFNjcmlwdChhcmcpIHtcbiAgaWYgKHR5cGVvZiBhcmcgPT09IFwiZnVuY3Rpb25cIilcbiAgICByZXR1cm4geyBtYWluOiBhcmcgfTtcbiAgcmV0dXJuIGFyZztcbn1cblxuLy8gc3JjL3NhbmRib3gvZGVmaW5lLWJhY2tncm91bmQudHNcbmZ1bmN0aW9uIGRlZmluZUJhY2tncm91bmQoYXJnKSB7XG4gIGlmICh0eXBlb2YgYXJnID09PSBcImZ1bmN0aW9uXCIpXG4gICAgcmV0dXJuIHsgbWFpbjogYXJnIH07XG4gIHJldHVybiBhcmc7XG59XG5cbi8vIHNyYy9zYW5kYm94L2RlZmluZS1jb250ZW50LXNjcmlwdC50c1xuZnVuY3Rpb24gZGVmaW5lQ29udGVudFNjcmlwdChkZWZpbml0aW9uKSB7XG4gIHJldHVybiBkZWZpbml0aW9uO1xufVxuXG4vLyBzcmMvc2FuZGJveC9pbmRleC50c1xuZXhwb3J0ICogZnJvbSBcIkB3ZWJleHQtY29yZS9tYXRjaC1wYXR0ZXJuc1wiO1xuZXhwb3J0IHtcbiAgZGVmaW5lQmFja2dyb3VuZCxcbiAgZGVmaW5lQ29udGVudFNjcmlwdCxcbiAgZGVmaW5lVW5saXN0ZWRTY3JpcHRcbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoXCJ3ZWJleHRlbnNpb24tcG9seWZpbGxcIiwgW1wibW9kdWxlXCJdLCBmYWN0b3J5KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGZhY3RvcnkobW9kdWxlKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbW9kID0ge1xuICAgICAgZXhwb3J0czoge31cbiAgICB9O1xuICAgIGZhY3RvcnkobW9kKTtcbiAgICBnbG9iYWwuYnJvd3NlciA9IG1vZC5leHBvcnRzO1xuICB9XG59KSh0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFRoaXMgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0aGlzLCBmdW5jdGlvbiAobW9kdWxlKSB7XG4gIC8qIHdlYmV4dGVuc2lvbi1wb2x5ZmlsbCAtIHYwLjEwLjAgLSBGcmkgQXVnIDEyIDIwMjIgMTk6NDI6NDQgKi9cblxuICAvKiAtKi0gTW9kZTogaW5kZW50LXRhYnMtbW9kZTogbmlsOyBqcy1pbmRlbnQtbGV2ZWw6IDIgLSotICovXG5cbiAgLyogdmltOiBzZXQgc3RzPTIgc3c9MiBldCB0dz04MDogKi9cblxuICAvKiBUaGlzIFNvdXJjZSBDb2RlIEZvcm0gaXMgc3ViamVjdCB0byB0aGUgdGVybXMgb2YgdGhlIE1vemlsbGEgUHVibGljXG4gICAqIExpY2Vuc2UsIHYuIDIuMC4gSWYgYSBjb3B5IG9mIHRoZSBNUEwgd2FzIG5vdCBkaXN0cmlidXRlZCB3aXRoIHRoaXNcbiAgICogZmlsZSwgWW91IGNhbiBvYnRhaW4gb25lIGF0IGh0dHA6Ly9tb3ppbGxhLm9yZy9NUEwvMi4wLy4gKi9cbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgaWYgKCFnbG9iYWxUaGlzLmNocm9tZT8ucnVudGltZT8uaWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGlzIHNjcmlwdCBzaG91bGQgb25seSBiZSBsb2FkZWQgaW4gYSBicm93c2VyIGV4dGVuc2lvbi5cIik7XG4gIH1cblxuICBpZiAodHlwZW9mIGdsb2JhbFRoaXMuYnJvd3NlciA9PT0gXCJ1bmRlZmluZWRcIiB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZ2xvYmFsVGhpcy5icm93c2VyKSAhPT0gT2JqZWN0LnByb3RvdHlwZSkge1xuICAgIGNvbnN0IENIUk9NRV9TRU5EX01FU1NBR0VfQ0FMTEJBQ0tfTk9fUkVTUE9OU0VfTUVTU0FHRSA9IFwiVGhlIG1lc3NhZ2UgcG9ydCBjbG9zZWQgYmVmb3JlIGEgcmVzcG9uc2Ugd2FzIHJlY2VpdmVkLlwiOyAvLyBXcmFwcGluZyB0aGUgYnVsayBvZiB0aGlzIHBvbHlmaWxsIGluIGEgb25lLXRpbWUtdXNlIGZ1bmN0aW9uIGlzIGEgbWlub3JcbiAgICAvLyBvcHRpbWl6YXRpb24gZm9yIEZpcmVmb3guIFNpbmNlIFNwaWRlcm1vbmtleSBkb2VzIG5vdCBmdWxseSBwYXJzZSB0aGVcbiAgICAvLyBjb250ZW50cyBvZiBhIGZ1bmN0aW9uIHVudGlsIHRoZSBmaXJzdCB0aW1lIGl0J3MgY2FsbGVkLCBhbmQgc2luY2UgaXQgd2lsbFxuICAgIC8vIG5ldmVyIGFjdHVhbGx5IG5lZWQgdG8gYmUgY2FsbGVkLCB0aGlzIGFsbG93cyB0aGUgcG9seWZpbGwgdG8gYmUgaW5jbHVkZWRcbiAgICAvLyBpbiBGaXJlZm94IG5lYXJseSBmb3IgZnJlZS5cblxuICAgIGNvbnN0IHdyYXBBUElzID0gZXh0ZW5zaW9uQVBJcyA9PiB7XG4gICAgICAvLyBOT1RFOiBhcGlNZXRhZGF0YSBpcyBhc3NvY2lhdGVkIHRvIHRoZSBjb250ZW50IG9mIHRoZSBhcGktbWV0YWRhdGEuanNvbiBmaWxlXG4gICAgICAvLyBhdCBidWlsZCB0aW1lIGJ5IHJlcGxhY2luZyB0aGUgZm9sbG93aW5nIFwiaW5jbHVkZVwiIHdpdGggdGhlIGNvbnRlbnQgb2YgdGhlXG4gICAgICAvLyBKU09OIGZpbGUuXG4gICAgICBjb25zdCBhcGlNZXRhZGF0YSA9IHtcbiAgICAgICAgXCJhbGFybXNcIjoge1xuICAgICAgICAgIFwiY2xlYXJcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJjbGVhckFsbFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEFsbFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImJvb2ttYXJrc1wiOiB7XG4gICAgICAgICAgXCJjcmVhdGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRDaGlsZHJlblwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFJlY2VudFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFN1YlRyZWVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRUcmVlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwibW92ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZVRyZWVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZWFyY2hcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJ1cGRhdGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJicm93c2VyQWN0aW9uXCI6IHtcbiAgICAgICAgICBcImRpc2FibGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJlbmFibGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRCYWRnZUJhY2tncm91bmRDb2xvclwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEJhZGdlVGV4dFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFBvcHVwXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0VGl0bGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJvcGVuUG9wdXBcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRCYWRnZUJhY2tncm91bmRDb2xvclwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldEJhZGdlVGV4dFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldEljb25cIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRQb3B1cFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldFRpdGxlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiYnJvd3NpbmdEYXRhXCI6IHtcbiAgICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZUNhY2hlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlQ29va2llc1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZURvd25sb2Fkc1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZUZvcm1EYXRhXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlSGlzdG9yeVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZUxvY2FsU3RvcmFnZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZVBhc3N3b3Jkc1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZVBsdWdpbkRhdGFcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXR0aW5nc1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImNvbW1hbmRzXCI6IHtcbiAgICAgICAgICBcImdldEFsbFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImNvbnRleHRNZW51c1wiOiB7XG4gICAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVBbGxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJ1cGRhdGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJjb29raWVzXCI6IHtcbiAgICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEFsbFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEFsbENvb2tpZVN0b3Jlc1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImRldnRvb2xzXCI6IHtcbiAgICAgICAgICBcImluc3BlY3RlZFdpbmRvd1wiOiB7XG4gICAgICAgICAgICBcImV2YWxcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDIsXG4gICAgICAgICAgICAgIFwic2luZ2xlQ2FsbGJhY2tBcmdcIjogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicGFuZWxzXCI6IHtcbiAgICAgICAgICAgIFwiY3JlYXRlXCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDMsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAzLFxuICAgICAgICAgICAgICBcInNpbmdsZUNhbGxiYWNrQXJnXCI6IHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImVsZW1lbnRzXCI6IHtcbiAgICAgICAgICAgICAgXCJjcmVhdGVTaWRlYmFyUGFuZVwiOiB7XG4gICAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJkb3dubG9hZHNcIjoge1xuICAgICAgICAgIFwiY2FuY2VsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZG93bmxvYWRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJlcmFzZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEZpbGVJY29uXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwib3BlblwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInBhdXNlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlRmlsZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlc3VtZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNlYXJjaFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNob3dcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJleHRlbnNpb25cIjoge1xuICAgICAgICAgIFwiaXNBbGxvd2VkRmlsZVNjaGVtZUFjY2Vzc1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImlzQWxsb3dlZEluY29nbml0b0FjY2Vzc1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImhpc3RvcnlcIjoge1xuICAgICAgICAgIFwiYWRkVXJsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZGVsZXRlQWxsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZGVsZXRlUmFuZ2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJkZWxldGVVcmxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRWaXNpdHNcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZWFyY2hcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJpMThuXCI6IHtcbiAgICAgICAgICBcImRldGVjdExhbmd1YWdlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0QWNjZXB0TGFuZ3VhZ2VzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiaWRlbnRpdHlcIjoge1xuICAgICAgICAgIFwibGF1bmNoV2ViQXV0aEZsb3dcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJpZGxlXCI6IHtcbiAgICAgICAgICBcInF1ZXJ5U3RhdGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJtYW5hZ2VtZW50XCI6IHtcbiAgICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEFsbFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFNlbGZcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRFbmFibGVkXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwidW5pbnN0YWxsU2VsZlwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcIm5vdGlmaWNhdGlvbnNcIjoge1xuICAgICAgICAgIFwiY2xlYXJcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJjcmVhdGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRBbGxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRQZXJtaXNzaW9uTGV2ZWxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJ1cGRhdGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJwYWdlQWN0aW9uXCI6IHtcbiAgICAgICAgICBcImdldFBvcHVwXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0VGl0bGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJoaWRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0SWNvblwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldFBvcHVwXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0VGl0bGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzaG93XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwicGVybWlzc2lvbnNcIjoge1xuICAgICAgICAgIFwiY29udGFpbnNcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRBbGxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZXF1ZXN0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwicnVudGltZVwiOiB7XG4gICAgICAgICAgXCJnZXRCYWNrZ3JvdW5kUGFnZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFBsYXRmb3JtSW5mb1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcIm9wZW5PcHRpb25zUGFnZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlcXVlc3RVcGRhdGVDaGVja1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNlbmRNZXNzYWdlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDNcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2VuZE5hdGl2ZU1lc3NhZ2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRVbmluc3RhbGxVUkxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXNzaW9uc1wiOiB7XG4gICAgICAgICAgXCJnZXREZXZpY2VzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0UmVjZW50bHlDbG9zZWRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZXN0b3JlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwic3RvcmFnZVwiOiB7XG4gICAgICAgICAgXCJsb2NhbFwiOiB7XG4gICAgICAgICAgICBcImNsZWFyXCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImdldEJ5dGVzSW5Vc2VcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwic2V0XCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBcIm1hbmFnZWRcIjoge1xuICAgICAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImdldEJ5dGVzSW5Vc2VcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic3luY1wiOiB7XG4gICAgICAgICAgICBcImNsZWFyXCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImdldEJ5dGVzSW5Vc2VcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwic2V0XCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcInRhYnNcIjoge1xuICAgICAgICAgIFwiY2FwdHVyZVZpc2libGVUYWJcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJjcmVhdGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJkZXRlY3RMYW5ndWFnZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImRpc2NhcmRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJkdXBsaWNhdGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJleGVjdXRlU2NyaXB0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0Q3VycmVudFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFpvb21cIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRab29tU2V0dGluZ3NcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnb0JhY2tcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnb0ZvcndhcmRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJoaWdobGlnaHRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJpbnNlcnRDU1NcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJtb3ZlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicXVlcnlcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZWxvYWRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVDU1NcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZW5kTWVzc2FnZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAzXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldFpvb21cIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRab29tU2V0dGluZ3NcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJ1cGRhdGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJ0b3BTaXRlc1wiOiB7XG4gICAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJ3ZWJOYXZpZ2F0aW9uXCI6IHtcbiAgICAgICAgICBcImdldEFsbEZyYW1lc1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEZyYW1lXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwid2ViUmVxdWVzdFwiOiB7XG4gICAgICAgICAgXCJoYW5kbGVyQmVoYXZpb3JDaGFuZ2VkXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwid2luZG93c1wiOiB7XG4gICAgICAgICAgXCJjcmVhdGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRBbGxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRDdXJyZW50XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0TGFzdEZvY3VzZWRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJ1cGRhdGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgaWYgKE9iamVjdC5rZXlzKGFwaU1ldGFkYXRhKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYXBpLW1ldGFkYXRhLmpzb24gaGFzIG5vdCBiZWVuIGluY2x1ZGVkIGluIGJyb3dzZXItcG9seWZpbGxcIik7XG4gICAgICB9XG4gICAgICAvKipcbiAgICAgICAqIEEgV2Vha01hcCBzdWJjbGFzcyB3aGljaCBjcmVhdGVzIGFuZCBzdG9yZXMgYSB2YWx1ZSBmb3IgYW55IGtleSB3aGljaCBkb2VzXG4gICAgICAgKiBub3QgZXhpc3Qgd2hlbiBhY2Nlc3NlZCwgYnV0IGJlaGF2ZXMgZXhhY3RseSBhcyBhbiBvcmRpbmFyeSBXZWFrTWFwXG4gICAgICAgKiBvdGhlcndpc2UuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY3JlYXRlSXRlbVxuICAgICAgICogICAgICAgIEEgZnVuY3Rpb24gd2hpY2ggd2lsbCBiZSBjYWxsZWQgaW4gb3JkZXIgdG8gY3JlYXRlIHRoZSB2YWx1ZSBmb3IgYW55XG4gICAgICAgKiAgICAgICAga2V5IHdoaWNoIGRvZXMgbm90IGV4aXN0LCB0aGUgZmlyc3QgdGltZSBpdCBpcyBhY2Nlc3NlZC4gVGhlXG4gICAgICAgKiAgICAgICAgZnVuY3Rpb24gcmVjZWl2ZXMsIGFzIGl0cyBvbmx5IGFyZ3VtZW50LCB0aGUga2V5IGJlaW5nIGNyZWF0ZWQuXG4gICAgICAgKi9cblxuXG4gICAgICBjbGFzcyBEZWZhdWx0V2Vha01hcCBleHRlbmRzIFdlYWtNYXAge1xuICAgICAgICBjb25zdHJ1Y3RvcihjcmVhdGVJdGVtLCBpdGVtcyA9IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHN1cGVyKGl0ZW1zKTtcbiAgICAgICAgICB0aGlzLmNyZWF0ZUl0ZW0gPSBjcmVhdGVJdGVtO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0KGtleSkge1xuICAgICAgICAgIGlmICghdGhpcy5oYXMoa2V5KSkge1xuICAgICAgICAgICAgdGhpcy5zZXQoa2V5LCB0aGlzLmNyZWF0ZUl0ZW0oa2V5KSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHN1cGVyLmdldChrZXkpO1xuICAgICAgICB9XG5cbiAgICAgIH1cbiAgICAgIC8qKlxuICAgICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBvYmplY3QgaXMgYW4gb2JqZWN0IHdpdGggYSBgdGhlbmAgbWV0aG9kLCBhbmQgY2FuXG4gICAgICAgKiB0aGVyZWZvcmUgYmUgYXNzdW1lZCB0byBiZWhhdmUgYXMgYSBQcm9taXNlLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHRlc3QuXG4gICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdGhlbmFibGUuXG4gICAgICAgKi9cblxuXG4gICAgICBjb25zdCBpc1RoZW5hYmxlID0gdmFsdWUgPT4ge1xuICAgICAgICByZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiB2YWx1ZS50aGVuID09PSBcImZ1bmN0aW9uXCI7XG4gICAgICB9O1xuICAgICAgLyoqXG4gICAgICAgKiBDcmVhdGVzIGFuZCByZXR1cm5zIGEgZnVuY3Rpb24gd2hpY2gsIHdoZW4gY2FsbGVkLCB3aWxsIHJlc29sdmUgb3IgcmVqZWN0XG4gICAgICAgKiB0aGUgZ2l2ZW4gcHJvbWlzZSBiYXNlZCBvbiBob3cgaXQgaXMgY2FsbGVkOlxuICAgICAgICpcbiAgICAgICAqIC0gSWYsIHdoZW4gY2FsbGVkLCBgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yYCBjb250YWlucyBhIG5vbi1udWxsIG9iamVjdCxcbiAgICAgICAqICAgdGhlIHByb21pc2UgaXMgcmVqZWN0ZWQgd2l0aCB0aGF0IHZhbHVlLlxuICAgICAgICogLSBJZiB0aGUgZnVuY3Rpb24gaXMgY2FsbGVkIHdpdGggZXhhY3RseSBvbmUgYXJndW1lbnQsIHRoZSBwcm9taXNlIGlzXG4gICAgICAgKiAgIHJlc29sdmVkIHRvIHRoYXQgdmFsdWUuXG4gICAgICAgKiAtIE90aGVyd2lzZSwgdGhlIHByb21pc2UgaXMgcmVzb2x2ZWQgdG8gYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlXG4gICAgICAgKiAgIGZ1bmN0aW9uJ3MgYXJndW1lbnRzLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwcm9taXNlXG4gICAgICAgKiAgICAgICAgQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHJlc29sdXRpb24gYW5kIHJlamVjdGlvbiBmdW5jdGlvbnMgb2YgYVxuICAgICAgICogICAgICAgIHByb21pc2UuXG4gICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBwcm9taXNlLnJlc29sdmVcbiAgICAgICAqICAgICAgICBUaGUgcHJvbWlzZSdzIHJlc29sdXRpb24gZnVuY3Rpb24uXG4gICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBwcm9taXNlLnJlamVjdFxuICAgICAgICogICAgICAgIFRoZSBwcm9taXNlJ3MgcmVqZWN0aW9uIGZ1bmN0aW9uLlxuICAgICAgICogQHBhcmFtIHtvYmplY3R9IG1ldGFkYXRhXG4gICAgICAgKiAgICAgICAgTWV0YWRhdGEgYWJvdXQgdGhlIHdyYXBwZWQgbWV0aG9kIHdoaWNoIGhhcyBjcmVhdGVkIHRoZSBjYWxsYmFjay5cbiAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gbWV0YWRhdGEuc2luZ2xlQ2FsbGJhY2tBcmdcbiAgICAgICAqICAgICAgICBXaGV0aGVyIG9yIG5vdCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIG9ubHkgdGhlIGZpcnN0XG4gICAgICAgKiAgICAgICAgYXJndW1lbnQgb2YgdGhlIGNhbGxiYWNrLCBhbHRlcm5hdGl2ZWx5IGFuIGFycmF5IG9mIGFsbCB0aGVcbiAgICAgICAqICAgICAgICBjYWxsYmFjayBhcmd1bWVudHMgaXMgcmVzb2x2ZWQuIEJ5IGRlZmF1bHQsIGlmIHRoZSBjYWxsYmFja1xuICAgICAgICogICAgICAgIGZ1bmN0aW9uIGlzIGludm9rZWQgd2l0aCBvbmx5IGEgc2luZ2xlIGFyZ3VtZW50LCB0aGF0IHdpbGwgYmVcbiAgICAgICAqICAgICAgICByZXNvbHZlZCB0byB0aGUgcHJvbWlzZSwgd2hpbGUgYWxsIGFyZ3VtZW50cyB3aWxsIGJlIHJlc29sdmVkIGFzXG4gICAgICAgKiAgICAgICAgYW4gYXJyYXkgaWYgbXVsdGlwbGUgYXJlIGdpdmVuLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIHtmdW5jdGlvbn1cbiAgICAgICAqICAgICAgICBUaGUgZ2VuZXJhdGVkIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAgICovXG5cblxuICAgICAgY29uc3QgbWFrZUNhbGxiYWNrID0gKHByb21pc2UsIG1ldGFkYXRhKSA9PiB7XG4gICAgICAgIHJldHVybiAoLi4uY2FsbGJhY2tBcmdzKSA9PiB7XG4gICAgICAgICAgaWYgKGV4dGVuc2lvbkFQSXMucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgIHByb21pc2UucmVqZWN0KG5ldyBFcnJvcihleHRlbnNpb25BUElzLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKG1ldGFkYXRhLnNpbmdsZUNhbGxiYWNrQXJnIHx8IGNhbGxiYWNrQXJncy5sZW5ndGggPD0gMSAmJiBtZXRhZGF0YS5zaW5nbGVDYWxsYmFja0FyZyAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHByb21pc2UucmVzb2x2ZShjYWxsYmFja0FyZ3NbMF0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcm9taXNlLnJlc29sdmUoY2FsbGJhY2tBcmdzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBwbHVyYWxpemVBcmd1bWVudHMgPSBudW1BcmdzID0+IG51bUFyZ3MgPT0gMSA/IFwiYXJndW1lbnRcIiA6IFwiYXJndW1lbnRzXCI7XG4gICAgICAvKipcbiAgICAgICAqIENyZWF0ZXMgYSB3cmFwcGVyIGZ1bmN0aW9uIGZvciBhIG1ldGhvZCB3aXRoIHRoZSBnaXZlbiBuYW1lIGFuZCBtZXRhZGF0YS5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgICAgICogICAgICAgIFRoZSBuYW1lIG9mIHRoZSBtZXRob2Qgd2hpY2ggaXMgYmVpbmcgd3JhcHBlZC5cbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBtZXRhZGF0YVxuICAgICAgICogICAgICAgIE1ldGFkYXRhIGFib3V0IHRoZSBtZXRob2QgYmVpbmcgd3JhcHBlZC5cbiAgICAgICAqIEBwYXJhbSB7aW50ZWdlcn0gbWV0YWRhdGEubWluQXJnc1xuICAgICAgICogICAgICAgIFRoZSBtaW5pbXVtIG51bWJlciBvZiBhcmd1bWVudHMgd2hpY2ggbXVzdCBiZSBwYXNzZWQgdG8gdGhlXG4gICAgICAgKiAgICAgICAgZnVuY3Rpb24uIElmIGNhbGxlZCB3aXRoIGZld2VyIHRoYW4gdGhpcyBudW1iZXIgb2YgYXJndW1lbnRzLCB0aGVcbiAgICAgICAqICAgICAgICB3cmFwcGVyIHdpbGwgcmFpc2UgYW4gZXhjZXB0aW9uLlxuICAgICAgICogQHBhcmFtIHtpbnRlZ2VyfSBtZXRhZGF0YS5tYXhBcmdzXG4gICAgICAgKiAgICAgICAgVGhlIG1heGltdW0gbnVtYmVyIG9mIGFyZ3VtZW50cyB3aGljaCBtYXkgYmUgcGFzc2VkIHRvIHRoZVxuICAgICAgICogICAgICAgIGZ1bmN0aW9uLiBJZiBjYWxsZWQgd2l0aCBtb3JlIHRoYW4gdGhpcyBudW1iZXIgb2YgYXJndW1lbnRzLCB0aGVcbiAgICAgICAqICAgICAgICB3cmFwcGVyIHdpbGwgcmFpc2UgYW4gZXhjZXB0aW9uLlxuICAgICAgICogQHBhcmFtIHtib29sZWFufSBtZXRhZGF0YS5zaW5nbGVDYWxsYmFja0FyZ1xuICAgICAgICogICAgICAgIFdoZXRoZXIgb3Igbm90IHRoZSBwcm9taXNlIGlzIHJlc29sdmVkIHdpdGggb25seSB0aGUgZmlyc3RcbiAgICAgICAqICAgICAgICBhcmd1bWVudCBvZiB0aGUgY2FsbGJhY2ssIGFsdGVybmF0aXZlbHkgYW4gYXJyYXkgb2YgYWxsIHRoZVxuICAgICAgICogICAgICAgIGNhbGxiYWNrIGFyZ3VtZW50cyBpcyByZXNvbHZlZC4gQnkgZGVmYXVsdCwgaWYgdGhlIGNhbGxiYWNrXG4gICAgICAgKiAgICAgICAgZnVuY3Rpb24gaXMgaW52b2tlZCB3aXRoIG9ubHkgYSBzaW5nbGUgYXJndW1lbnQsIHRoYXQgd2lsbCBiZVxuICAgICAgICogICAgICAgIHJlc29sdmVkIHRvIHRoZSBwcm9taXNlLCB3aGlsZSBhbGwgYXJndW1lbnRzIHdpbGwgYmUgcmVzb2x2ZWQgYXNcbiAgICAgICAqICAgICAgICBhbiBhcnJheSBpZiBtdWx0aXBsZSBhcmUgZ2l2ZW4uXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMge2Z1bmN0aW9uKG9iamVjdCwgLi4uKil9XG4gICAgICAgKiAgICAgICBUaGUgZ2VuZXJhdGVkIHdyYXBwZXIgZnVuY3Rpb24uXG4gICAgICAgKi9cblxuXG4gICAgICBjb25zdCB3cmFwQXN5bmNGdW5jdGlvbiA9IChuYW1lLCBtZXRhZGF0YSkgPT4ge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gYXN5bmNGdW5jdGlvbldyYXBwZXIodGFyZ2V0LCAuLi5hcmdzKSB7XG4gICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDwgbWV0YWRhdGEubWluQXJncykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBhdCBsZWFzdCAke21ldGFkYXRhLm1pbkFyZ3N9ICR7cGx1cmFsaXplQXJndW1lbnRzKG1ldGFkYXRhLm1pbkFyZ3MpfSBmb3IgJHtuYW1lfSgpLCBnb3QgJHthcmdzLmxlbmd0aH1gKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPiBtZXRhZGF0YS5tYXhBcmdzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGF0IG1vc3QgJHttZXRhZGF0YS5tYXhBcmdzfSAke3BsdXJhbGl6ZUFyZ3VtZW50cyhtZXRhZGF0YS5tYXhBcmdzKX0gZm9yICR7bmFtZX0oKSwgZ290ICR7YXJncy5sZW5ndGh9YCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGlmIChtZXRhZGF0YS5mYWxsYmFja1RvTm9DYWxsYmFjaykge1xuICAgICAgICAgICAgICAvLyBUaGlzIEFQSSBtZXRob2QgaGFzIGN1cnJlbnRseSBubyBjYWxsYmFjayBvbiBDaHJvbWUsIGJ1dCBpdCByZXR1cm4gYSBwcm9taXNlIG9uIEZpcmVmb3gsXG4gICAgICAgICAgICAgIC8vIGFuZCBzbyB0aGUgcG9seWZpbGwgd2lsbCB0cnkgdG8gY2FsbCBpdCB3aXRoIGEgY2FsbGJhY2sgZmlyc3QsIGFuZCBpdCB3aWxsIGZhbGxiYWNrXG4gICAgICAgICAgICAgIC8vIHRvIG5vdCBwYXNzaW5nIHRoZSBjYWxsYmFjayBpZiB0aGUgZmlyc3QgY2FsbCBmYWlscy5cbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0YXJnZXRbbmFtZV0oLi4uYXJncywgbWFrZUNhbGxiYWNrKHtcbiAgICAgICAgICAgICAgICAgIHJlc29sdmUsXG4gICAgICAgICAgICAgICAgICByZWplY3RcbiAgICAgICAgICAgICAgICB9LCBtZXRhZGF0YSkpO1xuICAgICAgICAgICAgICB9IGNhdGNoIChjYkVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGAke25hbWV9IEFQSSBtZXRob2QgZG9lc24ndCBzZWVtIHRvIHN1cHBvcnQgdGhlIGNhbGxiYWNrIHBhcmFtZXRlciwgYCArIFwiZmFsbGluZyBiYWNrIHRvIGNhbGwgaXQgd2l0aG91dCBhIGNhbGxiYWNrOiBcIiwgY2JFcnJvcik7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W25hbWVdKC4uLmFyZ3MpOyAvLyBVcGRhdGUgdGhlIEFQSSBtZXRob2QgbWV0YWRhdGEsIHNvIHRoYXQgdGhlIG5leHQgQVBJIGNhbGxzIHdpbGwgbm90IHRyeSB0b1xuICAgICAgICAgICAgICAgIC8vIHVzZSB0aGUgdW5zdXBwb3J0ZWQgY2FsbGJhY2sgYW55bW9yZS5cblxuICAgICAgICAgICAgICAgIG1ldGFkYXRhLmZhbGxiYWNrVG9Ob0NhbGxiYWNrID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbWV0YWRhdGEubm9DYWxsYmFjayA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1ldGFkYXRhLm5vQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgdGFyZ2V0W25hbWVdKC4uLmFyZ3MpO1xuICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0YXJnZXRbbmFtZV0oLi4uYXJncywgbWFrZUNhbGxiYWNrKHtcbiAgICAgICAgICAgICAgICByZXNvbHZlLFxuICAgICAgICAgICAgICAgIHJlamVjdFxuICAgICAgICAgICAgICB9LCBtZXRhZGF0YSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgfTtcbiAgICAgIC8qKlxuICAgICAgICogV3JhcHMgYW4gZXhpc3RpbmcgbWV0aG9kIG9mIHRoZSB0YXJnZXQgb2JqZWN0LCBzbyB0aGF0IGNhbGxzIHRvIGl0IGFyZVxuICAgICAgICogaW50ZXJjZXB0ZWQgYnkgdGhlIGdpdmVuIHdyYXBwZXIgZnVuY3Rpb24uIFRoZSB3cmFwcGVyIGZ1bmN0aW9uIHJlY2VpdmVzLFxuICAgICAgICogYXMgaXRzIGZpcnN0IGFyZ3VtZW50LCB0aGUgb3JpZ2luYWwgYHRhcmdldGAgb2JqZWN0LCBmb2xsb3dlZCBieSBlYWNoIG9mXG4gICAgICAgKiB0aGUgYXJndW1lbnRzIHBhc3NlZCB0byB0aGUgb3JpZ2luYWwgbWV0aG9kLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXRcbiAgICAgICAqICAgICAgICBUaGUgb3JpZ2luYWwgdGFyZ2V0IG9iamVjdCB0aGF0IHRoZSB3cmFwcGVkIG1ldGhvZCBiZWxvbmdzIHRvLlxuICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gbWV0aG9kXG4gICAgICAgKiAgICAgICAgVGhlIG1ldGhvZCBiZWluZyB3cmFwcGVkLiBUaGlzIGlzIHVzZWQgYXMgdGhlIHRhcmdldCBvZiB0aGUgUHJveHlcbiAgICAgICAqICAgICAgICBvYmplY3Qgd2hpY2ggaXMgY3JlYXRlZCB0byB3cmFwIHRoZSBtZXRob2QuXG4gICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB3cmFwcGVyXG4gICAgICAgKiAgICAgICAgVGhlIHdyYXBwZXIgZnVuY3Rpb24gd2hpY2ggaXMgY2FsbGVkIGluIHBsYWNlIG9mIGEgZGlyZWN0IGludm9jYXRpb25cbiAgICAgICAqICAgICAgICBvZiB0aGUgd3JhcHBlZCBtZXRob2QuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMge1Byb3h5PGZ1bmN0aW9uPn1cbiAgICAgICAqICAgICAgICBBIFByb3h5IG9iamVjdCBmb3IgdGhlIGdpdmVuIG1ldGhvZCwgd2hpY2ggaW52b2tlcyB0aGUgZ2l2ZW4gd3JhcHBlclxuICAgICAgICogICAgICAgIG1ldGhvZCBpbiBpdHMgcGxhY2UuXG4gICAgICAgKi9cblxuXG4gICAgICBjb25zdCB3cmFwTWV0aG9kID0gKHRhcmdldCwgbWV0aG9kLCB3cmFwcGVyKSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJveHkobWV0aG9kLCB7XG4gICAgICAgICAgYXBwbHkodGFyZ2V0TWV0aG9kLCB0aGlzT2JqLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gd3JhcHBlci5jYWxsKHRoaXNPYmosIHRhcmdldCwgLi4uYXJncyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgbGV0IGhhc093blByb3BlcnR5ID0gRnVuY3Rpb24uY2FsbC5iaW5kKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkpO1xuICAgICAgLyoqXG4gICAgICAgKiBXcmFwcyBhbiBvYmplY3QgaW4gYSBQcm94eSB3aGljaCBpbnRlcmNlcHRzIGFuZCB3cmFwcyBjZXJ0YWluIG1ldGhvZHNcbiAgICAgICAqIGJhc2VkIG9uIHRoZSBnaXZlbiBgd3JhcHBlcnNgIGFuZCBgbWV0YWRhdGFgIG9iamVjdHMuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtvYmplY3R9IHRhcmdldFxuICAgICAgICogICAgICAgIFRoZSB0YXJnZXQgb2JqZWN0IHRvIHdyYXAuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtvYmplY3R9IFt3cmFwcGVycyA9IHt9XVxuICAgICAgICogICAgICAgIEFuIG9iamVjdCB0cmVlIGNvbnRhaW5pbmcgd3JhcHBlciBmdW5jdGlvbnMgZm9yIHNwZWNpYWwgY2FzZXMuIEFueVxuICAgICAgICogICAgICAgIGZ1bmN0aW9uIHByZXNlbnQgaW4gdGhpcyBvYmplY3QgdHJlZSBpcyBjYWxsZWQgaW4gcGxhY2Ugb2YgdGhlXG4gICAgICAgKiAgICAgICAgbWV0aG9kIGluIHRoZSBzYW1lIGxvY2F0aW9uIGluIHRoZSBgdGFyZ2V0YCBvYmplY3QgdHJlZS4gVGhlc2VcbiAgICAgICAqICAgICAgICB3cmFwcGVyIG1ldGhvZHMgYXJlIGludm9rZWQgYXMgZGVzY3JpYmVkIGluIHtAc2VlIHdyYXBNZXRob2R9LlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbbWV0YWRhdGEgPSB7fV1cbiAgICAgICAqICAgICAgICBBbiBvYmplY3QgdHJlZSBjb250YWluaW5nIG1ldGFkYXRhIHVzZWQgdG8gYXV0b21hdGljYWxseSBnZW5lcmF0ZVxuICAgICAgICogICAgICAgIFByb21pc2UtYmFzZWQgd3JhcHBlciBmdW5jdGlvbnMgZm9yIGFzeW5jaHJvbm91cy4gQW55IGZ1bmN0aW9uIGluXG4gICAgICAgKiAgICAgICAgdGhlIGB0YXJnZXRgIG9iamVjdCB0cmVlIHdoaWNoIGhhcyBhIGNvcnJlc3BvbmRpbmcgbWV0YWRhdGEgb2JqZWN0XG4gICAgICAgKiAgICAgICAgaW4gdGhlIHNhbWUgbG9jYXRpb24gaW4gdGhlIGBtZXRhZGF0YWAgdHJlZSBpcyByZXBsYWNlZCB3aXRoIGFuXG4gICAgICAgKiAgICAgICAgYXV0b21hdGljYWxseS1nZW5lcmF0ZWQgd3JhcHBlciBmdW5jdGlvbiwgYXMgZGVzY3JpYmVkIGluXG4gICAgICAgKiAgICAgICAge0BzZWUgd3JhcEFzeW5jRnVuY3Rpb259XG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMge1Byb3h5PG9iamVjdD59XG4gICAgICAgKi9cblxuICAgICAgY29uc3Qgd3JhcE9iamVjdCA9ICh0YXJnZXQsIHdyYXBwZXJzID0ge30sIG1ldGFkYXRhID0ge30pID0+IHtcbiAgICAgICAgbGV0IGNhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgbGV0IGhhbmRsZXJzID0ge1xuICAgICAgICAgIGhhcyhwcm94eVRhcmdldCwgcHJvcCkge1xuICAgICAgICAgICAgcmV0dXJuIHByb3AgaW4gdGFyZ2V0IHx8IHByb3AgaW4gY2FjaGU7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGdldChwcm94eVRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICAgIGlmIChwcm9wIGluIGNhY2hlKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjYWNoZVtwcm9wXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCEocHJvcCBpbiB0YXJnZXQpKSB7XG4gICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRhcmdldFtwcm9wXTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgIC8vIFRoaXMgaXMgYSBtZXRob2Qgb24gdGhlIHVuZGVybHlpbmcgb2JqZWN0LiBDaGVjayBpZiB3ZSBuZWVkIHRvIGRvXG4gICAgICAgICAgICAgIC8vIGFueSB3cmFwcGluZy5cbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiB3cmFwcGVyc1twcm9wXSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIHNwZWNpYWwtY2FzZSB3cmFwcGVyIGZvciB0aGlzIG1ldGhvZC5cbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHdyYXBNZXRob2QodGFyZ2V0LCB0YXJnZXRbcHJvcF0sIHdyYXBwZXJzW3Byb3BdKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChoYXNPd25Qcm9wZXJ0eShtZXRhZGF0YSwgcHJvcCkpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGFuIGFzeW5jIG1ldGhvZCB0aGF0IHdlIGhhdmUgbWV0YWRhdGEgZm9yLiBDcmVhdGUgYVxuICAgICAgICAgICAgICAgIC8vIFByb21pc2Ugd3JhcHBlciBmb3IgaXQuXG4gICAgICAgICAgICAgICAgbGV0IHdyYXBwZXIgPSB3cmFwQXN5bmNGdW5jdGlvbihwcm9wLCBtZXRhZGF0YVtwcm9wXSk7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB3cmFwTWV0aG9kKHRhcmdldCwgdGFyZ2V0W3Byb3BdLCB3cmFwcGVyKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGEgbWV0aG9kIHRoYXQgd2UgZG9uJ3Qga25vdyBvciBjYXJlIGFib3V0LiBSZXR1cm4gdGhlXG4gICAgICAgICAgICAgICAgLy8gb3JpZ2luYWwgbWV0aG9kLCBib3VuZCB0byB0aGUgdW5kZXJseWluZyBvYmplY3QuXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5iaW5kKHRhcmdldCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlICE9PSBudWxsICYmIChoYXNPd25Qcm9wZXJ0eSh3cmFwcGVycywgcHJvcCkgfHwgaGFzT3duUHJvcGVydHkobWV0YWRhdGEsIHByb3ApKSkge1xuICAgICAgICAgICAgICAvLyBUaGlzIGlzIGFuIG9iamVjdCB0aGF0IHdlIG5lZWQgdG8gZG8gc29tZSB3cmFwcGluZyBmb3IgdGhlIGNoaWxkcmVuXG4gICAgICAgICAgICAgIC8vIG9mLiBDcmVhdGUgYSBzdWItb2JqZWN0IHdyYXBwZXIgZm9yIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIGNoaWxkXG4gICAgICAgICAgICAgIC8vIG1ldGFkYXRhLlxuICAgICAgICAgICAgICB2YWx1ZSA9IHdyYXBPYmplY3QodmFsdWUsIHdyYXBwZXJzW3Byb3BdLCBtZXRhZGF0YVtwcm9wXSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhc093blByb3BlcnR5KG1ldGFkYXRhLCBcIipcIikpIHtcbiAgICAgICAgICAgICAgLy8gV3JhcCBhbGwgcHJvcGVydGllcyBpbiAqIG5hbWVzcGFjZS5cbiAgICAgICAgICAgICAgdmFsdWUgPSB3cmFwT2JqZWN0KHZhbHVlLCB3cmFwcGVyc1twcm9wXSwgbWV0YWRhdGFbXCIqXCJdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gZG8gYW55IHdyYXBwaW5nIGZvciB0aGlzIHByb3BlcnR5LFxuICAgICAgICAgICAgICAvLyBzbyBqdXN0IGZvcndhcmQgYWxsIGFjY2VzcyB0byB0aGUgdW5kZXJseWluZyBvYmplY3QuXG4gICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjYWNoZSwgcHJvcCwge1xuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuXG4gICAgICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wXTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgc2V0KHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICB0YXJnZXRbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FjaGVbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgc2V0KHByb3h5VGFyZ2V0LCBwcm9wLCB2YWx1ZSwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICAgIGlmIChwcm9wIGluIGNhY2hlKSB7XG4gICAgICAgICAgICAgIGNhY2hlW3Byb3BdID0gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0YXJnZXRbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGRlZmluZVByb3BlcnR5KHByb3h5VGFyZ2V0LCBwcm9wLCBkZXNjKSB7XG4gICAgICAgICAgICByZXR1cm4gUmVmbGVjdC5kZWZpbmVQcm9wZXJ0eShjYWNoZSwgcHJvcCwgZGVzYyk7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGRlbGV0ZVByb3BlcnR5KHByb3h5VGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgICAgICByZXR1cm4gUmVmbGVjdC5kZWxldGVQcm9wZXJ0eShjYWNoZSwgcHJvcCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH07IC8vIFBlciBjb250cmFjdCBvZiB0aGUgUHJveHkgQVBJLCB0aGUgXCJnZXRcIiBwcm94eSBoYW5kbGVyIG11c3QgcmV0dXJuIHRoZVxuICAgICAgICAvLyBvcmlnaW5hbCB2YWx1ZSBvZiB0aGUgdGFyZ2V0IGlmIHRoYXQgdmFsdWUgaXMgZGVjbGFyZWQgcmVhZC1vbmx5IGFuZFxuICAgICAgICAvLyBub24tY29uZmlndXJhYmxlLiBGb3IgdGhpcyByZWFzb24sIHdlIGNyZWF0ZSBhbiBvYmplY3Qgd2l0aCB0aGVcbiAgICAgICAgLy8gcHJvdG90eXBlIHNldCB0byBgdGFyZ2V0YCBpbnN0ZWFkIG9mIHVzaW5nIGB0YXJnZXRgIGRpcmVjdGx5LlxuICAgICAgICAvLyBPdGhlcndpc2Ugd2UgY2Fubm90IHJldHVybiBhIGN1c3RvbSBvYmplY3QgZm9yIEFQSXMgdGhhdFxuICAgICAgICAvLyBhcmUgZGVjbGFyZWQgcmVhZC1vbmx5IGFuZCBub24tY29uZmlndXJhYmxlLCBzdWNoIGFzIGBjaHJvbWUuZGV2dG9vbHNgLlxuICAgICAgICAvL1xuICAgICAgICAvLyBUaGUgcHJveHkgaGFuZGxlcnMgdGhlbXNlbHZlcyB3aWxsIHN0aWxsIHVzZSB0aGUgb3JpZ2luYWwgYHRhcmdldGBcbiAgICAgICAgLy8gaW5zdGVhZCBvZiB0aGUgYHByb3h5VGFyZ2V0YCwgc28gdGhhdCB0aGUgbWV0aG9kcyBhbmQgcHJvcGVydGllcyBhcmVcbiAgICAgICAgLy8gZGVyZWZlcmVuY2VkIHZpYSB0aGUgb3JpZ2luYWwgdGFyZ2V0cy5cblxuICAgICAgICBsZXQgcHJveHlUYXJnZXQgPSBPYmplY3QuY3JlYXRlKHRhcmdldCk7XG4gICAgICAgIHJldHVybiBuZXcgUHJveHkocHJveHlUYXJnZXQsIGhhbmRsZXJzKTtcbiAgICAgIH07XG4gICAgICAvKipcbiAgICAgICAqIENyZWF0ZXMgYSBzZXQgb2Ygd3JhcHBlciBmdW5jdGlvbnMgZm9yIGFuIGV2ZW50IG9iamVjdCwgd2hpY2ggaGFuZGxlc1xuICAgICAgICogd3JhcHBpbmcgb2YgbGlzdGVuZXIgZnVuY3Rpb25zIHRoYXQgdGhvc2UgbWVzc2FnZXMgYXJlIHBhc3NlZC5cbiAgICAgICAqXG4gICAgICAgKiBBIHNpbmdsZSB3cmFwcGVyIGlzIGNyZWF0ZWQgZm9yIGVhY2ggbGlzdGVuZXIgZnVuY3Rpb24sIGFuZCBzdG9yZWQgaW4gYVxuICAgICAgICogbWFwLiBTdWJzZXF1ZW50IGNhbGxzIHRvIGBhZGRMaXN0ZW5lcmAsIGBoYXNMaXN0ZW5lcmAsIG9yIGByZW1vdmVMaXN0ZW5lcmBcbiAgICAgICAqIHJldHJpZXZlIHRoZSBvcmlnaW5hbCB3cmFwcGVyLCBzbyB0aGF0ICBhdHRlbXB0cyB0byByZW1vdmUgYVxuICAgICAgICogcHJldmlvdXNseS1hZGRlZCBsaXN0ZW5lciB3b3JrIGFzIGV4cGVjdGVkLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7RGVmYXVsdFdlYWtNYXA8ZnVuY3Rpb24sIGZ1bmN0aW9uPn0gd3JhcHBlck1hcFxuICAgICAgICogICAgICAgIEEgRGVmYXVsdFdlYWtNYXAgb2JqZWN0IHdoaWNoIHdpbGwgY3JlYXRlIHRoZSBhcHByb3ByaWF0ZSB3cmFwcGVyXG4gICAgICAgKiAgICAgICAgZm9yIGEgZ2l2ZW4gbGlzdGVuZXIgZnVuY3Rpb24gd2hlbiBvbmUgZG9lcyBub3QgZXhpc3QsIGFuZCByZXRyaWV2ZVxuICAgICAgICogICAgICAgIGFuIGV4aXN0aW5nIG9uZSB3aGVuIGl0IGRvZXMuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMge29iamVjdH1cbiAgICAgICAqL1xuXG5cbiAgICAgIGNvbnN0IHdyYXBFdmVudCA9IHdyYXBwZXJNYXAgPT4gKHtcbiAgICAgICAgYWRkTGlzdGVuZXIodGFyZ2V0LCBsaXN0ZW5lciwgLi4uYXJncykge1xuICAgICAgICAgIHRhcmdldC5hZGRMaXN0ZW5lcih3cmFwcGVyTWFwLmdldChsaXN0ZW5lciksIC4uLmFyZ3MpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhhc0xpc3RlbmVyKHRhcmdldCwgbGlzdGVuZXIpIHtcbiAgICAgICAgICByZXR1cm4gdGFyZ2V0Lmhhc0xpc3RlbmVyKHdyYXBwZXJNYXAuZ2V0KGxpc3RlbmVyKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlTGlzdGVuZXIodGFyZ2V0LCBsaXN0ZW5lcikge1xuICAgICAgICAgIHRhcmdldC5yZW1vdmVMaXN0ZW5lcih3cmFwcGVyTWFwLmdldChsaXN0ZW5lcikpO1xuICAgICAgICB9XG5cbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBvblJlcXVlc3RGaW5pc2hlZFdyYXBwZXJzID0gbmV3IERlZmF1bHRXZWFrTWFwKGxpc3RlbmVyID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgcmV0dXJuIGxpc3RlbmVyO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXcmFwcyBhbiBvblJlcXVlc3RGaW5pc2hlZCBsaXN0ZW5lciBmdW5jdGlvbiBzbyB0aGF0IGl0IHdpbGwgcmV0dXJuIGFcbiAgICAgICAgICogYGdldENvbnRlbnQoKWAgcHJvcGVydHkgd2hpY2ggcmV0dXJucyBhIGBQcm9taXNlYCByYXRoZXIgdGhhbiB1c2luZyBhXG4gICAgICAgICAqIGNhbGxiYWNrIEFQSS5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHJlcVxuICAgICAgICAgKiAgICAgICAgVGhlIEhBUiBlbnRyeSBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBuZXR3b3JrIHJlcXVlc3QuXG4gICAgICAgICAqL1xuXG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG9uUmVxdWVzdEZpbmlzaGVkKHJlcSkge1xuICAgICAgICAgIGNvbnN0IHdyYXBwZWRSZXEgPSB3cmFwT2JqZWN0KHJlcSwge31cbiAgICAgICAgICAvKiB3cmFwcGVycyAqL1xuICAgICAgICAgICwge1xuICAgICAgICAgICAgZ2V0Q29udGVudDoge1xuICAgICAgICAgICAgICBtaW5BcmdzOiAwLFxuICAgICAgICAgICAgICBtYXhBcmdzOiAwXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbGlzdGVuZXIod3JhcHBlZFJlcSk7XG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IG9uTWVzc2FnZVdyYXBwZXJzID0gbmV3IERlZmF1bHRXZWFrTWFwKGxpc3RlbmVyID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgcmV0dXJuIGxpc3RlbmVyO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXcmFwcyBhIG1lc3NhZ2UgbGlzdGVuZXIgZnVuY3Rpb24gc28gdGhhdCBpdCBtYXkgc2VuZCByZXNwb25zZXMgYmFzZWQgb25cbiAgICAgICAgICogaXRzIHJldHVybiB2YWx1ZSwgcmF0aGVyIHRoYW4gYnkgcmV0dXJuaW5nIGEgc2VudGluZWwgdmFsdWUgYW5kIGNhbGxpbmcgYVxuICAgICAgICAgKiBjYWxsYmFjay4gSWYgdGhlIGxpc3RlbmVyIGZ1bmN0aW9uIHJldHVybnMgYSBQcm9taXNlLCB0aGUgcmVzcG9uc2UgaXNcbiAgICAgICAgICogc2VudCB3aGVuIHRoZSBwcm9taXNlIGVpdGhlciByZXNvbHZlcyBvciByZWplY3RzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0geyp9IG1lc3NhZ2VcbiAgICAgICAgICogICAgICAgIFRoZSBtZXNzYWdlIHNlbnQgYnkgdGhlIG90aGVyIGVuZCBvZiB0aGUgY2hhbm5lbC5cbiAgICAgICAgICogQHBhcmFtIHtvYmplY3R9IHNlbmRlclxuICAgICAgICAgKiAgICAgICAgRGV0YWlscyBhYm91dCB0aGUgc2VuZGVyIG9mIHRoZSBtZXNzYWdlLlxuICAgICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCopfSBzZW5kUmVzcG9uc2VcbiAgICAgICAgICogICAgICAgIEEgY2FsbGJhY2sgd2hpY2gsIHdoZW4gY2FsbGVkIHdpdGggYW4gYXJiaXRyYXJ5IGFyZ3VtZW50LCBzZW5kc1xuICAgICAgICAgKiAgICAgICAgdGhhdCB2YWx1ZSBhcyBhIHJlc3BvbnNlLlxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgICAgICogICAgICAgIFRydWUgaWYgdGhlIHdyYXBwZWQgbGlzdGVuZXIgcmV0dXJuZWQgYSBQcm9taXNlLCB3aGljaCB3aWxsIGxhdGVyXG4gICAgICAgICAqICAgICAgICB5aWVsZCBhIHJlc3BvbnNlLiBGYWxzZSBvdGhlcndpc2UuXG4gICAgICAgICAqL1xuXG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG9uTWVzc2FnZShtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgICAgICAgIGxldCBkaWRDYWxsU2VuZFJlc3BvbnNlID0gZmFsc2U7XG4gICAgICAgICAgbGV0IHdyYXBwZWRTZW5kUmVzcG9uc2U7XG4gICAgICAgICAgbGV0IHNlbmRSZXNwb25zZVByb21pc2UgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHdyYXBwZWRTZW5kUmVzcG9uc2UgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgZGlkQ2FsbFNlbmRSZXNwb25zZSA9IHRydWU7XG4gICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBsZXQgcmVzdWx0O1xuXG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJlc3VsdCA9IGxpc3RlbmVyKG1lc3NhZ2UsIHNlbmRlciwgd3JhcHBlZFNlbmRSZXNwb25zZSk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBQcm9taXNlLnJlamVjdChlcnIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGlzUmVzdWx0VGhlbmFibGUgPSByZXN1bHQgIT09IHRydWUgJiYgaXNUaGVuYWJsZShyZXN1bHQpOyAvLyBJZiB0aGUgbGlzdGVuZXIgZGlkbid0IHJldHVybmVkIHRydWUgb3IgYSBQcm9taXNlLCBvciBjYWxsZWRcbiAgICAgICAgICAvLyB3cmFwcGVkU2VuZFJlc3BvbnNlIHN5bmNocm9ub3VzbHksIHdlIGNhbiBleGl0IGVhcmxpZXJcbiAgICAgICAgICAvLyBiZWNhdXNlIHRoZXJlIHdpbGwgYmUgbm8gcmVzcG9uc2Ugc2VudCBmcm9tIHRoaXMgbGlzdGVuZXIuXG5cbiAgICAgICAgICBpZiAocmVzdWx0ICE9PSB0cnVlICYmICFpc1Jlc3VsdFRoZW5hYmxlICYmICFkaWRDYWxsU2VuZFJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfSAvLyBBIHNtYWxsIGhlbHBlciB0byBzZW5kIHRoZSBtZXNzYWdlIGlmIHRoZSBwcm9taXNlIHJlc29sdmVzXG4gICAgICAgICAgLy8gYW5kIGFuIGVycm9yIGlmIHRoZSBwcm9taXNlIHJlamVjdHMgKGEgd3JhcHBlZCBzZW5kTWVzc2FnZSBoYXNcbiAgICAgICAgICAvLyB0byB0cmFuc2xhdGUgdGhlIG1lc3NhZ2UgaW50byBhIHJlc29sdmVkIHByb21pc2Ugb3IgYSByZWplY3RlZFxuICAgICAgICAgIC8vIHByb21pc2UpLlxuXG5cbiAgICAgICAgICBjb25zdCBzZW5kUHJvbWlzZWRSZXN1bHQgPSBwcm9taXNlID0+IHtcbiAgICAgICAgICAgIHByb21pc2UudGhlbihtc2cgPT4ge1xuICAgICAgICAgICAgICAvLyBzZW5kIHRoZSBtZXNzYWdlIHZhbHVlLlxuICAgICAgICAgICAgICBzZW5kUmVzcG9uc2UobXNnKTtcbiAgICAgICAgICAgIH0sIGVycm9yID0+IHtcbiAgICAgICAgICAgICAgLy8gU2VuZCBhIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGVycm9yIGlmIHRoZSByZWplY3RlZCB2YWx1ZVxuICAgICAgICAgICAgICAvLyBpcyBhbiBpbnN0YW5jZSBvZiBlcnJvciwgb3IgdGhlIG9iamVjdCBpdHNlbGYgb3RoZXJ3aXNlLlxuICAgICAgICAgICAgICBsZXQgbWVzc2FnZTtcblxuICAgICAgICAgICAgICBpZiAoZXJyb3IgJiYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgfHwgdHlwZW9mIGVycm9yLm1lc3NhZ2UgPT09IFwic3RyaW5nXCIpKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2U7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IFwiQW4gdW5leHBlY3RlZCBlcnJvciBvY2N1cnJlZFwiO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgc2VuZFJlc3BvbnNlKHtcbiAgICAgICAgICAgICAgICBfX21veldlYkV4dGVuc2lvblBvbHlmaWxsUmVqZWN0X186IHRydWUsXG4gICAgICAgICAgICAgICAgbWVzc2FnZVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgIC8vIFByaW50IGFuIGVycm9yIG9uIHRoZSBjb25zb2xlIGlmIHVuYWJsZSB0byBzZW5kIHRoZSByZXNwb25zZS5cbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBzZW5kIG9uTWVzc2FnZSByZWplY3RlZCByZXBseVwiLCBlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTsgLy8gSWYgdGhlIGxpc3RlbmVyIHJldHVybmVkIGEgUHJvbWlzZSwgc2VuZCB0aGUgcmVzb2x2ZWQgdmFsdWUgYXMgYVxuICAgICAgICAgIC8vIHJlc3VsdCwgb3RoZXJ3aXNlIHdhaXQgdGhlIHByb21pc2UgcmVsYXRlZCB0byB0aGUgd3JhcHBlZFNlbmRSZXNwb25zZVxuICAgICAgICAgIC8vIGNhbGxiYWNrIHRvIHJlc29sdmUgYW5kIHNlbmQgaXQgYXMgYSByZXNwb25zZS5cblxuXG4gICAgICAgICAgaWYgKGlzUmVzdWx0VGhlbmFibGUpIHtcbiAgICAgICAgICAgIHNlbmRQcm9taXNlZFJlc3VsdChyZXN1bHQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZW5kUHJvbWlzZWRSZXN1bHQoc2VuZFJlc3BvbnNlUHJvbWlzZSk7XG4gICAgICAgICAgfSAvLyBMZXQgQ2hyb21lIGtub3cgdGhhdCB0aGUgbGlzdGVuZXIgaXMgcmVwbHlpbmcuXG5cblxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHdyYXBwZWRTZW5kTWVzc2FnZUNhbGxiYWNrID0gKHtcbiAgICAgICAgcmVqZWN0LFxuICAgICAgICByZXNvbHZlXG4gICAgICB9LCByZXBseSkgPT4ge1xuICAgICAgICBpZiAoZXh0ZW5zaW9uQVBJcy5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgIC8vIERldGVjdCB3aGVuIG5vbmUgb2YgdGhlIGxpc3RlbmVycyByZXBsaWVkIHRvIHRoZSBzZW5kTWVzc2FnZSBjYWxsIGFuZCByZXNvbHZlXG4gICAgICAgICAgLy8gdGhlIHByb21pc2UgdG8gdW5kZWZpbmVkIGFzIGluIEZpcmVmb3guXG4gICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL3dlYmV4dGVuc2lvbi1wb2x5ZmlsbC9pc3N1ZXMvMTMwXG4gICAgICAgICAgaWYgKGV4dGVuc2lvbkFQSXMucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSA9PT0gQ0hST01FX1NFTkRfTUVTU0FHRV9DQUxMQkFDS19OT19SRVNQT05TRV9NRVNTQUdFKSB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoZXh0ZW5zaW9uQVBJcy5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHJlcGx5ICYmIHJlcGx5Ll9fbW96V2ViRXh0ZW5zaW9uUG9seWZpbGxSZWplY3RfXykge1xuICAgICAgICAgIC8vIENvbnZlcnQgYmFjayB0aGUgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgZXJyb3IgaW50b1xuICAgICAgICAgIC8vIGFuIEVycm9yIGluc3RhbmNlLlxuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IocmVwbHkubWVzc2FnZSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUocmVwbHkpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBjb25zdCB3cmFwcGVkU2VuZE1lc3NhZ2UgPSAobmFtZSwgbWV0YWRhdGEsIGFwaU5hbWVzcGFjZU9iaiwgLi4uYXJncykgPT4ge1xuICAgICAgICBpZiAoYXJncy5sZW5ndGggPCBtZXRhZGF0YS5taW5BcmdzKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBhdCBsZWFzdCAke21ldGFkYXRhLm1pbkFyZ3N9ICR7cGx1cmFsaXplQXJndW1lbnRzKG1ldGFkYXRhLm1pbkFyZ3MpfSBmb3IgJHtuYW1lfSgpLCBnb3QgJHthcmdzLmxlbmd0aH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhcmdzLmxlbmd0aCA+IG1ldGFkYXRhLm1heEFyZ3MpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGF0IG1vc3QgJHttZXRhZGF0YS5tYXhBcmdzfSAke3BsdXJhbGl6ZUFyZ3VtZW50cyhtZXRhZGF0YS5tYXhBcmdzKX0gZm9yICR7bmFtZX0oKSwgZ290ICR7YXJncy5sZW5ndGh9YCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHdyYXBwZWRDYiA9IHdyYXBwZWRTZW5kTWVzc2FnZUNhbGxiYWNrLmJpbmQobnVsbCwge1xuICAgICAgICAgICAgcmVzb2x2ZSxcbiAgICAgICAgICAgIHJlamVjdFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGFyZ3MucHVzaCh3cmFwcGVkQ2IpO1xuICAgICAgICAgIGFwaU5hbWVzcGFjZU9iai5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBzdGF0aWNXcmFwcGVycyA9IHtcbiAgICAgICAgZGV2dG9vbHM6IHtcbiAgICAgICAgICBuZXR3b3JrOiB7XG4gICAgICAgICAgICBvblJlcXVlc3RGaW5pc2hlZDogd3JhcEV2ZW50KG9uUmVxdWVzdEZpbmlzaGVkV3JhcHBlcnMpXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBydW50aW1lOiB7XG4gICAgICAgICAgb25NZXNzYWdlOiB3cmFwRXZlbnQob25NZXNzYWdlV3JhcHBlcnMpLFxuICAgICAgICAgIG9uTWVzc2FnZUV4dGVybmFsOiB3cmFwRXZlbnQob25NZXNzYWdlV3JhcHBlcnMpLFxuICAgICAgICAgIHNlbmRNZXNzYWdlOiB3cmFwcGVkU2VuZE1lc3NhZ2UuYmluZChudWxsLCBcInNlbmRNZXNzYWdlXCIsIHtcbiAgICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgICBtYXhBcmdzOiAzXG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgICAgdGFiczoge1xuICAgICAgICAgIHNlbmRNZXNzYWdlOiB3cmFwcGVkU2VuZE1lc3NhZ2UuYmluZChudWxsLCBcInNlbmRNZXNzYWdlXCIsIHtcbiAgICAgICAgICAgIG1pbkFyZ3M6IDIsXG4gICAgICAgICAgICBtYXhBcmdzOiAzXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNvbnN0IHNldHRpbmdNZXRhZGF0YSA9IHtcbiAgICAgICAgY2xlYXI6IHtcbiAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgIG1heEFyZ3M6IDFcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0OiB7XG4gICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICBtYXhBcmdzOiAxXG4gICAgICAgIH0sXG4gICAgICAgIHNldDoge1xuICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgbWF4QXJnczogMVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgYXBpTWV0YWRhdGEucHJpdmFjeSA9IHtcbiAgICAgICAgbmV0d29yazoge1xuICAgICAgICAgIFwiKlwiOiBzZXR0aW5nTWV0YWRhdGFcbiAgICAgICAgfSxcbiAgICAgICAgc2VydmljZXM6IHtcbiAgICAgICAgICBcIipcIjogc2V0dGluZ01ldGFkYXRhXG4gICAgICAgIH0sXG4gICAgICAgIHdlYnNpdGVzOiB7XG4gICAgICAgICAgXCIqXCI6IHNldHRpbmdNZXRhZGF0YVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgcmV0dXJuIHdyYXBPYmplY3QoZXh0ZW5zaW9uQVBJcywgc3RhdGljV3JhcHBlcnMsIGFwaU1ldGFkYXRhKTtcbiAgICB9OyAvLyBUaGUgYnVpbGQgcHJvY2VzcyBhZGRzIGEgVU1EIHdyYXBwZXIgYXJvdW5kIHRoaXMgZmlsZSwgd2hpY2ggbWFrZXMgdGhlXG4gICAgLy8gYG1vZHVsZWAgdmFyaWFibGUgYXZhaWxhYmxlLlxuXG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IHdyYXBBUElzKGNocm9tZSk7XG4gIH0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBnbG9iYWxUaGlzLmJyb3dzZXI7XG4gIH1cbn0pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YnJvd3Nlci1wb2x5ZmlsbC5qcy5tYXBcbiIsIi8vIHNyYy9icm93c2VyLnRzXG5pbXBvcnQgb3JpZ2luYWxCcm93c2VyIGZyb20gXCJ3ZWJleHRlbnNpb24tcG9seWZpbGxcIjtcbnZhciBicm93c2VyID0gb3JpZ2luYWxCcm93c2VyO1xuXG5leHBvcnQge1xuICBicm93c2VyXG59O1xuIiwiZXhwb3J0IGRlZmF1bHQgZGVmaW5lQmFja2dyb3VuZCgoKSA9PiB7XG4gIGJyb3dzZXIucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcigoKSA9PiB7XG4gICAgYnJvd3Nlci50YWJzLmNyZWF0ZSh7XG4gICAgICB1cmw6IFwiLi9zcmMvd2VsY29tZS5odG1sXCJcbiAgICB9KTtcbiAgfSk7XG59KTsiXSwibmFtZXMiOlsidGhpcyJdLCJtYXBwaW5ncyI6Ijs7O0VBQUE7RUFDQSxJQUFJLGFBQWEsR0FBRyxNQUFNO0VBQzFCLEVBQUUsV0FBVyxDQUFDLFlBQVksRUFBRTtFQUM1QixJQUFJLElBQUksWUFBWSxLQUFLLFlBQVksRUFBRTtFQUN2QyxNQUFNLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0VBQzVCLE1BQU0sSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLEdBQUcsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0VBQzFELE1BQU0sSUFBSSxDQUFDLGFBQWEsR0FBRyxHQUFHLENBQUM7RUFDL0IsTUFBTSxJQUFJLENBQUMsYUFBYSxHQUFHLEdBQUcsQ0FBQztFQUMvQixLQUFLLE1BQU07RUFDWCxNQUFNLE1BQU0sTUFBTSxHQUFHLHNCQUFzQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztFQUMvRCxNQUFNLElBQUksTUFBTSxJQUFJLElBQUk7RUFDeEIsUUFBUSxNQUFNLElBQUksbUJBQW1CLENBQUMsWUFBWSxFQUFFLGtCQUFrQixDQUFDLENBQUM7RUFDeEUsTUFBTSxNQUFNLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFDO0VBQ3ZELE1BQU0sZ0JBQWdCLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0VBQy9DLE1BQU0sZ0JBQWdCLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0VBRS9DLE1BQU0sSUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLEtBQUssR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7RUFDL0UsTUFBTSxJQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQztFQUNwQyxNQUFNLElBQUksQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDO0VB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
