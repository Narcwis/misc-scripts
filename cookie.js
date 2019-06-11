// ==UserScript==
// @name         Clicker Auto
// @namespace    https://github.com/Narcwis/misc-scripts/blob/master/cookie.js
// @version      0.0.15
// @description  try to take over the world!
// @author       You
// @match        https://orteil.dashnet.org/cookieclicker/
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.slim.min.js
// ==/UserScript==

(function() {
    'use strict';
    const sleep = (time) => {
        return new Promise((resolve) => setTimeout(resolve, time));
    }
    const clickStuff = (toClick) => {
        Object.keys(toClick).forEach((key) => {
            if (toClick[key] === toClick[Object.keys(toClick)[Object.keys(toClick).length - 3]]) {
                toClick[key].click();
                sleep(300).then(() => {
                    toClick[key].click();
                    sleep(300).then(()=> {
                        toClick[key].click();
                    });
                });
            }
        });
    };
    setInterval(()=> {
        const productsToClick = $('div[class*="product unlocked enabled"]');
        const upgradesToClick = $('div[class*="crate upgrade enabled"]');
        clickStuff(upgradesToClick);
        clickStuff(productsToClick);
    }, 30000);
})();
