// ==UserScript==
// @name         Remove package-lock from bitbucket
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  try to take over the world!
// @author       Daffodil
// @match        https://bitbucket.org/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.slim.min.js
// ==/UserScript==

(function() {
    'use strict';
    let interval = setInterval(() => {

         if ($('section[data-path="package-lock.json"]').css('display') !== 'none') {
             console.log('element detected');
             $('section[data-path="package-lock.json"]').css('display', 'none' );
         } else {
             clearInterval(interval);
         }
    }, 1000);
})();
