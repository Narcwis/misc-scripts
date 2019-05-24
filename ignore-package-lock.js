// ==UserScript==
// @name         Hide package-lock contents from bitbucket
// @namespace    http://tampermonkey.net/
// @version      0.1.13
// @description  Will collapse package-lock.json and add a button to toggle the changes visibility
// @author       Daffodil
// @match        https://bitbucket.org/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.slim.min.js
// ==/UserScript==

(function () {
    'use strict';

    const newBB = {
        selector: 'article[aria-label="Diff of file package-lock.json"] > div > div[class*="rah-static rah-static--height-auto"]',
        funk: () => {
            $('article[aria-label="Diff of file package-lock.json"] > div > div[data-qa="bk-file__header"]').click();
            console.log('package-lock.json should be collapsed');
        }
    };

    const oldBB = {
        selector: 'section[data-path="package-lock.json"]',
        funk: () => {
            const toggleVisibility = () => {
                if ($('section[data-path="package-lock.json"] div[class="refract-content-container"]').css('display') === 'none') {
                    $('section[data-path="package-lock.json"] div[class="refract-content-container"]').css('display', 'unset');
                } else {
                    $('section[data-path="package-lock.json"] div[class="refract-content-container"]').css('display', 'none');
                }
            };
            window.toggleElementVisibility = toggleVisibility;
            $('section[data-path="package-lock.json"] div[class="refract-content-container"]').css('display', 'none');
            $('section[data-path="package-lock.json"] button[original-title="View the side-by-side diff for this file"]').before('<button onClick="window.toggleElementVisibility()" class="execute click aui-button aui-button-light sbs">Toggle package-lock.json visibility</button>')
        }
    };

    const waitForEl = function (oldSelector, newSelector) {
        if ($(newSelector).length) {
            newBB.funk();
        } else if ($(oldSelector).length) {
            oldBB.funk();
        } else {
            setTimeout(function () {
                waitForEl(oldSelector, newSelector);
            }, 100);
        }
    };

    waitForEl(oldBB.selector, newBB.selector);

})();
