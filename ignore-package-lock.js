// ==UserScript==
// @name         Remove package-lock from bitbucket
// @namespace    http://tampermonkey.net/
// @version      0.1.12
// @description  Will collapse package-lock.json
// @author       Daffodil
// @match        https://bitbucket.org/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.slim.min.js
// ==/UserScript==

(function() {
    'use strict';

    const waitForEl = function(selector, callback) {
        if ($(selector).length) {
            callback();
        } else {
            setTimeout(function() {
                waitForEl(selector, callback);
            }, 100);
        }
    };

    waitForEl('article[aria-label="Diff of file package-lock.json"] > div > div[class*="rah-static rah-static--height-auto"]', function() {
        $('article[aria-label="Diff of file package-lock.json"] > div > div[data-qa="bk-file__header"]').click();
        console.log('package-lock.json should be collapsed');
    });
})();
