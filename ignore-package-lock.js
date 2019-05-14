// ==UserScript==
// @name         Remove package-lock from bitbucket
// @namespace    http://tampermonkey.net/
// @version      0.1.5
// @description  try to take over the world!
// @author       Daffodil
// @match        https://bitbucket.org/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.slim.min.js
// ==/UserScript==

(function() {
    'use strict';
    const showPackageLock = () => {
        $('section[data-path="package-lock.json"]').css('display', 'unset');
        $('section[class="iterable-item bb-udiff maskable commentable-diff package-lock"] button[class="execute click aui-button aui-button-light sbs package-lock"]').remove();
    };
    window.showPackageLock = showPackageLock;
    let interval = setInterval(() => {

         if ($('section[data-path="package-lock.json"]').css('display') !== 'none') {
             $('section[data-path="package-lock.json"]').css('display', 'none' );
             $('section[data-path="package-lock.json"]').after('<section class="iterable-item bb-udiff maskable commentable-diff package-lock"><button onClick="window.showPackageLock()" class="execute click aui-button aui-button-light sbs package-lock">Show package-lock.json</button><section>');
         } else {
             clearInterval(interval);
         }
    }, 1000);
})();
