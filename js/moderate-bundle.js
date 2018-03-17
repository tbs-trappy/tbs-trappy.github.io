/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var _debounce = __webpack_require__(18);
	
	var _debounce2 = _interopRequireDefault(_debounce);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	__webpack_require__(142)(window);
	
	// Import shared objects from parent
	/**
	 * Copyright 2018-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the license found in the
	 * LICENSE file in the root directory of this source tree.
	 */
	
	window.shared = window.opener.shared;
	
	// Set the teleprompter preview to the exact scale and aspect ratio as the actual
	// teleprompter, so as to display its layout identically.
	function onParentWindowResize(e) {
	  var scale = parseInt(window.getComputedStyle(document.querySelector('.preview')).height) / window.opener.innerHeight;
	  var previewIframeEl = document.querySelector('.preview iframe');
	  previewIframeEl.style.width = window.opener.innerWidth + 'px';
	  previewIframeEl.style.height = window.opener.innerHeight + 'px';
	  previewIframeEl.style.transform = 'scale(' + scale.toString() + ')';
	  document.querySelector('.preview').style.width = window.opener.innerWidth * scale + 'px';
	}
	
	document.addEventListener('DOMContentLoaded', function () {
	  window.opener.addEventListener('resize', (0, _debounce2.default)(onParentWindowResize, 100));
	  onParentWindowResize();
	
	  document.querySelector('[data-action="refreshTeleprompters"]').addEventListener('click', window.shared.pubsub.emit.bind(window.shared.pubsub, 'teleprompterRefresh'));
	
	  document.querySelector('[data-content="comments"] table').addEventListener('click', function (e) {
	    switch (true) {
	      case e.target.matches('[data-action="prioritize"]'):
	        window.shared.comments({
	          id: e.target.closest('[data-comment-id]').dataset.commentId
	        }).update(function () {
	          this.priority++;
	          return this;
	        });
	        break;
	
	      case e.target.matches('[data-action="delete"]'):
	        window.shared.comments({
	          id: e.target.closest('[data-comment-id]').dataset.commentId
	        }).update({
	          deleted: true
	        });
	        break;
	    }
	  });
	
	  document.querySelector('form[name="newComment"]').addEventListener('submit', function (e) {
	    e.preventDefault();
	    window.shared.comments.insert({
	      id: 'ZZZZZ' + (new Date() - 0),
	      created: new Date(),
	      name: e.target.elements.name.value,
	      message: e.target.elements.message.value,
	      priority: parseInt(e.target.elements.submit.dataset.priority),
	      deleted: false
	    });
	    e.target.elements.name.value = '';
	    e.target.elements.message.value = '';
	    e.target.elements.name.focus();
	  });
	
	  document.querySelector('[data-action="toggleAutoRefresh"]').addEventListener('click', function (e) {
	    window.shared.config.autoRefresh = !window.shared.config.autoRefresh;
	    window.shared.pubsub.emit('teleprompterRefresh');
	  });
	});
	
	var refresh = (0, _debounce2.default)(function () {
	  // Post Title
	  var postTitleEl = document.querySelector('[data-content="postTitle"]');
	  if (!window.shared.post) {
	    postTitleEl.textContent = '';
	    return;
	  }
	  postTitleEl.textContent = window.shared.post.title;
	
	  // Auto-Refresh Controls
	  document.querySelector('[data-action="toggleAutoRefresh"]').classList[window.shared.config.autoRefresh ? 'add' : 'remove']('active');
	
	  // Comments
	  var tableBodyEl = document.querySelector('[data-content="comments"] table tbody');
	  while (tableBodyEl.firstChild) {
	    tableBodyEl.removeChild(tableBodyEl.firstChild);
	  }
	  window.shared.comments({
	    deleted: false
	  }).order('priority desc, created desc').each(function (comment) {
	    var commentFrag = document.querySelector('template#commentRow').cloneNode(true);
	    commentFrag.content.querySelector('[data-column="name"]').textContent = comment.name || '';
	    commentFrag.content.querySelector('[data-column="message"]').textContent = comment.message || '';
	    if (comment.priority) {
	      commentFrag.content.querySelector('[data-action="prioritize"]').className += ' active';
	    }
	    commentFrag.content.querySelector('tr').dataset.commentId = comment.id;
	    tableBodyEl.appendChild(document.importNode(commentFrag.content, true));
	  });
	}, 200);
	
	// When pretty much anything happens, refresh (common-debounced) the moderator view
	window.shared.pubsub.on('teleprompterRefresh', refresh);
	window.shared.pubsub.on('commentsUpdate', refresh);
	window.shared.pubsub.on('postUpdate', refresh);

/***/ }),

/***/ 18:
/***/ (function(module, exports) {

	/**
	 * Returns a function, that, as long as it continues to be invoked, will not
	 * be triggered. The function will be called after it stops being called for
	 * N milliseconds. If `immediate` is passed, trigger the function on the
	 * leading edge, instead of the trailing. The function also has a property 'clear' 
	 * that is a function which will clear the timer to prevent previously scheduled executions. 
	 *
	 * @source underscore.js
	 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
	 * @param {Function} function to wrap
	 * @param {Number} timeout in ms (`100`)
	 * @param {Boolean} whether to execute at the beginning (`false`)
	 * @api public
	 */
	
	module.exports = function debounce(func, wait, immediate){
	  var timeout, args, context, timestamp, result;
	  if (null == wait) wait = 100;
	
	  function later() {
	    var last = Date.now() - timestamp;
	
	    if (last < wait && last >= 0) {
	      timeout = setTimeout(later, wait - last);
	    } else {
	      timeout = null;
	      if (!immediate) {
	        result = func.apply(context, args);
	        context = args = null;
	      }
	    }
	  };
	
	  var debounced = function(){
	    context = this;
	    args = arguments;
	    timestamp = Date.now();
	    var callNow = immediate && !timeout;
	    if (!timeout) timeout = setTimeout(later, wait);
	    if (callNow) {
	      result = func.apply(context, args);
	      context = args = null;
	    }
	
	    return result;
	  };
	
	  debounced.clear = function() {
	    if (timeout) {
	      clearTimeout(timeout);
	      timeout = null;
	    }
	  };
	  
	  debounced.flush = function() {
	    if (timeout) {
	      result = func.apply(context, args);
	      context = args = null;
	      
	      clearTimeout(timeout);
	      timeout = null;
	    }
	  };
	
	  return debounced;
	};


/***/ }),

/***/ 142:
/***/ (function(module, exports) {

	'use strict';
	
	/**
	 * Copyright 2018-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the license found in the
	 * LICENSE file in the root directory of this source tree.
	 */
	
	module.exports = function (window) {
	  window.addEventListener('DOMContentLoaded', function () {
	    // Bluetooth Clickers (like for cameras, CamKix, Selfie Button, etc.)
	    window.addEventListener('keydown', function (e) {
	      if (e.key === 'AudioVolumeUp') {
	        window.shared.pubsub.emit('teleprompterRefresh');
	        e.preventDefault();
	      }
	    });
	
	    // Teleprompter View Modifiers
	    document.querySelector('[data-action="zoomUp"]').addEventListener('click', function (e) {
	      window.shared.config.zoom += 0.1;
	      window.shared.pubsub.emit('configUpdate');
	    });
	    document.querySelector('[data-action="zoomDown"]').addEventListener('click', function (e) {
	      window.shared.config.zoom -= 0.1;
	      window.shared.pubsub.emit('configUpdate');
	    });
	
	    document.querySelector('[data-action="flipHorizontal"]').addEventListener('click', function (e) {
	      window.shared.config.flipHorizontal = !window.shared.config.flipHorizontal;
	      window.shared.pubsub.emit('configUpdate');
	    });
	    document.querySelector('[data-action="flipVertical"]').addEventListener('click', function (e) {
	      window.shared.config.flipVertical = !window.shared.config.flipVertical;
	      window.shared.pubsub.emit('configUpdate');
	    });
	  });
	};

/***/ })

/******/ });
//# sourceMappingURL=moderate-bundle.js.map