define(['jquery', 'i18n', 'handlebars', 'ui/component', 'interact', 'ui/component/stackable', 'ui/component/placeable', 'ui/feedback', 'nouislider'], function ($$1, __, Handlebars, component, interact, makeStackable, makePlaceable, feedback, nouislider) { 'use strict';

  $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
  __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
  Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;
  component = component && Object.prototype.hasOwnProperty.call(component, 'default') ? component['default'] : component;
  interact = interact && Object.prototype.hasOwnProperty.call(interact, 'default') ? interact['default'] : interact;
  makeStackable = makeStackable && Object.prototype.hasOwnProperty.call(makeStackable, 'default') ? makeStackable['default'] : makeStackable;
  makePlaceable = makePlaceable && Object.prototype.hasOwnProperty.call(makePlaceable, 'default') ? makePlaceable['default'] : makePlaceable;
  feedback = feedback && Object.prototype.hasOwnProperty.call(feedback, 'default') ? feedback['default'] : feedback;

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
    var buffer = "", helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


    buffer += "<div class=\"tts-container\">\n    <div class=\"tts-controls\">\n        <div class=\"tts-control-container\">\n            <a class=\"tts-control tts-control-close\" title=\""
      + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Close", options) : helperMissing.call(depth0, "__", "Close", options)))
      + "\">\n                <span class=\"icon-result-nok tts-icon\"></span>\n            </a>\n        </div>\n        <div class=\"tts-control-container\">\n            <a class=\"tts-control tts-control-drag\" title=\""
      + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Move", options) : helperMissing.call(depth0, "__", "Move", options)))
      + "\">\n                <span class=\"icon-grip tts-icon\"></span>\n                <span class=\"tts-control-label\">\n                    "
      + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Text to Speech", options) : helperMissing.call(depth0, "__", "Text to Speech", options)))
      + "\n                </span>\n            </a>\n        </div>\n        <div class=\"tts-control-container\">\n            <a class=\"tts-control tts-control-playback\" title=\""
      + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Toggle playback", options) : helperMissing.call(depth0, "__", "Toggle playback", options)))
      + "\">\n                <span class=\"icon-play tts-icon\"></span>\n                <span class=\"icon-pause tts-icon\"></span>\n            </a>\n        </div>\n        <div class=\"tts-control-container\">\n            <a class=\"tts-control tts-control-mode\" title=\""
      + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Toggle start from here mode", options) : helperMissing.call(depth0, "__", "Toggle start from here mode", options)))
      + "\">\n                <span class=\"icon-play-from-here tts-icon\"></span>\n            </a>\n        </div>\n        <div class=\"tts-control-container\">\n            <a class=\"tts-control tts-control-settings\" title=\""
      + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Settings", options) : helperMissing.call(depth0, "__", "Settings", options)))
      + "\">\n                <span class=\"icon-property-advanced tts-icon\"></span>\n            </a>\n            <div class=\"tts-slider-container\">\n                "
      + escapeExpression((helper = helpers.__ || (depth0 && depth0.__),options={hash:{},data:data},helper ? helper.call(depth0, "Speed", options) : helperMissing.call(depth0, "__", "Speed", options)))
      + "<div class=\"tts-slider\"></div>\n            </div>\n        </div>\n    </div>\n</div>\n";
    return buffer;
    });
  function ttsTemplate(data, options, asString) {
    var html = Template(data, options);
    return (asString || true) ? html : $(html);
  }

  var defaultConfig = {
    activeElementClass: 'tts-active-content-node',
    elementClass: 'tts-content-node',
    left: -10,
    maxPlaybackRate: 2,
    minPlaybackRate: 0.5,
    playbackRate: 1,
    top: 50
  };
  var stackingOptions = {
    stackingScope: 'test-runner'
  };
  /**
   * Creates an instance of Text to Speech component
   *
   * @param {Element} container
   * @param {Object} config - component configurations
   * @param {String} config.activeElementClass - class applied to active content element. Default value 'tts-active-content-node'
   * @param {String} config.elementClass - class applied to content element. Default value 'tts-content-node'
   * @param {Number} config.left - initial left position of component. Default value 50
   * @param {Number} config.maxPlaybackRate - max playback rate. Default value 2
   * @param {Number} config.minPlaybackRate - min playback rate. Default value 0.5
   * @param {Number} config.playbackRate - playback rate. Default value 1
   * @param {Number} config.top - initial top position of component. Default value 50
   * @returns {ttsComponent} the textToSpeech component (uninitialized)
   */

  function maskingComponentFactory(container, config) {
    var audio = new Audio();
    var currentPlayback = [];
    var currentItem;
    var mediaContentData = [];
    var playbackRate; // Browser does not support selection Api If getSelection is not defined

    var selection = window.getSelection && window.getSelection(); // component API

    var spec = {
      /**
       * Remove APIP element class and click handlers from APIP elements
       */
      clearAPIPElements: function clearAPIPElements() {
        var elementClass = this.config.elementClass;
        var $contentNodes = $$1(mediaContentData.map(function (_ref) {
          var selector = _ref.selector;
          return selector;
        }).join(', '), container);
        $contentNodes.removeClass(elementClass);
        $contentNodes.off('click', this.handleContentNodeClick);
      },

      /**
       * Update componet state and stop playback
       *
       * @fires close
       */
      close: function close() {
        this.setTTSStateOnContainer('playing', false);
        this.setTTSStateOnContainer('sfhMode', false);
        this.setState('settings', false);
        this.stop();
        this.trigger('close');
      },

      /**
       * Get current active APIP item
       *
       * @returns {Object} active APIP item
       */
      getCurrentItem: function getCurrentItem() {
        return currentItem;
      },

      /**
       * When component in start from here mode, switch to clicked content element
       *
       * @param {Object} e - event object
       */
      handleContentNodeClick: function handleContentNodeClick(e) {
        var $target = $$1(e.target); // Allow default behaviour for inputs

        if ($target.hasClass('icon-checkbox') || $target.hasClass('icon-radio') || $target.is('input')) {
          return;
        } // Prevent default behaviour for lables and links


        e.stopPropagation();
        e.preventDefault();

        if (!this.is('sfhMode')) {
          return;
        }

        var $currentTarget = $$1(e.currentTarget); // Find APIP item associated with clicked element

        var selectedItemIndex = mediaContentData.findIndex(function (_ref2) {
          var selector = _ref2.selector;
          return $currentTarget.is(selector);
        });
        currentPlayback = mediaContentData.slice(selectedItemIndex);
        this.stop();
        this.initNextItem();
        this.togglePlayback();
      },

      /**
       * Select APIP item for default mode
       */
      initDefaultModeItem: function initDefaultModeItem() {
        this.initItemWithTextSelection();

        if (!currentItem) {
          this.initDefaultModePlayback();
        }
      },

      /**
       * Check if there is some selected content inside APIP elelemts on the page
       */
      initItemWithTextSelection: function initItemWithTextSelection() {
        // Check if there is selected content
        if (this.is('sfhMode') || !selection || !selection.toString()) {
          return;
        } // Get APIP item by current selection


        var currentSelection = selection.getRangeAt(0);
        var commonAncestorContainer = currentSelection.commonAncestorContainer;
        var selectedItem = mediaContentData.find(function (_ref3) {
          var selector = _ref3.selector;
          var $item = $$1(selector, container);
          return $item.is(commonAncestorContainer) || $$1.contains($item[0], commonAncestorContainer);
        });

        if (selectedItem && selectedItem !== currentItem) {
          currentPlayback = [selectedItem];
          this.initNextItem();
        }
      },

      /**
       * Check if there is next APIP item to play and start playback if component in playing state.
       * If there is no APIP item to play stop playback
       *
       * @fires finish
       * @fires next
       */
      initNextItem: function initNextItem() {
        var activeElementClass = this.config.activeElementClass;
        currentItem && $$1(currentItem.selector, container).removeClass(activeElementClass);
        currentItem = currentPlayback.shift();

        if (currentItem) {
          var _currentItem = currentItem,
              selector = _currentItem.selector,
              url = _currentItem.url;
          $$1(selector, container).addClass(activeElementClass);
          audio.setAttribute('src', url);
          audio.load();
          audio.playbackRate = playbackRate;

          if (this.is('playing')) {
            audio.play();
          }

          this.trigger('next');
          return;
        }

        this.trigger('finish');
        this.stop();
      },

      /**
       * Init default mode playback
       */
      initDefaultModePlayback: function initDefaultModePlayback() {
        currentPlayback = _toConsumableArray(mediaContentData);
        this.initNextItem();
      },

      /**
       * Set APIP data. Apply handlers to APIP elements. Stop current playback
       *
       * @param {Array} data - APIP data items
       */
      setMediaContentData: function setMediaContentData(data) {
        this.clearAPIPElements();
        var elementClass = this.config.elementClass;
        mediaContentData = data;
        var $contentNodes = $$1(mediaContentData.map(function (_ref4) {
          var selector = _ref4.selector;
          return selector;
        }).join(', '), container);
        $contentNodes.addClass(elementClass);
        $contentNodes.on('click', this.handleContentNodeClick);
        this.stop();
      },

      /**
       * Set playback rate
       *
       * @param {Object} e - event object
       * @param {Number} value - playback rate
       */
      setPlaybackRate: function setPlaybackRate(e, value) {
        playbackRate = value;
        audio.playbackRate = value;
      },

      /**
       * Update component state. Toggle state class on page body
       *
       * @param {String} name
       * @param {Boolean} value
       */
      setTTSStateOnContainer: function setTTSStateOnContainer(name, value) {
        this.setState(name, value);
        $$1(container).toggleClass("tts-".concat(name), value);
      },

      /**
       * Pause playback and update component state. Set current item to null
       */
      stop: function stop() {
        var activeElementClass = this.config.activeElementClass;
        audio.pause();
        audio.currentTime = 0;
        currentItem && $$1(currentItem.selector, container).removeClass(activeElementClass);
        currentItem = null;
        this.setTTSStateOnContainer('playing', false);
      },

      /**
       * Toggle playback
       *
       * @param {Object} e - event object
       */
      togglePlayback: function togglePlayback(e) {
        e && e.preventDefault();
        var isPlaying = this.is('playing');
        this.initDefaultModeItem();

        if (!isPlaying && currentItem) {
          audio.play();
          this.setTTSStateOnContainer('playing', true);
        } else {
          audio.pause();
          this.setTTSStateOnContainer('playing', false);
        }
      },

      /**
       * Toggle start from here mode
       */
      toggleSFHMode: function toggleSFHMode() {
        var isSFHMode = this.is('sfhMode');
        this.setTTSStateOnContainer('sfhMode', !isSFHMode);
        this.stop();
      },

      /**
       * Toggle settings element
       */
      toggleSettings: function toggleSettings() {
        var isSettings = this.is('settings');
        this.setState('settings', !isSettings); // if settings was enabled make sure that component still inside the container

        if (!isSettings) {
          this.handleResize();
        }
      },

      /**
       * Handle browser resize
       */
      handleResize: function handleResize() {
        // offset from right
        var offsetFromRight = 10;

        var _this$getPosition = this.getPosition(),
            x = _this$getPosition.x,
            y = _this$getPosition.y;

        var maxXPosition = window.innerWidth - this.getElement().width() - offsetFromRight;
        this.moveTo(x > maxXPosition ? maxXPosition : x, y);
      }
    };
    var ttsComponent = component(spec, defaultConfig);
    makePlaceable(ttsComponent);
    makeStackable(ttsComponent, stackingOptions);
    ttsComponent.setTemplate(ttsTemplate).on('init', function () {
      if (container.hasClass('tts-component-container')) {
        throw new Error('Container already has assigned text to speech component');
      }

      container.addClass('tts-component-container');
      this.render(container);
    }).on('render', function () {
      var _this = this;

      var _this$getConfig = this.getConfig(),
          left = _this$getConfig.left,
          maxPlaybackRate = _this$getConfig.maxPlaybackRate,
          minPlaybackRate = _this$getConfig.minPlaybackRate,
          defaultPlaybackRate = _this$getConfig.playbackRate,
          top = _this$getConfig.top;

      if (left < 0) {
        left = window.innerWidth - this.getElement().width() + left;
      }

      var $element = this.getElement();
      var $closeElement = $$1('.tts-control-close', $element);
      var $dragElement = $$1('.tts-control-drag', $element);
      var $playbackElement = $$1('.tts-control-playback', $element);
      var $sfhModeElement = $$1('.tts-control-mode', $element);
      var $sliderElement = $$1('.tts-slider', $element);
      var $settingsElement = $$1('.tts-control-settings', $element);
      playbackRate = defaultPlaybackRate;
      $element.css('touch-action', 'none'); // make component dragable

      var interactElement = interact($element).draggable({
        autoScroll: true,
        manualStart: true,
        restrict: {
          restriction: container[0],
          elementRect: {
            left: 0,
            right: 1,
            top: 0,
            bottom: 1
          }
        },
        onmove: function onmove(event) {
          var xOffset = Math.round(event.dx),
              yOffset = Math.round(event.dy);

          _this.moveBy(xOffset, yOffset);
        }
      });
      interact($dragElement[0]).on('down', function (event) {
        var interaction = event.interaction;
        interaction.start({
          name: 'drag'
        }, interactElement, $element[0]);
      }); // initialise slider

      $sliderElement.noUiSlider({
        animate: true,
        connected: true,
        range: {
          min: minPlaybackRate,
          max: maxPlaybackRate
        },
        start: defaultPlaybackRate,
        step: 0.1
      }).on('change', this.setPlaybackRate); // handle controls

      $closeElement.on('click', this.close); // handle mousedown instead of click to prevent selection lose

      $playbackElement.on('mousedown touchstart', this.togglePlayback);
      $sfhModeElement.on('click', this.toggleSFHMode);
      $settingsElement.on('click', this.toggleSettings);
      audio.addEventListener('ended', this.initNextItem);
      audio.addEventListener('error', function () {
        feedback().error(__('Can not playback media file!'));

        _this.initNextItem();
      });
      window.addEventListener('resize', this.handleResize); // move to initial position

      this.moveTo(left, top);
    }).on('hide', function () {
      this.setTTSStateOnContainer('visible', false);
    }).on('show', function () {
      this.setTTSStateOnContainer('visible', true);
    }).on('destroy', function () {
      container.removeClass('tts-component-container');
      this.clearAPIPElements();
      this.stop();
      window.removeEventListener('resize', this.handleResize);
    });
    ttsComponent.init(config);
    return ttsComponent;
  }

  return maskingComponentFactory;

});
