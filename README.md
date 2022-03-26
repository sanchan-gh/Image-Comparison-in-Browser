# Image Comparison Tool for your Browser

[Use it here!](https://sanchan-gh.github.io/Image-Comparison-in-Browser/index.html)

Just drag and drop image or video files to compare. Files need to be smaller than 100 MB.  
Files can be dragged and dropped from your browser as well!

# Workarounds for CORS

It is not always possible to read Exif and pixel data, because not all domains allow CORS.  
One workaround (that may not work with all browsers) is to download the tool and use it locally.  
You can do so by clicking "Code", "Download ZIP", extracting it and opening the index.html.

### For Sankaku Complex

Sankaku Complex normally doesn't allow CORS, but it does when no HTTP "referer" is being sent.  
You can use browser extension like:

 - [Referer Modifier](https://addons.mozilla.org/en-US/firefox/addon/referer-modifier/) (for Firefox, open source)
 - [Referer Manager](https://chrome.google.com/webstore/detail/referer-manager/fpfmkkljdiofokoikgglafnfmmffmmhc) (for Chrome, closed source)

and set the sankakucomplex.com domain to remove the referrer.

# Sankaku Complex Userscript

[This userscript](https://github.com/sanchan-gh/Image-Comparison-in-Browser/blob/main/Image%20Comparison%20Tool%20for%20Sankaku%20Complex.user.js) (press "Raw" to install) for Sankaku Complex (chan and idol)  adds a "Compare image with parent" button to the post page and embeds the Image Comparison Tool into the deletion page to easily compare child and parent posts.

You need a userscript manager like Tampermonkey, Greasemonkey or Violentmonkey to use it.

# Advanced Use

It is also possible to use arguments in the link to directly load a URL after the page is loaded. For example https://sanchan-gh.github.io/Image-Comparison-in-Browser/index.html?sid1=5981914 will load an image with the post id 5981914 from chan.sankakucomplex.com (note this won't use the user's credentials so not all posts can be viewed).

Following arguments can be used:

* `url1`: URL to load for the left panel. Use `encodeURIComponent`, when setting this parameter.
* `url2`: URL to load for the right panel. Use `encodeURIComponent`, when setting this parameter.
* `sid1`: Post id from chan.sankakucomplex.com for the left panel.
* `sid2`: Post id from chan.sankakucomplex.com for the right panel.

# Presettings for drag&drop support

Following parameters need to be allowed for sanchan-gh.github.io on the server side for full drag&drop support from a different browser window:

* "Access-Control-Allow-Origin" needs to be allowed in the http response header (for reading out exif/pixel data).
* "Access-Control-Expose-Headers" needs to have "Content-Length" in the http response header (for reading out filesize).
* "Referer" needs to be allowed in the http request header (for reading out image and filesize).

# Installation on a server

Create a new folder and copy index.html and the files folder in there.

# Credits

This program utilizes:

* [resemble.js](https://github.com/Huddle/Resemble.js)
* [exif.js](https://github.com/exif-js/exif-js)
* [jquery](https://github.com/jquery/jquery)
* [jquery-mousewheel](https://github.com/jquery/jquery-mousewheel)
