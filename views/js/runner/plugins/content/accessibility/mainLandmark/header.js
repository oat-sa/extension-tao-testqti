define(['jquery', 'i18n', 'taoTests/runner/plugin', 'handlebars'], function ($$1, __, pluginFactory, Handlebars) { 'use strict';

  $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
  __ = __ && Object.prototype.hasOwnProperty.call(__, 'default') ? __['default'] : __;
  pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
  Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }

    return target;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Handlebars.helpers);  


    return "<span data-control=\"qti-test-item-title\"></span>\n<span data-control=\"qti-test-item-state\"></span>\n";
    });
  function headerTpl(data, options, asString) {
    var html = Template(data, options);
    return (asString || true) ? html : $(html);
  }

  function getState(item) {
    var state = __('Unseen');

    if (item.flagged) {
      state = __('Flagged');
    } else if (item.answered) {
      state = __('Answered');
    } else if (item.viewed) {
      state = __('Viewed');
    }

    return state;
  }

  var header = pluginFactory({
    name: 'mainLandmark',
    init: function init() {
      var _this = this;

      var testRunner = this.getTestRunner();

      var updateTitle = function updateTitle(item) {
        _this.$title.text("".concat(item.label)).show();
      };

      var updateState = function updateState(item) {
        _this.$state.text("".concat(getState(item))).show();
      };

      testRunner.after('renderitem', function () {
        var item = testRunner.getCurrentItem();
        updateTitle(item);
        updateState(item);
      }).on('tool-flagitem', function () {
        var item = testRunner.getCurrentItem();
        item = _objectSpread2(_objectSpread2({}, item), {}, {
          flagged: !item.flagged
        });
        updateState(item);
      });
    },
    render: function render() {
      var $container = this.getAreaBroker().getArea('mainLandmark');
      this.$element = $$1(headerTpl());
      $container.append(this.$element);
      this.$title = $container.find("[data-control=\"qti-test-item-title\"]");
      this.$state = $container.find("[data-control=\"qti-test-item-state\"]");
    }
  });

  return header;

});
