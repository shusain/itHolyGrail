'use strict';

/**
 * @ngdoc overview
 * @name itHolyGrailApp
 * @description
 * # itHolyGrailApp
 *
 * Main module of the application.
 */
angular
  .module('itHolyGrailApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'itHolyGrail'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
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

    $scope.toggle = function () {
      $scope.toggleWest();
      $scope.toggleEast();
      $scope.toggleHead();
      $scope.toggleFoot();
    };

    $scope.togglePanel = function (col,pos) {
      $scope.myModel.layoutConfig[col+'Col'][pos].show = !$scope.myModel.layoutConfig[col+'Col'][pos].show;
    };

    $scope.toggleAll = function(){
      $scope.togglePanel('west','head');
      $scope.togglePanel('west','foot');
      $scope.togglePanel('east','head');
      $scope.togglePanel('east','foot');
      $scope.togglePanel('main','head');
      $scope.togglePanel('main','foot');
    }
  });
