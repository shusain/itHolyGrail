(function(){
  'use strict';
  /**
  * mainApp Module
  *
  * Just an app for testing out the module
  */
  angular.module('mainApp', ["componentModule"])
    .controller('TestCtrl', function ($scope) {
        
      $scope.myModel = {
        showWest:true,
        showEast:true
      }

      $scope.toggle = function () {
        $scope.myModel.showWest = !$scope.myModel.showWest;
        $scope.myModel.showEast = !$scope.myModel.showEast;
      }
      $scope.toggleWest = function () {
        $scope.myModel.showWest = !$scope.myModel.showWest;
      }
      $scope.toggleEast = function () {
        $scope.myModel.showEast = !$scope.myModel.showEast;
      }
    });

})();
