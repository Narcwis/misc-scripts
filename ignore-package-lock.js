// ==UserScript==
// @name         Remove package-lock from bitbucket
// @namespace    http://tampermonkey.net/
// @version      0.1.2
// @description  try to take over the world!
// @author       Daffodil
// @match        https://bitbucket.org/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.slim.min.js
// ==/UserScript==

(function() {
    'use strict';
    const showPackageLock = () => {
        console.log(window.packageLock);
        $('section[data-path="package-lock.json"]').css('display', 'unset');
        $('button[class="execute click aui-button aui-button-light sbs package-lock"]').css('display', 'none' );
    };
    window.showPackageLock = showPackageLock;
    let element;
    let interval = setInterval(() => {

         if ($('section[data-path="package-lock.json"]').css('display') !== 'none') {
             window.packageLock = $('section[data-path="package-lock.json"]');
             console.log('element detected', $('section[data-path="package-lock.json"]'));
             $('section[data-path="package-lock.json"]').css('display', 'none' );
             $('section[data-path="package-lock.json"]').after('<button onClick="window.showPackageLock()" class="execute click aui-button aui-button-light sbs package-lock">Show package-lock.json</button>');
         } else {
             clearInterval(interval);
         }
    }, 1000);
})();
