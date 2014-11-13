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
        showWest:true,
        showEast:true,
        showHead:true,
        showFoot:true,
        layoutConfig:{
          westClassInfo: {
            width: '20%',
            minWidth: '60px',
            maxWidth: '400px'
          },
          eastClassInfo:{
            width: '20%',
            minWidth: '60px',
            maxWidth: '275px'
          },
          headRowHeight: '60px',
          footRowHeight: '60px',
          outsideBorder: '10px',
          insideBorder: '5px',
          insidePadding: '9px',
          transition: 'all linear .1s'
        }
      };

      $scope.toggle = function () {
        $scope.toggleWest();
        $scope.toggleEast();
        $scope.toggleHead();
        $scope.toggleFoot();
      };

      $scope.toggleWest = function () {
        $scope.myModel.showWest = !$scope.myModel.showWest;
      };

      $scope.toggleHead = function () {
        $scope.myModel.showHead = !$scope.myModel.showHead;
      };

      $scope.toggleFoot = function () {
        $scope.myModel.showFoot = !$scope.myModel.showFoot;
      };

      $scope.toggleEast = function () {
        $scope.myModel.showEast = !$scope.myModel.showEast;
      };
    });

})();
