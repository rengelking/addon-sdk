/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { Cc, Ci } = require('chrome');
const { defer } = require('api-utils/functional');
const { windowNS } = require('api-utils/window/namespace');
const globalPB = require('private-browsing');

let pbService;

// Currently, only Firefox implements the private browsing service.
if (require("api-utils/xul-app").is("Firefox")) {
  pbService = Cc["@mozilla.org/privatebrowsing;1"].
              getService(Ci.nsIPrivateBrowsingService);
}

// We toggle private browsing mode asynchronously in order to work around
// bug 659629.  Since private browsing transitions are asynchronous
// anyway, this doesn't significantly change the behavior of the API.
let setMode = defer(function setMode(value, window) {
  value = !!value;  // Cast to boolean.

  if (window) {
    // is per-window private browsing implemented?
    let chromeWin = windowNS(window).window;
    if ("gPrivateBrowsingUI" in chromeWin
        && "privateWindow" in chromeWin.gPrivateBrowsingUI) {
      return chromeWin.gPrivateBrowsingUI.privateWindow = value;
    }
  }

  // default
  return pbService && (pbService.privateBrowsingEnabled = value);
});
exports.setMode = setMode;

let getMode = function getMode(window) {
  if (window) {
    // is per-window private browsing implemented?
    let chromeWin = windowNS(window).window;
    if ("gPrivateBrowsingUI" in chromeWin &&
        "privateWindow" in chromeWin.gPrivateBrowsingUI) {
      return chromeWin.gPrivateBrowsingUI.privateWindow;
    }
  }

  // default
  return globalPB.isActive;
};
exports.getMode = getMode;
