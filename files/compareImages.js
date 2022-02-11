/* eslint-disable no-undef */
//(function () {

// Global variables
const image1 = {
	dom: null, // dom-object
	j: null, // jQuery-object
	width: 1, // width of the image
	height: 1, // width of the image
	dataUrl: null, // base64 dataUrl
	file: null, // dropped file
	zoom: null, // Zoom button jQuery-object
	src: '', // For drag and drop from another browser
	type: '', // file type
};
const image2 = clone(image1);
const image3 = clone(image1);
let resembleConfig = null;
let play = true;
let displayDetails = true;
let displayExif = true;
let displayPixelated = true;

(function main() {
	// Bind drag and drop
	dragDropDiv($('#left'), image1);
	dragDropDiv($('#mid'), image2);

	// Details and Exif button listener
	displayDetails = $('#displayDetails').is(':checked');
	$('#displayDetails').parent().bind('click', function() {
		displayDetails = this.childNodes[0].checked;
		if (displayDetails) {
			$('.details').show();
		} else {
			$('.details').hide();
		}
	});
	displayExif = $('#displayExif').is(':checked');
	$('#displayExif').parent().bind('click', function() {
		displayExif = this.childNodes[0].checked;
		if (displayExif) {
			$('.exif').show();
		} else {
			$('.exif').hide();
		}
	});
	displayPixelated = $('#pixelated').is(':checked');
	const pixelatedStyle = 'image-rendering:crisp-edges; image-rendering:-moz-crisp-edges; image-rendering:pixelated; image-rendering: -o-crisp-edges; -ms-interpolation-mode: nearest-neighbor';
	if (displayPixelated) {
		$('#content').attr('style', pixelatedStyle);
	}
	$('#content').css({'image-rendering': 'crisp-edges'});
	$('#pixelated').parent().bind('click', function() {
		displayPixelated = this.childNodes[0].checked;
		if (displayPixelated) {
			$('#content').attr('style', pixelatedStyle);
		} else {
			$('#content').attr('style', '');
		}
	});

	// Play/Pause button listener
	$('#play').bind('click', () => {
		if (play) {
			play = false;
			$('video').each(function() {
				this.pause();
			});
		} else {
			play = true;
			$('video').each(function() {
				this.play();
			});
		}
	});

	// Zoom button listener
	image1.zoom = $('#left > .zoom').bind('click', () => {
			reset100(1);
		});
	image2.zoom = $('#mid > .zoom').bind('click', () => {
			reset100(2);
		});

	// Stack button listener
	$('#stack').bind('mousedown', () => {
		if ((image1.dom !== null) && (image2.dom !== null)) {
			if (image3.dom !== null) {
				image1.j.parent().css('left', 'calc(100% / 3)');
				image2.j.parent().css('left', '0');
			} else {
				image1.j.parent().css('left', '50%');
				image2.j.parent().css('left', '0');
			}
		}
	})
	.bind('mouseup', () => {
		if ((image1.dom !== null) && (image2.dom !== null)) {
			if (image3.dom !== null) {
				image2.j.parent().css('left', 'calc(100% / 3)');
				image1.j.parent().css('left', '0');
			} else {
				image2.j.parent().css('left', '50%');
				image1.j.parent().css('left', '0');
			}
		}
	})
	.bind('mouseleave', () => {
		if ((image1.dom !== null) && (image2.dom !== null)) {
			if (image3.dom !== null) {
				image2.j.parent().css('left', 'calc(100% / 3)');
				image1.j.parent().css('left', '0');
			} else {
				image2.j.parent().css('left', '50%');
				image1.j.parent().css('left', '0');
			}
		}
	});

	// Listener for resemble
	$('input[name="resemble-method"], input[name="resemble-color"]')
	.each(function(i) {
		// Reset to "nothing" and "flat"
		if ((i === 0) || (i === 3)) {
			this.checked = true;
		}
		this.disabled = true;
		this.onclick = function() {
			if (resembleConfig !== null) {
				switch (this.parentNode.innerText) {
				case 'Nothing':
					resembleConfig.ignoreNothing();
					break;
				case 'Less':
					resembleConfig.ignoreLess();
					break;
				case 'Colors':
					resembleConfig.ignoreColors();
					break;
				case 'Flat':
					resemble.outputSettings({
						errorType: 'flat',
					});
					resembleConfig.repaint();
					break;
				case 'Move':
					resemble.outputSettings({
						errorType: 'movement',
					});
					resembleConfig.repaint();
					break;
				case 'Flat diff':
					resemble.outputSettings({
						errorType: 'flatDifferenceIntensity',
					});
					resembleConfig.repaint();
					break;
				case 'Move diff':
					resemble.outputSettings({
						errorType: 'movementDifferenceIntensity',
					});
					resembleConfig.repaint();
					break;
				}
			}
		};
	});

	// Add mouselistener for zoom and pan
	$('#left')
	.bind('mousewheel', zoom)
	.bind('dblclick', reset)
	.parent()
	.bind('mousemove', pan)
	.bind('mousedown', panstart)
	.bind('mouseup', panstop)
	.bind('mouseleave', panstop);
	$('#mid')
	.bind('mousewheel', zoom)
	.bind('dblclick', reset);
	$('#right')
	.bind('mousewheel', zoom)
	.bind('dblclick', reset);

	// Pan function
	let panOn = false;
	function pan(event) {
		if (panOn) {
			const x = event.originalEvent.movementX;
			const y = event.originalEvent.movementY;
			if (image1.j !== null) {
				image1.j.css({
					top: (image1.j.position().top + y) + 'px',
					left: (image1.j.position().left + x) + 'px',
				});
			}
			if (image2.j !== null) {
				image2.j.css({
					top: image2.j.position().top + y + 'px',
					left: image2.j.position().left + x + 'px',
				});
			}
			if (image3.j !== null) {
				image3.j.css({
					top: image3.j.position().top + y + 'px',
					left: image3.j.position().left + x + 'px',
				});
			}
		}
	}
	function panstart(event) {
		panOn = true;
		return false;
	}
	function panstop(event) {
		panOn = false;
		return false;
	}

	// Zoom function
	function zoom(event) {
		// Relative scale
		const s = event.deltaY / 20;

		// For pan
		const x_0 = event.offsetX;
		const y_0 = event.offsetY;

		// Zooming along with pan => zooming at hovered point (natural feel)
		if (image1.j !== null) {
			image1.j.css({
				width: image1.j.width() * (1 + s) + 'px',
				height: image1.j.height() * (1 + s) + 'px',
				top: y_0 + (1 + s) * (image1.j.position().top - y_0) + 'px',
				left: x_0 + (1 + s) * (image1.j.position().left - x_0) + 'px',
			});
		}
		if (image2.j !== null) {
			image2.j.css({
				width: image2.j.width() * (1 + s) + 'px',
				height: image2.j.height() * (1 + s) + 'px',
				top: y_0 + (1 + s) * (image2.j.position().top - y_0) + 'px',
				left: x_0 + (1 + s) * (image2.j.position().left - x_0) + 'px',
			});
		}
		if (image3.j !== null) {
			image3.j.css({
				width: image3.j.width() * (1 + s) + 'px',
				height: image3.j.height() * (1 + s) + 'px',
				top: y_0 + (1 + s) * (image3.j.position().top - y_0) + 'px',
				left: x_0 + (1 + s) * (image3.j.position().left - x_0) + 'px',
			});
		}

		updateZoomButton();

		return false;
	}

	// Center element on resize
	$(window).bind('resize', onresize);
	let old_width = getWidth();
	let old_height = getHeight();
	function onresize(event) {
		const width = getWidth();
		const height = getHeight();
		const delta_width = width - old_width;
		const delta_height = height - old_height;

		let x = delta_width / 4.0;
		let y = delta_height / 4.0;
		if (image3.j !== null) {
			x = delta_width / 6.0;
			y = delta_height / 6.0;
		}

		if (image1.j !== null) {
			image1.j.css({
				top: (image1.j.position().top + y) + 'px',
				left: (image1.j.position().left + x) + 'px',
			});
		}
		if (image2.j !== null) {
			image2.j.css({
				top: image2.j.position().top + y + 'px',
				left: image2.j.position().left + x + 'px',
			});
		}
		if (image3.j !== null) {
			image3.j.css({
				top: image3.j.position().top + y + 'px',
				left: image3.j.position().left + x + 'px',
			});
		}

		old_width = width;
		old_height = height;
	}

	// Get cross browser window width and height
	function getWidth() {
		return (window.innerWidth
			 || document.documentElement.clientWidth
			 || document.body.clientWidth);
	}
	function getHeight() {
		return (window.innerHeight
			 || document.documentElement.clientHeight
			 || document.body.clientHeight);
	}

	// After everything is ready handle current location arguments
	handleArguments(parseUrl().args);

})();

// Handle arguments
function handleArguments(args) {
	let url;
	if (args.sid1) {
		url = parseUrl('https://chan.sankakucomplex.com/post/show/' + args.sid1);
	} else if (args.url1) {
		url = parseUrl(args.url1);
	}
	if (url) {
		handleUrl(url, $('#left'), image1);
	}

	url = undefined;
	if (args.sid2) {
		url = parseUrl('https://chan.sankakucomplex.com/post/show/' + args.sid2);
	} else if (args.url2) {
		url = parseUrl(args.url2);
	}
	if (url) {
		handleUrl(url, $('#mid'), image2);
	}
}

// Function to clone JS objects
function clone(obj) {
	if (null == obj || 'object' != typeof obj)
		return obj;
	const copy = obj.constructor();
	for (const attr in obj) {
		if (obj.hasOwnProperty(attr))
			copy[attr] = obj[attr];
	}
	return copy;
}

// Reset image scale and pos
function reset() {
	// Parent width, height and ratio (for all images same)
	const w_p = $('.block').width();
	const h_p = $('.block').height();
	const r_p = h_p / w_p;

	// Ratios of the images
	let r_1;
	if (image1.j !== null) { // If image has been calculated
		r_1 = image1.height / image1.width;
	}
	let r_2;
	if (image2.j !== null) { // If image has been calculated
		r_2 = image2.height / image2.width;
	}

	// If parent is more portrait
	if (r_p > r_1) {
		// Maximize width
		if (r_1) {
			image1.j.css({
				width: w_p,
				height: w_p * r_1,
				top: 0.5 * (h_p - w_p * r_1),
				left: 0,
			});
		}
		if (r_2) {
			image2.j.css({
				width: w_p,
				height: w_p * r_2,
				top: 0.5 * (h_p - w_p * r_2),
				left: 0,
			});
		}
	} else {
		// Maximize height
		if (r_1) {
			image1.j.css({
				width: h_p / r_1,
				height: h_p,
				top: 0,
				left: 0.5 * (w_p - h_p / r_1),
			});
		}
		if (r_2) {
			image2.j.css({
				width: h_p / r_2,
				height: h_p,
				top: 0,
				left: 0.5 * (w_p - h_p / r_2),
			});
		}
	}

	// Handle video
	if (r_1) {
		image1.j.attr('currentTime', 0);
	}
	if (r_2) {
		image2.j.attr('currentTime', 0);
	}

	reset3();
	updateZoomButton();
}

// Reset third image
function reset3() {
	if (image3.j !== null) {
		image3.j.css({
			width: image1.j.width(),
			height: image1.j.height(),
			top: image1.j.css('top'),
			left: image1.j.css('left'),
		});
	}
}

// Reset image to 100% zoom (Same as zoom-function but relative scale is from image instead of mousewheel)
function reset100(base) {
	// Parent width, height and ratio (for all images same), for natural zoom around center
	const w_p = $('.block').width();
	const h_p = $('.block').height();

	// Relative scale
	let s;
	if (base === 1) {
		s = image1.width / image1.j.width() - 1;
	} else {
		s = image2.width / image2.j.width() - 1;
	}

	// For pan
	const x_0 = w_p / 2;
	const y_0 = h_p / 2;

	// Zooming along with pan => zooming at hovered point (natural feel)
	if (image1.j !== null) {
		image1.j.css({
			width: image1.j.width() * (1 + s) + 'px',
			height: image1.j.height() * (1 + s) + 'px',
			top: y_0 + (1 + s) * (image1.j.position().top - y_0) + 'px',
			left: x_0 + (1 + s) * (image1.j.position().left - x_0) + 'px',
		});
	}
	if (image2.j !== null) {
		image2.j.css({
			width: image2.j.width() * (1 + s) + 'px',
			height: image2.j.height() * (1 + s) + 'px',
			top: y_0 + (1 + s) * (image2.j.position().top - y_0) + 'px',
			left: x_0 + (1 + s) * (image2.j.position().left - x_0) + 'px',
		});
	}
	if (image3.j !== null) {
		image3.j.css({
			width: image3.j.width() * (1 + s) + 'px',
			height: image3.j.height() * (1 + s) + 'px',
			top: y_0 + (1 + s) * (image3.j.position().top - y_0) + 'px',
			left: x_0 + (1 + s) * (image3.j.position().left - x_0) + 'px',
		});
	}

	updateZoomButton();

	return false;
}

// Zoom button update to current zoom
function updateZoomButton() {
	if (image1.j !== null) {
		image1.zoom.html(Math.round((image1.j.width() / image1.width) * 1000) / 10 + ' %');
	}
	if (image2.j !== null) {
		image2.zoom.html(Math.round((image2.j.width() / image2.width) * 1000) / 10 + ' %');
	}
}

// Add drag drop listener for blocks
function dragDropDiv(div, image) {

	div
	.bind('dragover', () => {
		div.addClass('drag-over');
		return false;
	})
	.bind('dragend', () => {
		div.removeClass('drag-over');
		return false;
	})
	.bind('dragleave', () => {
		div.removeClass('drag-over');
		return false;
	})
	.bind('drop', (event) => {
		const file = event.originalEvent.dataTransfer.files[0];
		console.log(event);
		if (file) {
			if (file.size > 100 * 1024 * 1024) {
				div.find('.center').html('File too big! Drop another one.');
			} else {
				event.stopPropagation();
				image.file = file;
				image.type = file.type.split('/')[1];
				handleFile(div, image);
			}
		} else {
			const url = parseUrl(event.originalEvent.dataTransfer.getData('Text'));
			event.stopPropagation();
			image.src = url.href;
			handleUrl(url, div, image);
		}
		div.removeClass('drag-over');
		return false;
	});
}

// Handle dropped URL
function handleUrl(url, div, image) {
	/*
	 * This needs CORS enabled and Referer allowed, or it will not work.
	 */

	// Find out which site the URL is from
	let tokens = /^https:\/\/chan\.sankakucomplex\.com\/post\/show\/(\d+)$/.exec(url.href);
	if (tokens) {

		// Remove old content in div
		div.find('.details').remove();
		div.find('.main').remove();
		div.find('.exif').remove();
		div.find('.center').remove();
		div.append($('<div class="center"></div>'));
		div.find('.center').html('Loading post from Sankakucomplex...');
		getSankakuPost(tokens[1], (post) => { // onComplete
			if (post.status === 'deleted') {
				div.find('.center').html('Post has been deleted.');
				return;
			}

			image.type = post.type;
			image.src = getAbsolutePath(post.src);
			downloadImageFromUrl(url, div, image, post);
		}, () => { // onError
			div.find('.center').html('Could not load post from Sankakucomplex.<br>Download the image/video and drop that instead.');
		});
	} else {
		tokens = /^https:\/\/cs\.sankakucomplex\.com\/.+\.(.+)\?(\d+)$/.exec(url.href);
		if (tokens) {
			const post = {
				id: tokens[2],
			};
			image.type = tokens[1];
			image.src = url.href;
			downloadImageFromUrl(url, div, image, post);
		} else {
			image.src = url.href;
			downloadImageFromUrl(url, div, image);
		}
	}

	function getAbsolutePath(link) {
		if (!link.startsWith('https:')) {
			link = 'https:' + link;
		}
		return link;
	}
}

// Download Sankakucomplex post page
function getSankakuPost(id, onComplete, onError) {
	$.ajax({
		url: 'https://capi-v2.sankakucomplex.com/posts?lang=en&page=1&limit=1&tags=id_range:' + id,
		dataType: 'json',
		success: (data) => {
			data = data[0]; // data from the 1 returned post

console.debug(data);

			const post = { id };

			post.src = data.file_url;
			post.bytes = data.file_size;
			post.width = data.width;
			post.height = data.height;
			post.type = data.file_type.split('/')[1];
			post.details = `Post #${post.id}<br>Filesize: ${post.bytes} Bytes<br>Filetype: ${post.type}<br>Dimension: ${data.width}x${data.height}`;
			post.status = data.status;

			if (onComplete) {
				onComplete(post);
			}
		},
		error: onError,
	});
}

// Download image if a URL has been dropped into the block
function downloadImageFromUrl(url, div, image, post) {

	if (!post) {
		post = {};
	}

	// Remove old stuff
	div.find('.details').remove();
	div.find('.main').remove();
	div.find('.exif').remove();
	div.find('.center').remove();
	div.append($('<div class="center">Reading data from URL...</div>'));
	div.append('<div class="exif"></div>');
	div.append('<div class="details"><div>');
	image.dataUrl = null;
	image3.dom = null;
	image3.j = null;

	// If post details have been loaded before
	if (post.details) {
		div.find('.details').html(post.details);
	}

	// Create image
	let img;
	// If post before loaded aka thumbnail dropped, it could be a video
	if (post.details) {
		switch (post.type) {
		case 'jpg':
		case 'jpeg':
		case 'png':
		case 'gif':
		case 'bmp':
			img = new Image();
			img.onload = onLoadFunction;
			break;
		case 'mp4':
		case 'webm':
			img = document.createElement('video');
			img.addEventListener('loadedmetadata', onLoadFunction);
			img.setAttribute('autoplay', play);
			img.setAttribute('loop', true);
			img.muted = true;

			// Activate play/pause button
			$('#play').show();
			break;
		}
	} else {
		img = new Image();
		img.onload = onLoadFunction;
	}
	img.setAttribute('class', 'main');
	img.src = image.src; //+ '?bustcache=' + new Date().getTime();

	// Save dom object and append it
	image.dom = img;
	image.j = $(img);
	div.append(img);

	function onLoadFunction() {
		// Get image width and height on display
		if (img.tagName === 'IMG') {
			image.width = img.naturalWidth;
			image.height = img.naturalHeight;
		} else {
			image.width = this.videoWidth;
			image.height = this.videoHeight;
		}

		// Reset image, show zoom button and remove center text
		div.find('.center').remove();
		image.zoom.show();
		reset();

		// Add details: domain, filename and size, if information has not been read before
		if (!post.details) {
			const arguments = (url.search !== '') ? `Arguments: ${url.search}<br>` : '';
			div.find('.details').html(`Domain: ${url.host}<br>
				${arguments}
				Filename: ${url.file}<br>
				Dimension: ${image.width}x${image.height}`);

			// Get type from URL
			image.type = url.ext;
		}

		/*
		 * Following functions need CORS enabled, or it will not work.
		 */
		if (img.tagName === 'IMG') {
			// Clone image in case of CORS error happens
			const img_clone = img.cloneNode();

			// Read dataURL
			getDataUrl(img, image.width, image.height, (dataUrl) => { // onComplete
				image.dataUrl = dataUrl;
				compareImages();
			}, () => { // onError
				// img disappears on CORS error (what?!) => replace with clone
				image.j.remove();
				div.append(img_clone);
				image.dom = img_clone;
				image.j = $(image.dom);

				// Deactivate third block
				displayRight(false);
			});

			// Get filesize, if post not read before
			if (!post.id) {
				getFilesize(img.src, (filesize) => {
					div.find('.details').html(div.find('.details').html() + '<br>Filesize: ' + filesize + ' Bytes');
				});
			}

			// If image is directlink from Sankakucomplex, get post details
			if (post.id && !post.details) {
				getSankakuPost(post.id, (post_new) => {
					div.find('.details').html(post_new.details);
				});
			}

			// Read EXIF data and append to div if given
			EXIF.getData(img, function() {
				const text = EXIF.pretty(this).split('\n').join('<br>');
				div.find('.exif').remove();
				if (text !== '') {
					div.append($('<div class="exif">' + text + '</div>'));
				} else {
					div.find('.exif').remove();
				}
			});

		} else {
			displayRight(false);
		}
	}
}

// Handle dropped file
function handleFile(div, image) {

	// Remove old details and image
	div.find('.details').remove();
	div.find('.main').remove();
	div.find('.exif').remove();
	div.find('.center').remove();
	div.append($('<div class="center">Reading data...</div>'));
	image.dataUrl = null;
	image3.dom = null;
	image3.j = null;

	// Append details
	let details = document.createElement('div');
	details.setAttribute('class', 'details');
	details.innerHTML = `${image.file.name}<br>
		Filesize: ${image.file.size} Bytes<br>
		Filetype: ${image.file.type}`;
	div.append(details);
	if (!displayDetails) {
		$('.details').hide();
	}

	// Append EXIF
	EXIF.getData(image.file, function() {
		const text = EXIF.pretty(this).split('\n').join('<br>');
		if (text !== '') {
			div.append($('<div class="exif">' + text + '</div>'));
			if (!displayExif) {
				$('.exif').hide();
			}
		}
	});

	// Create dom element for type
	switch (image.file.type) {
	case 'image/jpeg':
	case 'image/png':
	case 'image/gif':
	case 'image/bmp':
		image.dom = new Image();
		break;

	case 'video/webm':
	case 'video/mp4':
		image.dom = document.createElement('video');
		image.dom.setAttribute('autoplay', play);
		image.dom.setAttribute('loop', true);
		image.dom.muted = true;

		// Activate play/pause button
		$('#play').show();

		break;
	}

	// Append file and compare on load
	if (image.dom !== null) {
		image.j = $(image.dom);
		image.dom.setAttribute('class', 'main');
		const fileReader = new FileReader();

		fileReader.onload = function(event) {
			let alreadyOnload = false;
			if (image.file.type.startsWith('image')) {
				image.dom.onload = function() {
					if (!alreadyOnload) {
						alreadyOnload = true;
						image.width = image.dom.width;
						image.height = image.dom.height;
						console.log(image);
						details.innerHTML += `<br>Dimension: ${image.width}x${image.height}`;
						div.find('.center').remove();
						image.zoom.show();
						reset();

						getDataUrl(image.dom, image.width, image.height, (dataUrl) => {
							image.dataUrl = dataUrl;
							compareImages();
						});

						// Metadata from PNG
						if (image.file.type === 'image/png') {
							// Textinformation
							const metadata = readPNGMetadataFromDataUrl(image.dom.src);
							const text = object2html(metadata.text);
							if (text !== '') {
								div.append($('<div class="exif">' + text + '</div>'));
							}
							// Additional details
							delete metadata.details.width;
							delete metadata.details.height;
							details = $(div).find('.details');
							details.html(details.html() + '<br>' + object2html(metadata.details));
						}
					}
				};
			} else {
				image.dom.addEventListener('loadedmetadata', function(e) {
					image.width = this.videoWidth;
					image.height = this.videoHeight;
					details.innerHTML += `<br>Dimension: ${image.width}x${image.height}`;
					div.find('.center').remove();
					image.zoom.show();
					reset();
					displayRight(false);
				}, false);
			}
			div.append(image.dom);
			image.dom.src = event.target.result;
		};

		fileReader.readAsDataURL(image.file);
	} else {
		div.find('.center').html('Not a supported image or video file!');
	}
}

// Compare images with resemble.js
function compareImages() {
	if ((image1.dataUrl !== null) && (image2.dataUrl !== null)) {

		// Compare images with resemble
		if (resembleConfig === null) {
			resemble.outputSettings({
				largeImageThreshold: 1200,
				transparency: 0.3,
			});
		}

		resembleConfig = resemble(image1.dataUrl).compareTo(image2.dataUrl).ignoreNothing().onComplete((data) => {
				// Image 3 Loaded
				image3.dom = document.querySelector('#right > .main');
				image3.j = $(image3.dom).attr('src', data.getImageDataUrl());
				image3.width = image1.width;
				image3.height = image1.height;
				$('#right > .details').html('Mismatch: ' + data.misMatchPercentage + ' %');
				$('input[name="resemble-method"], input[name="resemble-color"]').each(function() {
					this.disabled = false;
				});

				displayRight(true);
			});

	} else {
		displayRight(false);
	}
}

// Toggle third block with this
function displayRight(b) {
	if (b === undefined) {
		b = true;
	}
	if (b) {
		// Activate third panel
		if ($('#right').is(':visible')) {
			reset3();
		} else {
			$('#left').css({
				left: '0',
				width: 'calc(100%/3 - 3px)',
			});
			$('#mid').css({
				left: 'calc(100%/3)',
				width: 'calc(100%/3 - 3px)',
			});
			$('#right').show();
			reset();
		}
	} else {
		// Deactivate third panel
		$('#left').css({
			left: '0',
			width: 'calc(50% - 3px)',
		});
		$('#mid').css({
			left: '50%',
			width: 'calc(50% - 3px)',
		});
		$('#right').hide();
		reset();
		image3.j = null;
		image3.dom = null;
	}
}

// Get resized dataURL and run onComplete(dataURL) when finished for an img element
function getDataUrl(img, w, h, onComplete, onError) {
	const MAX_WH = 1200; // Max width/height
	// If portrait
	if (h > w) {
		// Max height
		w = (w / h) * MAX_WH;
		h = MAX_WH;
	} else {
		// Max width
		h = (h / w) * MAX_WH;
		w = MAX_WH;
	}
	img.crossOrigin = 'anonymous';
	const context = document.createElement('canvas').getContext('2d');
	context.canvas.width = w;
	context.canvas.height = h;
	context.drawImage(img, 0, 0, w, h);
	let dataURL;
	try {
		dataURL = context.canvas.toDataURL();
		if (onComplete) {
			onComplete(dataURL);
		}
	} catch (err) {
		console.log(err);
		if (onError) {
			onError();
		}
	}
	return dataURL;
}

// Get filesize from source and run onComplete(filesize), when done
function getFilesize(src, onComplete) {
	const xhr = new XMLHttpRequest();
	let filesize;
	xhr.open('HEAD', src, true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4) {
			if ((xhr.status === 200) || (xhr.status === 304)) {
				filesize = xhr.getResponseHeader('Content-Length');
				// If "Access-Control-Expose-Headers", "Content-Length" is given
				if (filesize !== null) {
					onComplete(filesize);
				} else {
					console.log('Error reading filesize: Access-Control-Expose-Headers:"Content-Length" is missing in response header.');
				}
			} else {
				console.log('Error reading filesize.');
			}
		}
	};
	xhr.send(null);
}

// Parse URL
function parseUrl(link) {

	if (link === undefined) {
		link = document.location.href;
	}

	const url = {};
	url.href = link;

	// Split link into link and hash part
	let n = link.indexOf('#');
	if (n > -1) {
		url.hash = link.slice(n + 1);
		url.hrefNoHash = link.slice(0, n);
		link = url.hrefNoHash;
	} else {
		url.hash = '';
		url.hrefNoHash = link;
	}

	// Split link into link and search part
	n = link.indexOf('?');
	if (n > -1) {
		url.search = link.slice(n + 1);
		url.hrefNoSearch = link.slice(0, n);
	} else {
		url.search = '';
		url.hrefNoSearch = link;
	}

	// Get all parts of the link
	// Regexp coarse: ((protocol://host:port)|file://)(path)(name.ext)
	const regexp = /^((([^\/.]+):\/\/)?(([^\/.]+\.)*[^\/.]+\.[^\/.:]+(:\d+)?)|(file):\/\/)(\/.+\/|\/)?([^\/]+)?$/;
	const tokens = regexp.exec(url.hrefNoSearch);
	// url.regexp = regexp; // Save to check
	// url.tokens = tokens;
	/* Tokens:
	 * 0: match
	 * 1: link without /path/name.ext, if file, then file://
	 * 2: https:// or ftp:// or undefined if not given
	 * 3: http, https or ftp, if 2 http or https,e else undefined
	 * 4: hostname + subdomain if 2 http, https or undefined
	 * 5: undefined
	 * 6: port
	 * 7: file, if 2 file://
	 * 8: /path/
	 * 9: name.ext
	 */
	if (tokens) {
		// If not a file, then get hostname
		if (tokens[1] !== 'file://') {
			url.protocol = tokens[3];
			url.hostname = tokens[4];
			url.port = (tokens[6]) ? tokens[6].slice(1) : undefined;
			url.host = (url.port) ? url.hostname + ':' + url.port : url.hostname;
			url.path = tokens[8];
		} else {
			url.protocol = 'file';
			url.hostname = 'localhost';
			url.path = tokens[8].slice(1);
		}
		url.file = tokens[9];
		url.pathname = (url.file) ? url.path + url.file : url.path;
	}

	// Parse filename
	if (url.file) {
		n = url.file.lastIndexOf('.');
		if (n > -1) {
			url.name = url.file.slice(0, n);
			url.ext = url.file.slice(n + 1);
		} else {
			url.name = url.file;
			url.ext = '';
		}
	}

	// Parse arguments
	url.args = {};
	if (url.search !== '') {
		const array = url.search.split('&');
		for (let i = 0; i < array.length; i++) {
			n = array[i].indexOf('=');
			if (n > -1) {
				url.args[decodeURIComponent(array[i].slice(0, n))] =
					decodeURIComponent(array[i].slice(n + 1));
			} else {
				url.args[decodeURIComponent(array[i])] = undefined;
			}
		}
	}

	return url;
}

function readPNGMetadataFromDataUrl(dataUrl) {

	const metadata = {};
	metadata.details = {};
	metadata.text = {};
	metadata.details.data_size = 0;

	// Convert dataUrl to a binary array
	dataUrl = dataUrl.slice('data:image/png;base64,'.length);
	const binary = atob(dataUrl);
	const len = binary.length;

	// Chunk header info
	let n_chunkLength;
	let s_chunkType;
	let n_chunkCRC;

	// For all bytes (skip first 8 which are PNG signature)
	for (let i = 8; i < len; i++) {

		// Chunk header and trailer
		n_chunkLength = binaryToInt(i, 4);
		s_chunkType = binaryToChunkname(i + 4, 4);
		n_chunkCRC = binaryToInt(i + n_chunkLength + 8, 4);
		if (s_chunkType !== 'IDAT') {
			console.log(n_chunkLength, s_chunkType, n_chunkCRC);
		}

		// Jump to chunk data
		i += 8;

		// Handle chunk data
		switch (s_chunkType) {
			// Handle PNG header
			case 'IHDR':
				metadata.details.width = binaryToInt(i, 4);
				metadata.details.height = binaryToInt(i + 4, 4);
				metadata.details.bitdepth = binaryToInt(i + 8, 1);
				metadata.details.color_type = binaryToInt(i + 9, 1);
				metadata.details.compression_method = binaryToInt(i + 10, 1);
				metadata.details.filter_method = binaryToInt(i + 11, 1);
				metadata.details.interlace_method = binaryToInt(i + 12, 1);

				// Make the IHDR humanly readable
				metadata.details.bitdepth += ' bits/sample';
				switch (metadata.details.color_type) {
					case 0:
						metadata.details.color_type = 'none';
						break;
					case 2:
						metadata.details.color_type = 'color';
						break;
					case 3:
						metadata.details.color_type = 'color/palette';
						break;
					case 4:
						metadata.details.color_type = 'alpha';
						break;
					case 6:
						metadata.details.color_type = 'color/alpha';
						break;
				}
				switch (metadata.details.interlace_method) {
					case 0:
						metadata.details.interlace_method = 'no interlace';
						break;
					case 1:
						metadata.details.interlace_method = 'Adam7 interlace';
						break;
				}
				break;
			case 'PLTE':
				metadata.text.chunk_PLTE = n_chunkLength + ' byte';
				break;

			// Handle data
			case 'IDAT':
				metadata.details.data_size += n_chunkLength;
				break;

			// Handle text information
			case 'tEXt': {
				const array_text = binaryToString(i, n_chunkLength).split('\0');
				metadata.text[array_text[0]] = array_text[1];
				break;
			}
			case 'zTXt': {
				const array_text = binaryToString(i, n_chunkLength).split('\0');
				metadata.text[array_text[0]] = 'compressed ' + n_chunkLength + ' byte text';
				break;
			}
			case 'iTXt': {
				const array_text = binaryToString(i, n_chunkLength).split('\0');
				metadata.text[array_text[0]] = 'icompressed ' + n_chunkLength + ' byte text';
				break;
			}

			// Handle miscellaneous information

			case 'cHRM':
				metadata.text.chunk_cHRM = n_chunkLength + ' byte';
				break;
			case 'gAMA':
				metadata.text.chunk_gAMA = n_chunkLength + ' byte';
				break;
			case 'iCCP':
				metadata.text.chunk_iCCP = n_chunkLength + ' byte';
				break;
			case 'sBIT':
				metadata.text.chunk_sBIT = n_chunkLength + ' byte';
				break;
			case 'sRGB':
				metadata.text.chunk_sRGB = n_chunkLength + ' byte';
				break;
			case 'bKGD':
				metadata.text.chunk_bKGD = n_chunkLength + ' byte';
				break;
			case 'hIST':
				metadata.text.chunk_hIST = n_chunkLength + ' byte';
				break;
			case 'tRNS':
				metadata.text.chunk_tRNS = n_chunkLength + ' byte';
				break;
			// Handle physical pixel dimension
			case 'pHYs':
				metadata.text.pixels_per_unit_X = binaryToInt(i, 4);
				metadata.text.pixels_per_unit_Y = binaryToInt(i + 4, 4);
				metadata.text.unit = binaryToInt(i + 5, 1);
				switch (metadata.text.unit) {
					case 0:
						metadata.text.unit = 'unknown';
						break;
					case 0:
						metadata.text.unit = 'meter';
						break;
				}
				break;
			case 'sPLT':
				metadata.text.chunk_sPLT = n_chunkLength + ' byte';
				break;
			case 'tIME':
				metadata.text.chunk_tIME = n_chunkLength + ' byte';
				break;
		}

		// Jump to next chunk
		i += n_chunkLength + 4 - 1;
	}

	metadata.details.data_size += ' byte';

	return metadata;

	function binaryToInt(i, len) {
		let n_0 = 0;
		if (i !== undefined) {
			n_0 = i;
		}
		if (len === undefined) {
			len = 4;
		}
		const n_e = n_0 + len;
		let value = 0;
		for (let i = n_e - 1; i >= n_0; i--) {
			// console.log(i, value, binary.charCodeAt(i), n_e - i -1);
			value += binary.charCodeAt(i)*Math.pow(256, n_e - i -1);
		}

		return value;
	}

	function binaryToChunkname(i) {
		return binary[i] + binary[i+1] + binary[i+2] + binary[i+3];
	}

	function binaryToString(i, len) {
		if (len === undefined) {
			len = 4;
		}
		len += i;
		console.log(i, len);
		let s_value = '';
		for (let j = i; j < len; j++) {
			s_value += binary[j];
			// console.log(j, s_value, binary[j]);
		}
		return s_value;
	}
}

function object2html(obj) {
	let s = '';
	for (const key in obj) {
		s += key + ': ' + obj[key] + '<br>';
	}
	if (s !== '') {
		s = s.slice(0, -'<br>'.length);
	}
	return s;
}

//})();
