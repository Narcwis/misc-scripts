// ==UserScript==
// @name         Click next 3s netflix
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.netflix.com/watch/*
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // data-uia="next-episode-seamless-button"
    let netflixInterval = setInterval(() => {
        if ($('button[data-uia="next-episode-seamless-button"]').length > 0) {
                $('button[data-uia="next-episode-seamless-button"]')[0].triggerHandler('focus');
                $('button[data-uia="next-episode-seamless-button"]')[0].triggerHandler('click');
        }
    }, 3000);
})();
