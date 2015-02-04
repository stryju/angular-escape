/* global define, beforeAll, afterAll, console */

// jshint jasmine:true

define([
  'angular',
  'angular.mocks',
  './index'
], function( ng, mocks, module ) {
  'use strict';

  var KEYS = {
    BACKSPACE : 8,
    TAB       : 9,
    ENTER     : 13,
    ESC       : 27,
    LEFT      : 37,
    UP        : 38,
    RIGHT     : 39,
    DOWN      : 40,
  };

  function unwrapElement( element ) {
    return element && element[ 0 ] ? element[ 0 ] : element;
  }

  function keyPress( key, element ) {
    var ev = document.createEvent( 'Event' );
    ev.keyCode = key;
    ev.initEvent( 'keydown', true, true, window );

    ( unwrapElement( element ) || document ).dispatchEvent( ev );
  }

  function click( element ) {
    var ev = document.createEvent( 'MouseEvent' );
    ev.initMouseEvent( 'click', true, true, window );

    ( unwrapElement( element ) || document ).dispatchEvent( ev );
  }

  function body() {
    return ng.element( document.querySelector( 'body' ) );
  }

  describe( 'esc', function () {
    var esc;
    var $document;

    beforeEach( mocks.module( module.name ) );

    beforeEach( mocks.inject( function ( _esc_, _$document_ ) {
      esc       = _esc_;
      $document = _$document_;
    }));

    it( 'should exist', function () {
      expect( esc ).toBeDefined();
      expect( esc.key ).toBeDefined();
      expect( esc.click ).toBeDefined();
    });

    describe( '.key()', function () {
      var foo;
      var bar;

      beforeEach( function () {
        foo = {
          cb : function () {
            bar++;
          }
        };

        bar = 0;

        spyOn( foo, 'cb' ).and.callThrough();
      });

      it( 'should trigger the CB when ESC is pressed and unregister the CB', function () {
        esc.key( foo.cb );

        keyPress( KEYS.ENTER );
        expect( bar ).toBe( 0 );
        expect( foo.cb ).not.toHaveBeenCalled();

        keyPress( KEYS.ESC );
        expect( bar ).toBe( 1 );
        expect( foo.cb ).toHaveBeenCalled();

        keyPress( KEYS.ESC );
        keyPress( KEYS.ESC );
        keyPress( KEYS.ESC );
        keyPress( KEYS.ESC );
        expect( bar ).toBe( 1 );
      });

      it( 'should return function to unregister the CB', function () {
        var unregister = esc.key( foo.cb );

        unregister();
        keyPress( KEYS.ESC );

        expect( bar ).toBe( 0 );
        expect( foo.cb ).not.toHaveBeenCalled();
      });

      it( 'should unregister the CB when attached to scope that\'s being destroyed', mocks.inject( function ( $rootScope ) {
        var scope = $rootScope.$new();

        esc.key( foo.cb, scope );
        scope.$destroy();

        keyPress( KEYS.ESC );
        expect( bar ).toBe( 0 );
        expect( foo.cb ).not.toHaveBeenCalled();
      }));

      describe( 'behavior with form controls', function () {
        var elements = {
          'INPUT' : ng.element( '<input>' ),
          'TEXTAREA' : ng.element( '<textarea></textarea>' ),
          'SELECT' : ng.element( '<select></select>' ),
          // 'BUTTON' : ng.element( '<button></button>' ),
        };

        Object.keys( elements )
          .forEach( function ( label ) {
            var element;
            var unregister;

            describe( label + ' behavior', function () {
              beforeAll( function () {
                element    = ng.element( elements[ label ] );
                unregister = esc.key( foo.cb );
                bar        = 0;

                body().append( element );
              });

              afterAll( function () {
                element.remove();

                unregister();
              });

              it( label + ' shouldn\'t trigger the CB', function () {
                keyPress( KEYS.ESC, element );

                expect( bar ).toBe( 0 );
                expect( foo.cb ).not.toHaveBeenCalled();
              });
            });
          });
      });
    });

    describe( '.click()', function () {
      var foo;
      var bar;

      beforeEach( function () {
        foo = {
          cb : function () {
            bar++;
          }
        };

        bar = 0;

        spyOn( foo, 'cb' ).and.callThrough();
      });

      it( 'should trigger the CB when document is clicked', function () {
        esc.click( foo.cb );

        expect( bar ).toBe( 0 );
        expect( foo.cb ).not.toHaveBeenCalled();

        click();
        expect( bar ).toBe( 1 );
        expect( foo.cb ).toHaveBeenCalled();

        click();
        expect( bar ).toBe( 1 );
      });

      it( 'should return function to unregister the CB', function () {
        var unregister = esc.click( foo.cb );

        unregister();

        click();
        expect( bar ).toBe( 0 );
        expect( foo.cb ).not.toHaveBeenCalled();
      });

      it( 'should unregister the CB when attached to scope that\'s being destroyed', mocks.inject( function ( $rootScope ) {
        var scope = $rootScope.$new();

        esc.click( foo.cb, void 0, scope );
        scope.$destroy();

        click();
        expect( bar ).toBe( 0 );
        expect( foo.cb ).not.toHaveBeenCalled();
      }));

      describe( 'behavior with elements', function () {
        var element1;
        var element2;
        var element3;
        var outerElement;

        beforeEach( function () {
          element1     = ng.element( '<div></div>' );
          element2     = ng.element( '<p></p>' );
          element3     = ng.element( '<a>dummy link</a>' );
          outerElement = ng.element( '<section></section>' );

          element2.append( element3 );
          element1.append( element2 );

          body().append( element1 );
          body().append( outerElement );
        });

        afterEach( function () {
          element1.remove();
          element2.remove();
          element3.remove();
          outerElement.remove();
        });

        it( 'should not trigger the CB when clicking within specified element', function () {
          esc.click( foo.cb, element1 );

          click( element1 );
          expect( bar ).toBe( 0 );
          expect( foo.cb ).not.toHaveBeenCalled();

          click( element2 );
          expect( bar ).toBe( 0 );
          expect( foo.cb ).not.toHaveBeenCalled();

          click( element3 );
          expect( bar ).toBe( 0 );
          expect( foo.cb ).not.toHaveBeenCalled();
        });

        it( 'should trigger the CB when clicking on other element\'s parent element', function () {
          esc.click( foo.cb, element2 );

          click( element1 );
          expect( bar ).toBe( 1 );
          expect( foo.cb ).toHaveBeenCalled();
        });

        it( 'should trigger the CB when clicking on other element', function () {
          esc.click( foo.cb, element1 );

          click( outerElement );
          expect( bar ).toBe( 1 );
          expect( foo.cb ).toHaveBeenCalled();
        });

        it( 'should trigger the handler immediately, if adding the handler with click event', function () {
          outerElement.on( 'click', function () {
            esc.click( foo.cb, element1 );
          });

          expect( bar ).toBe( 0 );
          expect( foo.cb ).not.toHaveBeenCalled();

          click( outerElement );
          expect( bar ).toBe( 1 );
          expect( foo.cb ).toHaveBeenCalled();
        });

        it( 'should NOT trigger the handler immediately, if adding the handler with small delay', mocks.inject( function ( $timeout ) {
          outerElement.one( 'click', function () {
            $timeout( function () {
              esc.click( foo.cb, element1 );
            }, 100, false );
          });

          expect( bar ).toBe( 0 );
          expect( foo.cb ).not.toHaveBeenCalled();

          click( outerElement );
          expect( bar ).toBe( 0 );
          expect( foo.cb ).not.toHaveBeenCalled();

          $timeout.flush( 100 );

          click( outerElement );
          expect( bar ).toBe( 1 );
          expect( foo.cb ).toHaveBeenCalled();

          $timeout.verifyNoPendingTasks();
        }));
      });
    });
  });
});
