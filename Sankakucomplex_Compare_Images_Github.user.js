// ==UserScript==
// @name        Sankakucomplex Compare Images Github
// @namespace   https://github.com/sanchan-gh/
// @description Compare images on github
// @include     https://chan.sankakucomplex.com/post/show/*
// @include     https://chan.sankakucomplex.com/post/delete/*
// @version     1.1
// @grant       none
// ==/UserScript==

(function() {
'use strict';

// Add frame to deletion page
const thumbs = document.querySelectorAll('.deleting-post .thumb');
if (thumbs.length === 2) {
  // Create an iframe
  const iframe = document.createElement('iframe');
  iframe.src = 'https://sanchan-gh.github.io/Image-Comparison-in-Browser/index.html'
    + `?sid1=${thumbs[0].getAttribute('id').slice(1)}`
    + `&sid2=${thumbs[1].getAttribute('id').slice(1)}`;
  iframe.style.height = '700px';
  iframe.style.marginLeft = '2em';
  iframe.style.width = 'calc(100% - 4em)';

  // Append iframe
  document.getElementById('content').appendChild(iframe);
}

// Add link to post/show/ page
const pool = document.getElementById('add-to-pool');
if (pool) {
  // Compare with parent post if it exists
  const parent = document.querySelector('#parent-preview > .thumb');

  const a = document.createElement('a');
  a.innerHTML = 'Compare post content';
  a.target = '_blank';
  a.href = 'https://sanchan-gh.github.io/Image-Comparison-in-Browser/index.html'
    + `?url1=${encodeURIComponent(document.location.href)}`
    + (parent ? `&sid2=${parent.getAttribute('id').slice(1)}` : '');

  const li = document.createElement('li');
  li.innerHTML = a.outerHTML;
  pool.parentNode.appendChild(li);
}

})();
