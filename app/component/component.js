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
      
  .directive('holyGrail', function($window, $timeout){
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
          minWidth: parseInt(getClassStyle('.west-col', 'min-width')['min-width']),
          maxWidth: parseInt(getClassStyle('.west-col', 'max-width')['max-width']),
          padding: parseInt(getClassStyle('.west-col', 'padding')['padding']),
          left: parseInt(getClassStyle('.west-col', 'left')['left'])
        };
        
        var eastClassInfo = {
          width: getClassStyle('.east-col', 'width')['width'],
          minWidth: parseInt(getClassStyle('.east-col', 'min-width')['min-width']),
          maxWidth: parseInt(getClassStyle('.east-col', 'max-width')['max-width']),
          padding: parseInt(getClassStyle('.east-col', 'padding')['padding']),
          right: parseInt(getClassStyle('.east-col', 'right')['right'])
        };

        console.log(eastClassInfo)

        function calcEastAndWest(){
          var parElement = scope.panels['eastBody'].parent()[0];
          console.log(parElement)
          console.log('parent width',parElement.clientWidth);
          console.log('eastClass',eastClassInfo);
          console.log('westClass',westClassInfo);

          if(westClassInfo.width.indexOf("%")!=-1)
            westWidth = parElement.clientWidth*parseInt(westClassInfo.width)/100;
          else
            westWidth = parElement.clientWidth*westClassInfo.width;

          if(westWidth<westClassInfo.minWidth)
            westWidth = westClassInfo.minWidth;
          if(westWidth>westClassInfo.maxWidth)
            westWidth = westClassInfo.maxWidth;

          if(eastClassInfo.width.indexOf("%")!=-1)
            eastWidth = parElement.clientWidth*parseInt(eastClassInfo.width)/100;
          else
            eastWidth = parElement.clientWidth*eastClassInfo.width;

          if(eastWidth<eastClassInfo.minWidth)
            eastWidth = eastClassInfo.minWidth;
          if(eastWidth>eastClassInfo.maxWidth)
            eastWidth = eastClassInfo.maxWidth;

          console.log(westWidth,eastWidth);

          $timeout(scope.updateStyles);
        };
        scope.updateStyles = function () {
          
          var newStyle = {};
          
          if(!scope.showWest) {
            newStyle.left=westClassInfo.left+"px";
          }
          else {
            newStyle.left = (westWidth+westClassInfo.padding*2+westClassInfo.left+1)+"px";
          }

          if(!scope.showEast) {
            newStyle.right = eastClassInfo.right+"px";
          }
          else {
            newStyle.right = (eastWidth+eastClassInfo.padding*2+eastClassInfo.right+1)+"px";
          }

          angular.extend(scope.panels['mainBody'][0].style, newStyle);
          angular.extend(scope.panels['mainHead'][0].style, newStyle);
          angular.extend(scope.panels['mainFoot'][0].style, newStyle);
        }

        scope.$watch('showWest', scope.updateStyles);
        scope.$watch('showEast', scope.updateStyles);

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
    
    var panels = ["westBody", "eastBody", "mainBody", "mainHead", "mainFoot"];

    for (var i = panels.length - 1; i >= 0; i--) {
      var curPanel = panels[i];
      makeDirective(curPanel);
    };
  };
  createPanelDirectives();

})();
