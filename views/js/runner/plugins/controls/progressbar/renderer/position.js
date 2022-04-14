define(['lodash', 'ui/component', 'handlebars'], function (_, component, Handlebars) { 'use strict';

    _ = _ && Object.prototype.hasOwnProperty.call(_, 'default') ? _['default'] : _;
    component = component && Object.prototype.hasOwnProperty.call(component, 'default') ? component['default'] : component;
    Handlebars = Handlebars && Object.prototype.hasOwnProperty.call(Handlebars, 'default') ? Handlebars['default'] : Handlebars;

    var Template = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers);  


      return "<div class=\"progress-box\">\n    <div data-control=\"progress-bar\" class=\"qti-controls progressbar\">\n        <div class=\"progressbar-points\"></div>\n    </div>\n    <div data-control=\"progress-label\" class=\"qti-controls\"></div>\n</div>\n";
      });
    function positionTpl(data, options, asString) {
      var html = Template(data, options);
      return (asString || true) ? html : $(html);
    }

    var Template$1 = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
      var stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
      
      var buffer = "";
      buffer += "\n<span class=\"progressbar-point\" data-index=\""
        + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
        + "\"></span>\n";
      return buffer;
      }

      stack1 = helpers.each.call(depth0, depth0, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
      if(stack1 || stack1 === 0) { return stack1; }
      else { return ''; }
      });
    function pointTpl(data, options, asString) {
      var html = Template$1(data, options);
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
     * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
     */
    /**
     * Default config values
     * @type {Object}
     */

    var defaults = {
      showLabel: true
    };
    /**
     * Builds percentage indicator renderer
     * @param {Object} [config] - a config object
     * @param {Boolean} [config.showLabel=true] - show/hide the progress label
     * @param {Object} [progressData] - the initial dataset
     */

    function positionIndicatorRenderer(config, progressData) {
      var count = 0;
      var rendererApi = {
        /**
         * Update the progress bar according to the provided indicator data
         * @param {progressIndicator} data
         */
        update: function update(data) {
          progressData = data;

          if (this.is('rendered') && this.controls) {
            if (count !== progressData.total) {
              // the number of points have changed, regenerate the full bar
              count = progressData.total;
              this.controls.$bar.empty().append(pointTpl(_.range(count)));
            }

            this.controls.$label.text(progressData.label);
            this.controls.$bar // remove progression from all points
            .children().removeClass('reached current') // set progression to each reached point
            .slice(0, progressData.position).addClass('reached') // set current position
            .slice(-1).addClass('current');
          }
          /**
           * Executes extra tasks on update
           * @event positionIndicatorRenderer#update
           * @param {progressIndicator} data
           */


          this.trigger('update', data);
        }
      };
      return component(rendererApi, defaults).setTemplate(positionTpl).on('render', function () {
        // get access to the controls
        this.controls = {
          $label: this.getElement().find('[data-control="progress-label"]'),
          $bar: this.getElement().find('[data-control="progress-bar"] .progressbar-points')
        }; // apply option

        if (!this.config.showLabel) {
          this.controls.$label.hide();
        } // set the right progression according to init data


        if (progressData) {
          this.update(progressData);
        } // forward the hidden state if it has been set before render


        if (this.is('hidden')) {
          this.hide();
        }
      }).on('destroy', function () {
        this.controls = null;
      }).init(config);
    }

    return positionIndicatorRenderer;

});
