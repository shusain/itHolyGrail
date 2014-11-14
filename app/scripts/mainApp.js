(function(){
  'use strict';
  /**
  * mainApp Module
  *
  * Just an app for testing out the module
  */
  angular.module('mainApp', ['itHolyGrail'])
    .controller('TestCtrl', function ($scope) {
        
      $scope.myModel = {
        layoutConfig:{
          westCol: {
            width: '20%',
            minWidth: '60px',
            maxWidth: '400px',
            head:{
              show:true,
              height: "60px",
              padding: ["9px", "9px", "9px", "9px"]
            },
            body:{
              padding: ["9px", "9px", "9px", "9px"]
            },
            foot:{
              show:true,
              height: "60px",
              padding: ["9px", "9px", "9px", "9px"]
            }
          },
          mainCol: {
            // width: CALCULATED BASED ON REMAINDER
            head:{
              show:true,
              height: "60px",
              padding: ["9px", "9px", "9px", "9px"]
            },
            body:{
              padding: ["9px", "9px", "9px", "9px"]
            },
            foot:{
              show:true,
              height: "60px",
              padding: ["9px", "9px", "9px", "9px"]
            }
          },
          eastCol: {
            width: '20%',
            minWidth: '60px',
            maxWidth: '400px',
            head:{
              show:true,
              height: "60px",
              padding: ["9px", "9px", "9px", "9px"]
            },
            body:{
              padding: ["9px", "9px", "9px", "9px"]
            },
            foot:{
              show:true,
              height: "60px",
              padding: ["9px", "9px", "9px", "9px"]
            }
          },
          outsideBorder: '10px',
          insideBorder: '5px',
          transition: 'all ease-in .1s'
        }
      };
    });

})();
