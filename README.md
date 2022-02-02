# Image Comparison Tool for your Browser

[Use it here!](https://sanchan-gh.github.io/Image-Comparison-in-Browser/index.html)

Just drag and drop image or video files to compare. Files need to be smaller than 100 MB.

# Advanced Use

You can drag and drop images directly from your browser as well, but it is not always possible to read exif and pixel data, because not all domains allow CORS.
This can be worked around by downloading this tool and using it locally.
You can do so by clicking "Code", "Download ZIP", extracting it and opening the index.html.

It is also possible to use arguments in the link to directly load a URL after the page is loaded. For example https://sanchan-gh.github.io/Image-Comparison-in-Browser/index.html?sid1=5981914 will load an image with the post id 5981914 from chan.sankakucomplex.com. Following arguments can be used:

* url1: Url to load for the left panel. Use encodeURIComponent, when setting this parameter.
* url2: Url to load for the right panel. Use encodeURIComponent, when setting this parameter.
* sid1: Post id from chan.sankakucomplex.com for the left panel.
* sid2: Post id from chan.sankakucomplex.com for the right panel.

You can use an offline version by saving the page on your desktop before loading any images.

# Userscript

[This userscript](https://sanchan-gh.github.io/Image-Comparison-in-Browser/Sankakucomplex_Compare_Images_Github.user.js) adds links on the post/show/ page and the post/delete/ page on chan.sankakucomplex.com from where you can easily compare child and parent posts.

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
