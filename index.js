/* global define:false, console */


(function ( factory ) {
  'use strict';

  /* istanbul ignore next */
  if ( typeof define === 'function' && define.amd ) {
    return define( [ 'angular' ], factory );
  }

  /* istanbul ignore next */
  if ( typeof exports === 'object' ) {
    return ( module.exports = factory( require( 'angular' ) ) );
  }

  factory( window.angular );
}( function ( angular ) {
  'use strict';

  function service( $document ) {
    // jshint validthis:true
    // jshint latedef:false

    this.key   = key;
    this.click = click;

    // ---

    function key( cb, $scope ) {
      var handler = function ( ev ) {
        if ( ( ev.which || ev.keyCode ) !== 27 ) {
          return ev;
        }

        // should allow on buttons?
        // should allow for input[type=button|reset|submit]?
        // if ( /input|textarea|select/i.test( ev.target.nodeName ) ) {
        if ( /input|textarea|select/i.test( ev.target.nodeName ) ) {
          return ev;
        }

        cb( ev );

        $document.off( 'keydown', handler );
      };

      return register( 'keydown', handler, $scope );
    }

    function click( cb, element, $scope ) {
      element = element && element[ 0 ] ? element[ 0 ] : element;

      var handler = function ( ev ) {
        if ( element ) {
          var t = ev.target;

          if ( t === element ) {
            return ev;
          }

          while ( ( t = t.parentNode ) ) {
            if ( t === element ) {
              return ev;
            }
          }
        }

        cb( ev );

        $document.off( 'click', handler );
      };

      return register( 'click', handler, $scope );
    }

    function register( event, handler, $scope ) {
      var unregister = function () {
        $document.off( event, handler );
      };

      $document.on( event, handler );

      if ( $scope ) {
        $scope.$on( '$destroy', unregister );
      }

      return unregister;
    }
  }

  service.$inject = [
    '$document'
  ];

  var ngModule = angular.module( 'str.angular-escape', [ 'ng' ] )
    .service( 'esc', service );

  return ngModule.name;
}));
