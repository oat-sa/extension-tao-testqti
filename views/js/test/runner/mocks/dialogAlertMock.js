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
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'lodash',
    'core/eventifier'
], function (_, eventifier) {
    'use strict';

    function dialogAlert(message, action) {
        var dlg = eventifier({
            hide: function() {
                this.trigger('closed.modal');
            },
            focus : _.noop
        });

        if (_.isFunction(action)) {
            dlg.on('closed.modal', function() {
                if (_.isFunction(action)) {
                    action.call(this);
                }
                dialogAlert.trigger('accept', dlg);
                dialogAlert.trigger('close', dlg);
            });
        }

        dialogAlert.trigger('create', message, dlg);

        return dlg;
    }

    dialogAlert.hit = function hit(dlg, button) {
        dlg.trigger((button || 'ok') + 'btn.modal');
        _.defer(function() {
            dlg.hide();
        });
    };

    return eventifier(dialogAlert);
});
