define([
    'ui/modal',
    'tpl!taoQtiTest/runner/helpers/tpl/offlineSyncModal'
], function(
    modal,
    offlineSyncModalTpl,
) {
    'use strict';

    var $body,
        $dialog;

    var init = function init() {
        $body = $(document.body);
        $dialog = $(offlineSyncModalTpl());

        modal($body);

        $body.append($dialog);

        $dialog.modal({
            width: 500,
            animate: false,
            // disableClosing: true,
            // startClosed: true,
        });
    };

    var render = function render() {
        $dialog.modal('open');
    };

    return {
        init: init,
        render: render,
    }
});
