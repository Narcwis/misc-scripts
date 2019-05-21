// ==UserScript==
// @name         Remove package-lock from bitbucket
// @namespace    http://tampermonkey.net/
// @version      0.1.10
// @description  try to take over the world!
// @author       Daffodil
// @match        https://bitbucket.org/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.slim.min.js
// ==/UserScript==

(function() {
    'use strict';

         if ($('article[aria-label="Diff of file package-lock.json"] > div > div[class*="rah-static rah-static--height-auto"]').load(() => {
         console.log('Should click on element');
             $('article[aria-label="Diff of file package-lock.json"] > div > div[data-qa="bk-file__header"]').click();
             console.log('Should have clicked on element');
         })
})();
