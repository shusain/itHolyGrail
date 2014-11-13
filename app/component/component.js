(function(){
  'use strict';
  
  /**
  * componentModule Module
  *
  * Description
  */

  var mod = angular.module('componentModule', ['ui.router'])
  mod.factory('StyleSheetHandler', function(){
    var StyleSheetHandler = {};

    StyleSheetHandler.createStyleSheet = function(){
      if(!document.styleSheets) {
        return;
      }

      if(document.getElementsByTagName("head").length == 0) {
        return;
      }

      var styleSheet;
      var GEN_ID = "generated";

      var styleSheetElement = document.createElement("style");
      styleSheetElement.type = "text/css";
      styleSheetElement.title = GEN_ID;

      document.getElementsByTagName("head")[0].appendChild(styleSheetElement);

      //Find the newly addded stylesheet object
      //since one wasn't found in the first loop above
      //the one we just added must be the only non disabled
      //one (this is probably a bad assumption it should do the same checks as above for media)
      for( var i = document.styleSheets.length-1; i>=0; i--) {
        if(document.styleSheets[i].disabled) {
          continue;
        }
        if(document.styleSheets[i].title == GEN_ID)
        {
          styleSheet = document.styleSheets[i];
        }
      }

      return {mediaType:typeof styleSheet.media, styleSheet:styleSheet}
    }

    StyleSheetHandler.findEnabledScreenStylesheet = function(){
      if(!document.styleSheets) {
        return;
      }

      if(document.getElementsByTagName("head").length == 0) {
        return;
      }
      //If there are existing stylesheets
      if(document.styleSheets.length > 0) {

        //Iterate through them
        for( i = 0; i < document.styleSheets.length; i++) {
          //If a stylesheet is disabled skip this iteration
          if(document.styleSheets[i].disabled) {
            continue;
          }
          //Get the media from the current stylesheet
          var media = document.styleSheets[i].media;
          mediaType = typeof media;

          //Check the media type (must vary between browsers)
          if(mediaType == "string") {
            //Check that the media target, if it targets the screen use it
            if(media == "" || (media.indexOf("screen") != -1)) {
              styleSheet = document.styleSheets[i];
            }
          } else if(mediaType == "object") {
            if(media.mediaText == "" || (media.mediaText.indexOf("screen") != -1)) {
              styleSheet = document.styleSheets[i];
            }
          }

          //If we have found a usable stylesheet during this iteration exit the loop
          if( typeof styleSheet != "undefined") {
            return styleSheet;
          }
        }
      }
    }

    StyleSheetHandler.createCSSSelector = function(selector, style){
      var styleSheet = StyleSheetHandler.baseStyleSheet.styleSheet;
      var mediaType = StyleSheetHandler.baseStyleSheet.mediaType;

      //Finally after we have the stylesheet to use we need to add the new rule appropriately
      //this searches for an existing matching rule
      if(mediaType == "string") {
        // for(var i = 0; i < styleSheet.rules.length; i++) {
        //   if(styleSheet.rules[i].selectorText && styleSheet.rules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
        //     styleSheet.rules[i].style.cssText = style;
        //     return;
        //   }
        // }

        //If we didn't find a matching rule we add the rule
        styleSheet.addRule(selector, style);

      } else if(mediaType == "object") {
        // for(var i = 0; i < styleSheet.cssRules.length; i++) {
        //   if(styleSheet.cssRules[i].selectorText && styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
        //     styleSheet.cssRules[i].style.cssText = style;
        //     return;
        //   }
        // }

        //Again but for other browsers if we didn't find the rule we add a new rule
        styleSheet.insertRule(selector + "{" + style + "}", styleSheet.cssRules.length);
      }
    }

    StyleSheetHandler.baseStyleSheet = StyleSheetHandler.createStyleSheet();

    return StyleSheetHandler;

  })
  
  .directive('holyGrail', function($window, $timeout, StyleSheetHandler){
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
        console.log(element[0].offsetWidth);
        var eastWidth = 0;
        var westWidth = 0;
        
        var layoutConfig = {
          westClassInfo: {
            width: "20%",
            minWidth: "60px",
            maxWidth: "275px",
            padding: "9px"
          },
          eastClassInfo:{
            width: "20%",
            minWidth: "60px",
            maxWidth: "275px",
            padding: "9px"
          },
          headRowHeight: "60px",
          footRowHeight: "60px",
          outsideBorder: "3px",
          insideBorder: "3px",
          insidePadding: "9px"
        }

        //Some aliases
        var cc, calculatedConfig;
        var wci;
        var eci;

        cc = calculatedConfig = {};
        var lc = layoutConfig;

        //Function determines all the pixel sizes as Numbers
        //based on the string input, converts each based on
        //the percentage or the value supplied.
        function calcPixelSizes(inputObj, resultObj){
          _.forOwn(inputObj, function(value, key, obj){
            if(key == "width"){
              resultObj[key] = determinePixelSize(obj); 
            }
            else if(angular.isString(value)) {
              resultObj[key] = normalizePercentAndPixel(value);
            }
            else if(angular.isObject(value)){
              resultObj[key] = {};
              calcPixelSizes(value, resultObj[key]);
            }
          });
        }

        function determinePixelSize(classInfo){
          var classWidth = normalizePercentAndPixel(classInfo.width);
          var classMinWidth = normalizePercentAndPixel(classInfo.minWidth);
          var classMaxWidth = normalizePercentAndPixel(classInfo.maxWidth);

          if(classWidth < classMinWidth)
            classWidth = classMinWidth;
          if(classWidth > classMaxWidth)
            classWidth = classMaxWidth;

          return Math.ceil(classWidth);
        }

        function normalizePercentAndPixel(stringValue){
          var parsed = parseInt(stringValue);
          if(stringValue.indexOf("%")!=-1)
            return parsed/100*element[0].offsetWidth;
          else
            return parsed;
        }

        function calcEastAndWest(){
          calcPixelSizes(lc, cc);
          wci = cc.westClassInfo;
          eci = cc.eastClassInfo;

          $timeout(updateStyles);
        };
        
        function updateStyles() {
          if(!wci)
            return;
          westWidth = wci.width;
          eastWidth = eci.width;
          
          var newStyle = {};
          
          if(!scope.showWest) {
            newStyle.left=cc.outsideBorder + "px";
            scope.panels['westBody'][0].style.left = scope.panels['westHead'][0].style.left = scope.panels['westFoot'][0].style.left = -(westWidth+wci.padding*2) + "px";
          }
          else {
            newStyle.left = (westWidth+cc.insideBorder+cc.outsideBorder+cc.insidePadding*2)+"px";
            scope.panels['westBody'][0].style.left = scope.panels['westHead'][0].style.left = scope.panels['westFoot'][0].style.left = cc.outsideBorder + "px";
          }

          if(!scope.showEast) {
            newStyle.right = cc.outsideBorder + "px";
            scope.panels['eastBody'][0].style.right = scope.panels['eastHead'][0].style.right = scope.panels['eastFoot'][0].style.right = -(eastWidth+eci.padding*2) + "px";
          }
          else {
            newStyle.right = (eastWidth+cc.insideBorder+cc.outsideBorder+cc.insidePadding*2)+"px";
            scope.panels['eastBody'][0].style.right = scope.panels['eastHead'][0].style.right = scope.panels['eastFoot'][0].style.right = cc.outsideBorder + "px";
          }

          angular.extend(scope.panels['mainBody'][0].style, newStyle);
          angular.extend(scope.panels['mainHead'][0].style, newStyle);
          angular.extend(scope.panels['mainFoot'][0].style, newStyle);
        };

        scope.$watch('showWest', updateStyles);
        scope.$watch('showEast', updateStyles);

        angular.element($window).bind('resize', calcEastAndWest);
        angular.element(document).ready(setup);

        function setup(){
          calcPixelSizes(lc, cc);
          wci = cc.westClassInfo;
          eci = cc.eastClassInfo;
          console.log(cc)

          StyleSheetHandler.createCSSSelector('.west-col, .main-col, .east-col', 'padding:9px;');
          // console.log('setting cw', 'width: '+wci.width+';  min-width: '+wci.minWidth+';  max-width: '+wci.maxWidth+';')
          
          /****************************************************( Side Widths )*/
          StyleSheetHandler.createCSSSelector('.west-col','width: '+wci.width+'px;  min-width: '+wci.minWidth+'px;  max-width: '+wci.maxWidth+'px;')
          StyleSheetHandler.createCSSSelector('.east-col','width: '+eci.width+'px;  min-width: '+eci.minWidth+'px;  max-width: '+eci.maxWidth+'px;')
          
          /********************************************************( Heights )*/
          StyleSheetHandler.createCSSSelector('.head-row', 'height:'+cc.headRowHeight+'px;');
          StyleSheetHandler.createCSSSelector('.foot-row', 'height:'+cc.footRowHeight+'px;');

          /*****************************************************( Positions )*/
          // var topOffset = cc.headRowHeight
          StyleSheetHandler.createCSSSelector('.head-row', 'position: absolute;  top: '+cc.outsideBorder+'px;');
          StyleSheetHandler.createCSSSelector('.body-row', 'position: absolute;  top: 82px; bottom: 82px;');
          StyleSheetHandler.createCSSSelector('.foot-row', 'position: absolute;  bottom: 3px;');
          StyleSheetHandler.createCSSSelector('.west-col', 'position: absolute;  left: 3px;');
          StyleSheetHandler.createCSSSelector('.east-col', 'position: absolute;  right: 3px;');
          StyleSheetHandler.createCSSSelector('.main-col', 'z-index: 100; left:0px; right:0px');

          updateStyles();
        }
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
