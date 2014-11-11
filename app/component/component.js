(function(){
  'use strict';
  
  /**
  * componentModule Module
  *
  * Description
  */

  var getClassStyle = function(className, requiredStyle){
      var x, sheets,classes;


      var requiredStyleFulfilled = true;
      if(requiredStyle)
        requiredStyleFulfilled = false;

      for( sheets=document.styleSheets.length-1; sheets>=0; sheets-- ){
          classes = document.styleSheets[sheets].rules || document.styleSheets[sheets].cssRules;
          for(x=0;x<classes.length;x++) {
              if(classes[x].selectorText.indexOf(className)!=-1){
                  var classStyleTxt = (classes[x].cssText ? classes[x].cssText : classes[x].style.cssText).match(/\{\s*([^{}]+)\s*\}/)[1];
                  var classStyles = {};
                  var styleSets = classStyleTxt.match(/([^;:]+:\s*[^;:]+\s*)/g);
                  for(var y=0;y<styleSets.length;y++){
                      var style = styleSets[y].match(/\s*([^:;]+):\s*([^;:]+)/);
                      if(style.length > 2)
                      {
                        if(style[1] == requiredStyle)
                          requiredStyleFulfilled = true;
                        
                        classStyles[style[1]]=style[2];
                      }
                  }
                  if(requiredStyleFulfilled)
                    return classStyles;
              }
          }
      }
      return false;
  };


  var mod = angular.module('componentModule', ['ui.router'])
  .constant('EXTRA_PADDING', 3)
      
  .directive('holyGrail', function($window, $timeout, EXTRA_PADDING){
    return {
      restrict:'E',
      scope:{showWest:'=',showEast:'='},
      controller:function($scope){
        $scope.panels = [];
        
        this.addPanel = function(name, panel){
          $scope.panels[name] = panel;
        }
      },
      link:function(scope, element, attr){
        var eastWidth = 0;
        var westWidth = 0;
        
        var westClassInfo = {
          width: getClassStyle('.west-col', 'width')['width'],
          minWidth: getClassStyle('.west-col', 'min-width')['min-width'],
          maxWidth: getClassStyle('.west-col', 'max-width')['max-width'],
          padding: getClassStyle('.west-col', 'padding')['padding'],
          left: getClassStyle('.west-col', 'left')['left']
        };
        
        var eastClassInfo = {
          width: getClassStyle('.east-col', 'width')['width'],
          minWidth: getClassStyle('.east-col', 'min-width')['min-width'],
          maxWidth: getClassStyle('.east-col', 'max-width')['max-width'],
          padding: getClassStyle('.east-col', 'padding')['padding'],
          right: getClassStyle('.east-col', 'right')['right']
        };

        console.log(eastClassInfo)

        function determinePixelSize(parentSize, classInfo){
          var retSize = 0;

          var classWidth = normalizePercentAndPixel(classInfo.width, parentSize);
          var classMinWidth = normalizePercentAndPixel(classInfo.minWidth, parentSize);
          var classMaxWidth = normalizePercentAndPixel(classInfo.maxWidth, parentSize);

          if(classWidth < classMinWidth)
            classWidth = classMinWidth;
          if(classWidth > classMaxWidth)
            classWidth = classMaxWidth;

          return Math.ceil(classWidth);
        }

        function normalizePercentAndPixel(stringValue, parentSize){
          var parsed = parseInt(stringValue);
          if(stringValue.indexOf("%")!=-1)
            return parsed/100*parentSize;
          else
            return parsed;
        }

        function calcEastAndWest(){
          var parElementWidth = scope.panels['eastBody'].parent()[0].clientWidth;
          
          westWidth = determinePixelSize(parElementWidth, westClassInfo);
          eastWidth = determinePixelSize(parElementWidth, eastClassInfo);

          console.log(westWidth,eastWidth);

          $timeout(updateStyles);
        };
        
        function updateStyles() {
          var parElementWidth = scope.panels['eastBody'].parent()[0].clientWidth;

          var westLeft = normalizePercentAndPixel(westClassInfo.left, parElementWidth);
          var westPadding = normalizePercentAndPixel(westClassInfo.padding, parElementWidth);
          var eastRight = normalizePercentAndPixel(eastClassInfo.right, parElementWidth);
          var eastPadding = normalizePercentAndPixel(eastClassInfo.padding, parElementWidth);
          
          var newStyle = {};
          
          if(!scope.showWest) {
            newStyle.left=westClassInfo.left;
            scope.panels['westBody'][0].style.left = scope.panels['westHead'][0].style.left = scope.panels['westFoot'][0].style.left = -(westWidth+westPadding*2) + "px";
          }
          else {
            newStyle.left = (westWidth+westPadding*2+westLeft+EXTRA_PADDING)+"px";
            scope.panels['westBody'][0].style.left = scope.panels['westHead'][0].style.left = scope.panels['westFoot'][0].style.left = westLeft + "px";
          }

          if(!scope.showEast) {
            newStyle.right = eastClassInfo.right;
            scope.panels['eastBody'][0].style.right = scope.panels['eastHead'][0].style.right = scope.panels['eastFoot'][0].style.right = -(eastWidth+eastPadding*2) + "px";
          }
          else {
            newStyle.right = (eastWidth+eastPadding*2+eastRight+EXTRA_PADDING)+"px";
            scope.panels['eastBody'][0].style.right = scope.panels['eastHead'][0].style.right = scope.panels['eastFoot'][0].style.right = eastRight + "px";
          }

          angular.extend(scope.panels['mainBody'][0].style, newStyle);
          angular.extend(scope.panels['mainHead'][0].style, newStyle);
          angular.extend(scope.panels['mainFoot'][0].style, newStyle);
        };

        scope.$watch('showWest', updateStyles);
        scope.$watch('showEast', updateStyles);

        angular.element($window).bind('resize', calcEastAndWest);
        angular.element(document).ready(calcEastAndWest);
      }
    }
  })

  function createPanelDirectives(){

    function makeDirective(name){
      mod.directive(name, function(){
        return{
          restrict:'C',
          require: '^holyGrail',
          link: function (scope, element, attr, holyGrailCtrl) {
            holyGrailCtrl.addPanel(name, element);
          }
        }
      });
    }
    
    var panels = ["westBody", "westHead", "westFoot", "eastBody", "eastHead", "eastFoot", "mainBody", "mainHead", "mainFoot"];

    for (var i = panels.length - 1; i >= 0; i--) {
      var curPanel = panels[i];
      makeDirective(curPanel);
    };
  };
  createPanelDirectives();

})();
