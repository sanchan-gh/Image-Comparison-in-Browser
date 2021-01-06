// ==UserScript==
// @name        Sankakucomplex Compare Images Github
// @namespace   https://github.com/jklgit/
// @description Compare images on github
// @include     https://chan.sankakucomplex.com/post/show/*
// @include     https://chan.sankakucomplex.com/post/delete/*
// @version     1.1
// @grant       none
// ==/UserScript==

(function() {
'use strict';

function insert_node_after(node, ref) {
	ref.parentNode.insertBefore(node, ref.nextSibling);
}

// Add frame to deletion page
const thumbs = document.querySelectorAll('.deleting-post .thumb');
if (thumbs.length === 2) {
	// Create an iframe
	const iframe = document.createElement('iframe');
	iframe.src = 'https://sanchan-gh.github.io/Image-Comparison-in-Browser/index.html'
		+ `?sid1=${thumbs[0].getAttribute('id').substr(1)}`
		+ `&sid2=${thumbs[1].getAttribute('id').substr(1)}`;
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
		+ (parent ? `&sid2=${parent.getAttribute('id').substr(1)}` : '');

	const li = document.createElement('li');
	li.innerHTML = a.outerHTML;
	pool.parentNode.appendChild(li);
/*
	let post_id;
	const hidden_post_id_el = document.getElementById('hidden_post_id');
	if (hidden_post_id_el !== null)
		post_id = hidden_post_id_el.innerText;

	let parent_id;
	const post_parent_id = document.getElementById('post_parent_id');
	if (post_parent_id !== null)
		parent_id = post_parent_id.value;

	if (post_id && parent_id) {
		const iframe = document.createElement('iframe');
		iframe.src = 'https://sanchan-gh.github.io/Image-Comparison-in-Browser/index.html'
			+ `?sid1=${parent_id}`
			+ `&sid2=${post_id}`;
		iframe.style.height = '700px';
		iframe.style.marginLeft = '2em';
		iframe.style.width = 'calc(100% - 4em)';

		insert_node_after(iframe, document.getElementById('comments'));
	}
*/
}


})();
