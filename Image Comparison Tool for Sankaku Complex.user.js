// ==UserScript==
// @name        Image Comparison Tool for Sankaku Complex
// @namespace   https://github.com/sanchan-gh/
// @description Easily compare a post with its parent
// @author      sanchan, BicHD
// @include     https://chan.sankakucomplex.com/post/show/*
// @include     https://chan.sankakucomplex.com/post/delete/*
// @include     https://idol.sankakucomplex.com/post/show/*
// @include     https://idol.sankakucomplex.com/post/delete/*
// @include     https://legacy.sankakucomplex.com/post/show/*
// @include     https://legacy.sankakucomplex.com/post/delete/*
// @version     1.2.3
// @downloadURL https://github.com/sanchan-gh/Image-Comparison-in-Browser/raw/main/Image%20Comparison%20Tool%20for%20Sankaku%20Complex.user.js
// @updateURL   https://github.com/sanchan-gh/Image-Comparison-in-Browser/raw/main/Image%20Comparison%20Tool%20for%20Sankaku%20Complex.user.js
// @grant       GM.openInTab
// @grant       unsafeWindow
// ==/UserScript==

(function() {
  'use strict';

  // use Bic's image url fetch method instead of the old post id method?
  // this allows loading all images the user account can see
  const FETCH_METHOD = true;

  const ICT_URL = 'https://sanchan-gh.github.io/Image-Comparison-in-Browser/';

  const loadTime = Date.now();

  function showNotice(logFunc, ...msg) {
    unsafeWindow.notice?.(msg[0]);
    logFunc?.(...msg);
  }

  function openInTab(url) {
    if (typeof GM === 'object') {
      GM.openInTab(url, false);
    } else {
      window.open(url); // requires popup permission
    }
  }

  async function fetchImageUrl(postId) {
    const response = await fetch(new URL(`/post/show/${postId}`, document.location));
    if (!response.ok) throw Error('non-OK status code');
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    return getImageUrl(doc);
  }

  async function fetchImageUrls(...postIds) {
    return await Promise.all(postIds.map(id => fetchImageUrl(id)));
  }

  function getImageUrl(doc) {
    doc ??= document;
    return doc.getElementById('highres').href;
  }

  function getIctUrl(url1, url2) {
    const url = new URL(ICT_URL);
    url.searchParams.set('url1', url1);
    url.searchParams.set('url2', url2);
    return url.href;
  }

  function getIctUrlById(id1, id2) {
    const url = new URL(ICT_URL);
    url.searchParams.set('sid1', id1);
    url.searchParams.set('sid2', id2);
    return url.href;
  }

  // Workaround for Firefox sometimes scrolling the page when trying to zoom the ICT
  // yoinked from https://stackoverflow.com/questions/32165246/prevent-parent-page-from-scrolling-when-mouse-is-over-embedded-iframe-in-firefox
  const s = {};
  function scrollWorkaround(iframe) {
    iframe.addEventListener('mouseenter', () => {
      s.insideIframe = true;
      s.scrollX = window.scrollX;
      s.scrollY = window.scrollY;
    });

    iframe.addEventListener('mouseleave', () => {
      s.insideIframe = false;
    });

    document.addEventListener('scroll', () => {
      if (s.insideIframe)
        window.scrollTo(s.scrollX, s.scrollY);
    });
  }

  async function addIctToDeletionPage() {
    const postIds = [...document.querySelectorAll('#content > .deleting-post .thumb')]
      .map(thumb => thumb.id.substring(1));

    // either 2 or 0 thumbnails
    if (postIds.length === 0) return;

    const [postId, parentId] = postIds;

    // get ict url
    let url;
    if (FETCH_METHOD) {
      try {
        const imgUrls = await fetchImageUrls(postId, parentId);
        url = getIctUrl(...imgUrls);
      } catch (error) {
        showNotice(console.error, 'Couldn\'t fetch image urls, ' + error.message, error);
        return;
      }
    } else {
      url = getIctUrlById(postId, parentId);
    }

    // create and insert iframe
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.marginLeft = '2em';
    iframe.style.width = 'calc(100% - 4em)';
    iframe.height = window.innerHeight;
    scrollWorkaround(iframe);

    const content = document.getElementById('content');
    content.style.paddingBottom = 0;
    content.insertAdjacentElement('beforeend', iframe);
  }

  function findActionsList() {
    let actionsList;

    for (const a of document.querySelectorAll('.sidebar > div > ul:not(#tag-sidebar) > li > a')) {
      try {
        const pathname = new URL(a.href).pathname;
        if (pathname.startsWith('/post/similar')) {
          actionsList = a.parentElement.parentElement;
        }
      } catch (ignored) {}
    }

    return actionsList;
  }

  async function addCompareButtonToPostPage() {
    const actionsList = findActionsList();
    if (!actionsList) return;

    const parent = document.querySelector('#parent-preview > .thumb');
    if (!parent) return;

    const parentId = parent.id.substring(1);
    const postId = document.getElementById('hidden_post_id').innerText;

    const a = document.createElement('a');
    a.innerHTML = 'Compare image with parent';

    if (FETCH_METHOD) {
      a.href = '#';
      a.onclick = async (e) => {
        e.preventDefault();

        try {
          let imgUrls;

          // only fetch a new post image url if 4 minutes have passed
          if ((Date.now() - loadTime) / (1000 * 60) > 4) {
            showNotice(console.log, 'Fetching image urls...');
            imgUrls = await fetchImageUrls(postId, parentId);
          } else {
            showNotice(console.log, 'Fetching parent image url...');
            imgUrls = [getImageUrl(document), await fetchImageUrl(parentId)];
          }

          openInTab(getIctUrl(...imgUrls));
        } catch (error) {
          showNotice(console.error, 'Couldn\'t fetch image urls', error);
        }
      };
    } else {
      a.href = getIctUrlById(postId, parentId);
      a.target = '_blank';
    }

    const li = document.createElement('li');
    li.appendChild(a);
    actionsList.appendChild(li);
  }

  async function main() {
    await addCompareButtonToPostPage();
    await addIctToDeletionPage();
  }

  main().catch(error => showNotice(console.error, 'Image Comparison Tool script failed', error));

})();
