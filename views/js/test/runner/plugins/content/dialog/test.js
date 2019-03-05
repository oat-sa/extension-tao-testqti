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
define( [
    
    'lodash',
    'async',
    'helpers',
    'core/promise',
    'ui/dialog/alert',
    'ui/dialog/confirm',
    'taoTests/runner/runner',
    'taoQtiTest/test/runner/mocks/providerMock',
    'taoQtiTest/runner/plugins/content/dialog/dialog'
], function(
   
    _,
    async,
    helpers,
    Promise,
    dialogAlert,
    dialogConfirm,
    runnerFactory,
    providerMock,
    dialogFactory
) {
    'use strict';

    var providerName = 'mock';
    runnerFactory.registerProvider( providerName, providerMock() );

    QUnit.module( 'dialogFactory' );

    QUnit.test( 'module', function( assert ) {
        var runner = runnerFactory( providerName );

        assert.expect( 3 );

        assert.equal( typeof dialogFactory, 'function', 'The dialogFactory module exposes a function' );
        assert.equal( typeof dialogFactory( runner ), 'object', 'The dialogFactory factory produces an instance' );
        assert.notStrictEqual( dialogFactory( runner ), dialogFactory( runner ), 'The dialogFactory factory provides a different instance on each call' );
    } );

    var pluginApi = [
        { name: 'init', title: 'init' },
        { name: 'render', title: 'render' },
        { name: 'finish', title: 'finish' },
        { name: 'destroy', title: 'destroy' },
        { name: 'trigger', title: 'trigger' },
        { name: 'getTestRunner', title: 'getTestRunner' },
        { name: 'getAreaBroker', title: 'getAreaBroker' },
        { name: 'getConfig', title: 'getConfig' },
        { name: 'setConfig', title: 'setConfig' },
        { name: 'getState', title: 'getState' },
        { name: 'setState', title: 'setState' },
        { name: 'show', title: 'show' },
        { name: 'hide', title: 'hide' },
        { name: 'enable', title: 'enable' },
        { name: 'disable', title: 'disable' }
    ];

    QUnit
        .cases.init( pluginApi )
        .test( 'plugin API ', function( data, assert ) {
            var runner = runnerFactory( providerName );
            var timer = dialogFactory( runner );

            assert.expect( 1 );

            assert.equal(typeof timer[data.name], 'function', 'The dialogFactory instances expose a "' + data.name + '" function');
        });

    QUnit.test( 'dialog.init', function( assert ) {
        var ready = assert.async();
        var runner = runnerFactory( providerName );
        var dialog = dialogFactory( runner, runner.getAreaBroker() );

        assert.expect( 1 );

        dialog.init()
            .then( function() {
                assert.equal( dialog.getState( 'init' ), true, 'The plugin is initialized' );

                ready();
            } )
            .catch( function( err ) {
                console.log( err );
                assert.ok( false, 'The init method must not fail' );
                ready();
            } );
    } );

    QUnit.module( 'dialog alert', {
        beforeEach: function( assert ) {
            dialogAlert.removeAllListeners();
        },
        afterEach: function( assert ) {
            dialogAlert.removeAllListeners();
        }
    } );

    QUnit.test( 'simple alert', function( assert ) {
        var ready = assert.async();
        var runner = runnerFactory( providerName );
        var dialog = dialogFactory( runner, runner.getAreaBroker() );
        var expectedMessage = 'Hello';

        assert.expect( 5 );

        dialogAlert.on( 'create', function( message, dlg ) {
            assert.ok( true, 'A dialog has been created' );
            assert.equal( message, expectedMessage, 'The expected message has been displayed' );
            _.defer( function() {
                dlg.hide();
            } );
        } );

        dialogAlert.on( 'close', function() {
            assert.ok( true, 'The dialog has been closed' );
            ready();
        } );

        dialog.init()
            .then( function() {
                assert.equal( dialog.getState( 'init' ), true, 'The plugin is initialized' );

                runner.trigger( 'alert', expectedMessage, function() {
                    assert.ok( true, 'The message has been acknowledged' );
                } );
            } )
            .catch( function( err ) {
                console.log( err );
                assert.ok( false, 'The init method must not fail' );
                ready();
            } );
    } );

    QUnit.test( 'namespace alert', function( assert ) {
        var ready = assert.async();
        var runner = runnerFactory( providerName );
        var dialog = dialogFactory( runner, runner.getAreaBroker() );
        var expectedMessage = 'timeout!';

        assert.expect( 5 );

        dialogAlert.on( 'create', function( message, dlg ) {
            assert.ok( true, 'A dialog has been created' );
            assert.equal( message, expectedMessage, 'The expected message has been displayed' );
            _.defer( function() {
                dlg.hide();
            } );
        } );

        dialogAlert.on( 'close', function() {
            assert.ok( true, 'The dialog has been closed' );
            ready();
        } );

        dialog.init()
            .then( function() {
                assert.equal( dialog.getState( 'init' ), true, 'The plugin is initialized' );

                runner.trigger( 'alert.timeout', expectedMessage, function() {
                    assert.ok( true, 'The message has been acknowledged' );
                } );
            } )
            .catch( function( err ) {
                console.log( err );
                assert.ok( false, 'The init method must not fail' );
                ready();
            } );
    } );

    QUnit.module( 'dialog confirm', {
        beforeEach: function( assert ) {
            dialogConfirm.removeAllListeners();
        },
        afterEach: function( assert ) {
            dialogConfirm.removeAllListeners();
        }
    } );

    QUnit.test( 'simple confirm accepted', function( assert ) {
        var ready = assert.async();
        var runner = runnerFactory( providerName );
        var dialog = dialogFactory( runner, runner.getAreaBroker() );
        var expectedMessage = 'Hello?';

        assert.expect( 5 );

        dialogConfirm.on( 'create', function( message, dlg ) {
            assert.ok( true, 'A dialog has been created' );
            assert.equal( message, expectedMessage, 'The expected message has been displayed' );
            dialogConfirm.hit( dlg, 'ok' );
        } );

        dialogConfirm.on( 'close', function() {
            assert.ok( true, 'The dialog has been closed' );
            ready();
        } );

        dialog.init()
            .then( function() {
                assert.equal( dialog.getState( 'init' ), true, 'The plugin is initialized' );

                runner.trigger( 'confirm', expectedMessage, function() {
                    assert.ok( true, 'The message has been accepted' );
                }, function() {
                    assert.ok( false, 'The message should not be rejected' );
                } );
            } )
            .catch( function( err ) {
                console.log( err );
                assert.ok( false, 'The init method must not fail' );
                ready();
            } );
    } );

    QUnit.test( 'namespace confirm accepted', function( assert ) {
        var ready = assert.async();
        var runner = runnerFactory( providerName );
        var dialog = dialogFactory( runner, runner.getAreaBroker() );
        var expectedMessage = 'exit?';

        assert.expect( 5 );

        dialogConfirm.on( 'create', function( message, dlg ) {
            assert.ok( true, 'A dialog has been created' );
            assert.equal( message, expectedMessage, 'The expected message has been displayed' );
            dialogConfirm.hit( dlg, 'ok' );
        } );

        dialogConfirm.on( 'close', function() {
            assert.ok( true, 'The dialog has been closed' );
            ready();
        } );

        dialog.init()
            .then( function() {
                assert.equal( dialog.getState( 'init' ), true, 'The plugin is initialized' );

                runner.trigger( 'confirm.exit', expectedMessage, function() {
                    assert.ok( true, 'The message has been accepted' );
                }, function() {
                    assert.ok( false, 'The message should not be rejected' );
                } );
            } )
            .catch( function( err ) {
                console.log( err );
                assert.ok( false, 'The init method must not fail' );
                ready();
            } );
    } );

    QUnit.test( 'simple confirm rejected', function( assert ) {
        var ready = assert.async();
        var runner = runnerFactory( providerName );
        var dialog = dialogFactory( runner, runner.getAreaBroker() );
        var expectedMessage = 'Hello?';

        assert.expect( 5 );

        dialogConfirm.on( 'create', function( message, dlg ) {
            assert.ok( true, 'A dialog has been created' );
            assert.equal( message, expectedMessage, 'The expected message has been displayed' );
            _.defer( function() {
                dlg.hide();
            } );
        } );

        dialogConfirm.on( 'close', function() {
            assert.ok( true, 'The dialog has been closed' );
            ready();
        } );

        dialog.init()
            .then( function() {
                assert.equal( dialog.getState( 'init' ), true, 'The plugin is initialized' );

                runner.trigger( 'confirm', expectedMessage, function() {
                    assert.ok( false, 'The message should not be accepted' );
                }, function() {
                    assert.ok( true, 'The message has been rejected' );
                } );
            } )
            .catch( function( err ) {
                console.log( err );
                assert.ok( false, 'The init method must not fail' );
                ready();
            } );
    } );

    QUnit.test( 'namespace confirm rejected', function( assert ) {
        var ready = assert.async();
        var runner = runnerFactory( providerName );
        var dialog = dialogFactory( runner, runner.getAreaBroker() );
        var expectedMessage = 'exit?';

        assert.expect( 5 );

        dialogConfirm.on( 'create', function( message, dlg ) {
            assert.ok( true, 'A dialog has been created' );
            assert.equal( message, expectedMessage, 'The expected message has been displayed' );
            _.defer( function() {
                dlg.hide();
            } );
        } );

        dialogConfirm.on( 'close', function() {
            assert.ok( true, 'The dialog has been closed' );
            ready();
        } );

        dialog.init()
            .then( function() {
                assert.equal( dialog.getState( 'init' ), true, 'The plugin is initialized' );

                runner.trigger( 'confirm.exit', expectedMessage, function() {
                    assert.ok( false, 'The message should not be accepted' );
                }, function() {
                    assert.ok( true, 'The message has been rejected' );
                } );
            } )
            .catch( function( err ) {
                console.log( err );
                assert.ok( false, 'The init method must not fail' );
                ready();
            } );
    } );

    QUnit.module( 'close dialogs', {
        beforeEach: function( assert ) {
            dialogAlert.removeAllListeners();
            dialogConfirm.removeAllListeners();
        },
        afterEach: function( assert ) {
            dialogAlert.removeAllListeners();
            dialogConfirm.removeAllListeners();
        }
    } );

    QUnit.test( 'simple alert', function( assert ) {
        var ready = assert.async();
        var runner = runnerFactory( providerName );
        var dialog = dialogFactory( runner, runner.getAreaBroker() );
        var expectedMessage = 'Hello';

        assert.expect( 5 );

        dialogAlert.on( 'create', function( message ) {
            assert.ok( true, 'A dialog has been created' );
            assert.equal( message, expectedMessage, 'The expected message has been displayed' );

            _.defer( function() {
                runner.trigger( 'closedialog' );
            } );

        } );

        dialogAlert.on( 'close', function() {
            assert.ok( true, 'The dialog has been closed' );
            ready();
        } );

        dialog.init()
            .then( function() {
                assert.equal( dialog.getState( 'init' ), true, 'The plugin is initialized' );

                runner.trigger( 'alert', expectedMessage, function() {
                    assert.ok( true, 'The message has been acknowledged' );
                } );
            } )
            .catch( function( err ) {
                console.log( err );
                assert.ok( false, 'The init method must not fail' );
                ready();
            } );
    } );

    QUnit.test( 'simple confirm accept', function( assert ) {
        var ready = assert.async();
        var runner = runnerFactory( providerName );
        var dialog = dialogFactory( runner, runner.getAreaBroker() );
        var expectedMessage = 'Hello';

        assert.expect( 5 );

        dialogConfirm.on( 'create', function( message ) {
            assert.ok( true, 'A dialog has been created' );
            assert.equal( message, expectedMessage, 'The expected message has been displayed' );

            _.defer( function() {
                runner.trigger( 'closedialog', true );
            } );

        } );

        dialogConfirm.on( 'close', function() {
            assert.ok( true, 'The dialog has been closed' );
            ready();
        } );

        dialog.init()
            .then( function() {
                assert.equal( dialog.getState( 'init' ), true, 'The plugin is initialized' );

                runner.trigger( 'confirm', expectedMessage, function() {
                    assert.ok( true, 'The message has been accepted' );
                }, function() {
                    assert.ok( false, 'The message should not be rejected' );
                } );
            } )
            .catch( function( err ) {
                console.log( err );
                assert.ok( false, 'The init method must not fail' );
                ready();
            } );
    } );

    QUnit.test( 'simple confirm reject', function( assert ) {
        var ready = assert.async();
        var runner = runnerFactory( providerName );
        var dialog = dialogFactory( runner, runner.getAreaBroker() );
        var expectedMessage = 'Hello';

        assert.expect( 5 );

        dialogConfirm.on( 'create', function( message ) {
            assert.ok( true, 'A dialog has been created' );
            assert.equal( message, expectedMessage, 'The expected message has been displayed' );

            _.defer( function() {
                runner.trigger( 'closedialog' );
            } );

        } );

        dialogConfirm.on( 'close', function() {
            assert.ok( true, 'The dialog has been closed' );
            ready();
        } );

        dialog.init()
            .then( function() {
                assert.equal( dialog.getState( 'init' ), true, 'The plugin is initialized' );

                runner.trigger( 'confirm', expectedMessage, function() {
                    assert.ok( false, 'The message should not be accepted' );
                }, function() {
                    assert.ok( true, 'The message has been rejected' );
                } );
            } )
            .catch( function( err ) {
                console.log( err );
                assert.ok( false, 'The init method must not fail' );
                ready();
            } );
    } );

    QUnit.test( 'alert and confirm', function( assert ) {
        var ready1 = assert.async();
        var runner = runnerFactory( providerName );
        var dialog = dialogFactory( runner, runner.getAreaBroker() );
        var expectedAlertMessage = 'Hello';
        var expectedConfirmMessage = 'exit?';
        var stack = [];

        assert.expect( 9 );
        var ready = assert.async();

        stack.push( new Promise( function( resolve ) {
            dialogAlert.on( 'create', function( message ) {
                assert.ok( true, 'A alert dialog has been created' );
                assert.equal( message, expectedAlertMessage, 'The expected alert message has been displayed' );
                resolve();
            } );
        } ) );

        stack.push( new Promise( function( resolve ) {
            dialogConfirm.on( 'create', function( message ) {
                assert.ok( true, 'A confirm dialog has been created' );
                assert.equal( message, expectedConfirmMessage, 'The expected confirm message has been displayed' );
                resolve();
            } );
        } ) );

        Promise.all( stack ).then( function() {
            runner.trigger( 'closedialog' );
        } );

        dialogAlert.on( 'close', function() {
            assert.ok( true, 'The alert dialog has been closed' );
            ready();
        } );

        dialogConfirm.on( 'close', function() {
            assert.ok( true, 'The confirm dialog has been closed' );
            ready1();
        } );

        dialog.init()
            .then( function() {
                assert.equal( dialog.getState( 'init' ), true, 'The plugin is initialized' );

                runner.trigger( 'alert', expectedAlertMessage, function() {
                    assert.ok( true, 'The alert message has been acknowledged' );
                } );

                runner.trigger( 'confirm', expectedConfirmMessage, function() {
                    assert.ok( false, 'The confirm message should not be accepted' );
                }, function() {
                    assert.ok( true, 'The confirm message has been rejected' );
                } );
            } )
            .catch( function( err ) {
                console.log( err );
                assert.ok( false, 'The init method must not fail' );
                ready();
            } );
    } );

    QUnit.test( 'namespace alert', function( assert ) {
        var ready = assert.async();
        var runner = runnerFactory( providerName );
        var dialog = dialogFactory( runner, runner.getAreaBroker() );
        var expectedMessage = 'Hello';
        var count = 0;

        assert.expect( 7 );

        dialogAlert.on( 'create', function( message ) {
            assert.ok( true, 'A dialog has been created' );
            assert.equal( message, expectedMessage, 'The expected message has been displayed' );

            if ( ++count === 2 ) {
                _.defer( function() {
                    runner.trigger( 'closedialog.timeout' );
                } );
            }
        } );

        dialogAlert.on( 'close', function() {
            assert.ok( true, 'The dialog has been closed' );
            ready();
        } );

        dialog.init()
            .then( function() {
                assert.equal( dialog.getState( 'init' ), true, 'The plugin is initialized' );

                runner.trigger( 'alert', expectedMessage, function() {
                    assert.ok( false, 'The message without namespace should not be acknowledged' );
                } );

                runner.trigger( 'alert.timeout', expectedMessage, function() {
                    assert.ok( true, 'The message with namespace has been acknowledged' );
                } );
            } )
            .catch( function( err ) {
                console.log( err );
                assert.ok( false, 'The init method must not fail' );
                ready();
            } );
    } );

    QUnit.test( 'namespace confirm accept', function( assert ) {
        var ready = assert.async();
        var runner = runnerFactory( providerName );
        var dialog = dialogFactory( runner, runner.getAreaBroker() );
        var expectedMessage = 'exit?';
        var count = 0;

        assert.expect( 7 );

        dialogConfirm.on( 'create', function( message ) {
            assert.ok( true, 'A dialog has been created' );
            assert.equal( message, expectedMessage, 'The expected message has been displayed' );

            if ( ++count === 2 ) {
                _.defer( function() {
                    runner.trigger( 'closedialog.exit', true );
                } );
            }
        } );

        dialogConfirm.on( 'close', function() {
            assert.ok( true, 'The dialog has been closed' );
            ready();
        } );

        dialog.init()
            .then( function() {
                assert.equal( dialog.getState( 'init' ), true, 'The plugin is initialized' );

                runner.trigger( 'confirm', expectedMessage, function() {
                    assert.ok( false, 'The message without namespace should not be accepted' );
                }, function() {
                    assert.ok( false, 'The message without namespace should not be rejected' );
                } );

                runner.trigger( 'confirm.exit', expectedMessage, function() {
                    assert.ok( true, 'The message with namespace has been accepted' );
                }, function() {
                    assert.ok( false, 'The message with namespace should not be rejected' );
                } );
            } )
            .catch( function( err ) {
                console.log( err );
                assert.ok( false, 'The init method must not fail' );
                ready();
            } );
    } );

    QUnit.test( 'namespace confirm reject', function( assert ) {
        var ready = assert.async();
        var runner = runnerFactory( providerName );
        var dialog = dialogFactory( runner, runner.getAreaBroker() );
        var expectedMessage = 'exit?';
        var count = 0;

        assert.expect( 7 );

        dialogConfirm.on( 'create', function( message ) {
            assert.ok( true, 'A dialog has been created' );
            assert.equal( message, expectedMessage, 'The expected message has been displayed' );

            if ( ++count === 2 ) {
                _.defer( function() {
                    runner.trigger( 'closedialog.exit' );
                } );
            }
        } );

        dialogConfirm.on( 'close', function() {
            assert.ok( true, 'The dialog has been closed' );
            ready();
        } );

        dialog.init()
            .then( function() {
                assert.equal( dialog.getState( 'init' ), true, 'The plugin is initialized' );

                runner.trigger( 'confirm', expectedMessage, function() {
                    assert.ok( false, 'The message without namespace should not be accepted' );
                }, function() {
                    assert.ok( false, 'The message without namespace should not be rejected' );
                } );

                runner.trigger( 'confirm.exit', expectedMessage, function() {
                    assert.ok( false, 'The message with namespace should not be accepted' );
                }, function() {
                    assert.ok( true, 'The message with namespace has been rejected' );
                } );
            } )
            .catch( function( err ) {
                console.log( err );
                assert.ok( false, 'The init method must not fail' );
                ready();
            } );
    } );

    QUnit.test( 'same namespace alert and confirm', function( assert ) {
        var ready1 = assert.async();
        var runner = runnerFactory( providerName );
        var dialog = dialogFactory( runner, runner.getAreaBroker() );
        var expectedAlertMessage = 'Hello';
        var expectedConfirmMessage = 'exit?';
        var stack = [];
        var countAlert = 0;
        var countConfirm = 0;

        assert.expect( 13 );
        var ready = assert.async();

        stack.push( new Promise( function( resolve ) {
            dialogAlert.on( 'create', function( message ) {
                assert.ok( true, 'A alert dialog has been created' );
                assert.equal( message, expectedAlertMessage, 'The expected alert message has been displayed' );

                if ( ++countAlert === 2 ) {
                    resolve();
                }
            } );
        } ) );

        stack.push( new Promise( function( resolve ) {
            dialogConfirm.on( 'create', function( message ) {
                assert.ok( true, 'A confirm dialog has been created' );
                assert.equal( message, expectedConfirmMessage, 'The expected confirm message has been displayed' );

                if ( ++countConfirm === 2 ) {
                    resolve();
                }
            } );
        } ) );

        Promise.all( stack ).then( function() {
            runner.trigger( 'closedialog.ns' );
        } );

        dialogAlert.on( 'close', function() {
            assert.ok( true, 'The alert dialog has been closed' );
            ready();
        } );

        dialogConfirm.on( 'close', function() {
            assert.ok( true, 'The confirm dialog has been closed' );
            ready1();
        } );

        dialog.init()
            .then( function() {
                assert.equal( dialog.getState( 'init' ), true, 'The plugin is initialized' );

                runner.trigger( 'alert', expectedAlertMessage, function() {
                    assert.ok( false, 'The alert message without namespace should not be acknowledged' );
                } );

                runner.trigger( 'alert.ns', expectedAlertMessage, function() {
                    assert.ok( true, 'The alert message with namespace has been acknowledged' );
                } );

                runner.trigger( 'confirm', expectedConfirmMessage, function() {
                    assert.ok( false, 'The confirm message without namespace should not be accepted' );
                }, function() {
                    assert.ok( false, 'The confirm message without namespace should not be rejected' );
                } );

                runner.trigger( 'confirm.ns', expectedConfirmMessage, function() {
                    assert.ok( false, 'The confirm message with namespace should not be accepted' );
                }, function() {
                    assert.ok( true, 'The confirm message with namespace has been rejected' );
                } );
            } )
            .catch( function( err ) {
                console.log( err );
                assert.ok( false, 'The init method must not fail' );
                ready();
            } );
    } );

    QUnit.test( 'different namespace alert and confirm', function( assert ) {
        var ready = assert.async();
        var runner = runnerFactory( providerName );
        var dialog = dialogFactory( runner, runner.getAreaBroker() );
        var expectedAlertMessage = 'Hello';
        var expectedConfirmMessage = 'exit?';
        var stack = [];
        var countAlert = 0;
        var countConfirm = 0;

        assert.expect( 11 );

        stack.push( new Promise( function( resolve ) {
            dialogAlert.on( 'create', function( message ) {
                assert.ok( true, 'A alert dialog has been created' );
                assert.equal( message, expectedAlertMessage, 'The expected alert message has been displayed' );

                if ( ++countAlert === 2 ) {
                    resolve();
                }
            } );
        } ) );

        stack.push( new Promise( function( resolve ) {
            dialogConfirm.on( 'create', function( message ) {
                assert.ok( true, 'A confirm dialog has been created' );
                assert.equal( message, expectedConfirmMessage, 'The expected confirm message has been displayed' );

                if ( ++countConfirm === 2 ) {
                    resolve();
                }
            } );
        } ) );

        Promise.all( stack ).then( function() {
            runner.trigger( 'closedialog.ns1' );
        } );

        dialogAlert.on( 'close', function() {
            assert.ok( true, 'The alert dialog has been closed' );
            ready();
        } );

        dialogConfirm.on( 'close', function() {
            assert.ok( true, 'The confirm dialog has been closed' );
            ready();
        } );

        dialog.init()
            .then( function() {
                assert.equal( dialog.getState( 'init' ), true, 'The plugin is initialized' );

                runner.trigger( 'alert', expectedAlertMessage, function() {
                    assert.ok( false, 'The alert message without namespace should not be acknowledged' );
                } );

                runner.trigger( 'alert.ns1', expectedAlertMessage, function() {
                    assert.ok( true, 'The alert message with namespace has been acknowledged' );
                } );

                runner.trigger( 'confirm', expectedConfirmMessage, function() {
                    assert.ok( false, 'The confirm message without namespace should not be accepted' );
                }, function() {
                    assert.ok( false, 'The confirm message without namespace should not be rejected' );
                } );

                runner.trigger( 'confirm.ns2', expectedConfirmMessage, function() {
                    assert.ok( false, 'The confirm message with namespace should not be accepted' );
                }, function() {
                    assert.ok( false, 'The confirm message with namespace should not be rejected' );
                } );
            } )
            .catch( function( err ) {
                console.log( err );
                assert.ok( false, 'The init method must not fail' );
                ready();
            } );
    } );

    QUnit.test( 'multiple dialogs', function( assert ) {
        var ready = assert.async();
        var runner = runnerFactory( providerName );
        var dialog = dialogFactory( runner, runner.getAreaBroker() );
        var expectedMessage = 'MyMessage';
        var expectedAlertCount = 2;
        var expectedConfirmCount = 2;
        var stack = [];
        var startPromises = [];
        var endPromises = [];
        var countAlert = 0;
        var countConfirm = 0;

        assert.expect( 2 + expectedAlertCount * 6 + expectedConfirmCount * 6 );

        startPromises.push( new Promise( function( resolve ) {
            dialogConfirm.on( 'create', function( message ) {
                assert.ok( true, 'A confirm dialog has been created' );
                assert.equal( message, expectedMessage, 'The expected message has been displayed' );

                stack.push( this );
                if ( ++countConfirm === expectedConfirmCount ) {
                    resolve();
                }
            } );
        } ) );

        startPromises.push( new Promise( function( resolve ) {
            dialogAlert.on( 'create', function( message ) {
                assert.ok( true, 'An alert dialog has been created' );
                assert.equal( message, expectedMessage, 'The expected message has been displayed' );

                stack.push( this );
                if ( ++countAlert === expectedAlertCount ) {
                    resolve();
                }
            } );
        } ) );

        endPromises.push( new Promise( function( resolve ) {
            dialogConfirm.on( 'close', function() {
                assert.ok( true, 'The confirm dialog has been closed' );

                assert.equal( stack.pop(), this, 'The right dialog has been closed' );
                if ( --countConfirm === 0 ) {
                    resolve();
                }
            } );
        } ) );

        endPromises.push( new Promise( function( resolve ) {
            dialogAlert.on( 'close', function() {
                assert.ok( true, 'The alert dialog has been closed' );

                assert.equal( stack.pop(), this, 'The right dialog has been closed' );
                if ( --countAlert === 0 ) {
                    resolve();
                }
            } );
        } ) );

        Promise.all( startPromises ).then( function() {
            var count = stack.length;
            async.timesSeries( count, function( n, next ) {
                runner.trigger( 'tool-dialog-accept' );

                _.delay( function() {
                    assert.equal( stack.length, count - ( n + 1 ), 'The remaining dialogs should be still open' );
                    next();
                }, 250 );
            }, function() {
                ready();
            } );

            return Promise.all( endPromises ).then( function() {
                assert.ok( true, 'All dialogs have been closed' );
            } );
        } ).catch( function( err ) {
            console.log( err );
            assert.ok( false, 'The dialog create step should not fail' );
            ready();
        } );

        dialog.init()
            .then( function() {
                assert.equal( dialog.getState( 'init' ), true, 'The plugin is initialized' );

                _.times( expectedAlertCount, function() {
                    runner.trigger( 'alert', expectedMessage, function() {
                        assert.ok( true, 'The message has been read' );
                    } );
                } );

                _.times( expectedConfirmCount, function() {
                    runner.trigger( 'confirm', expectedMessage, function() {
                        assert.ok( true, 'The message has been accepted' );
                    }, function() {
                        assert.ok( false, 'The message should not be rejected' );
                    } );
                } );
            } )
            .catch( function( err ) {
                console.log( err );
                assert.ok( false, 'The init method must not fail' );
                ready();
            } );
    } );
} );
