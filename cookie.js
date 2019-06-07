// ==UserScript==
// @name         Clicker Auto
// @namespace    https://github.com/Narcwis/misc-scripts/blob/master/cookie.js
// @version      0.0.6
// @description  try to take over the world!
// @author       You
// @match        https://orteil.dashnet.org/cookieclicker/
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.slim.min.js
// ==/UserScript==

(function() {
    'use strict';
    setInterval(()=> {
    const toClick = $('div[class*="enabled"]');
    Object.keys(toClick).forEach((key) => {
        if (toClick[key] === toClick[Object.keys(toClick)[Object.keys(toClick).length]]) {
            toClick[key].click();
        }
    })
    }, 500);
})();
