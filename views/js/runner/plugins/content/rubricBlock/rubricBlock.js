define(['jquery', 'ui/hider', 'taoTests/runner/plugin', 'handlebars'], function ($$1, hider, pluginFactory, Handlebars) { 'use strict';

    $$1 = $$1 && Object.prototype.hasOwnProperty.call($$1, 'default') ? $$1['default'] : $$1;
    hider = hider && Object.prototype.hasOwnProperty.call(hider, 'default') ? hider['default'] : hider;
    pluginFactory = pluginFactory && Object.prototype.hasOwnProperty.call(pluginFactory, 'default') ? pluginFactory['default'] : pluginFactory;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;

    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers);  


      return "<div id=\"qti-rubrics\"></div>\n";
      });
    function containerTpl(data, options, asString) {
      var html = Template(data, options);
      return (asString || true) ? html : $(html);
    }

    /**
     * This program is free software; you can redistribute it and/or
     * modify it under the terms of the GNU General Public License
     * as published by the Free Software Foundation; under version 2
     * of the License (non-upgradable).
     *
     * This program is distributed in the hope that it will be useful,
     * but WITHOUT ANY WARRANTY; without even the implied warranty of
     * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     * GNU General Public License for more details.
     *
     * You should have received a copy of the GNU General Public License
     * along with this program; if not, write to the Free Software
     * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
     *
     * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
     */
    /**
     * Ensure the <a> links opens to blank pages
     * @param {jQueryElement} $container - lookup scope
     */

    var blankifyLinks = function blankifyLinks($container) {
      $$1('a', $container).attr('target', '_blank');
    };
    /**
     * Apply mathjax
     */


    var mathify = function mathify($container) {
      return new Promise(function (resolve) {
        if ($$1('math', $container).length > 0) {
          //load mathjax only if necessary
          require(['mathJax'], function (MathJax) {
            if (MathJax) {
              MathJax.Hub.Queue(['Typeset', MathJax.Hub], $container[0]);
              MathJax.Hub.Queue(resolve);
            } else {
              resolve();
            }
          }, resolve);
        } else {
          resolve();
        }
      });
    };
    /**
     * Returns the configured plugin
     */


    var rubricBlock = pluginFactory({
      name: 'rubricBlock',

      /**
       * Initialize the plugin (called during runner's init)
       */
      init: function init() {
        var self = this;
        var testRunner = this.getTestRunner();
        this.$element = $$1(containerTpl());
        this.hide(); //change plugin state

        testRunner.on('ready', function () {
          self.hide();
        }).on('loaditem', function () {
          var context = testRunner.getTestContext();

          if (context.rubrics) {
            self.$element.html(context.rubrics);
            blankifyLinks(self.$element);
            mathify(self.$element).then(function () {
              // notify that the rubric blocks are loaded
              testRunner.trigger('rubricblock');
            });
          }
        }).on('renderitem', function () {
          self.show();
        }).on('unloaditem', function () {
          self.hide();
          self.$element.empty();
        });
      },

      /**
       * Called during the runner's render phase
       */
      render: function render() {
        //attach the element before the content area
        var $container = this.getAreaBroker().getContentArea();
        $container.before(this.$element);
      },

      /**
       * Called during the runner's destroy phase
       */
      destroy: function destroy() {
        this.$element.remove();
      },

      /**
       * Enable the container
       */
      enable: function enable() {
        this.$element.removeProp('disabled').removeClass('disabled');
      },

      /**
       * Disable the container
       */
      disable: function disable() {
        this.$element.prop('disabled', true).addClass('disabled');
      },

      /**
       * Show the container
       */
      show: function show() {
        hider.show(this.$element);
      },

      /**
       * Hide the container
       */
      hide: function hide() {
        hider.hide(this.$element);
      }
    });

    return rubricBlock;

});
