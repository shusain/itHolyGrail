(function(){
  'use strict';

  angular.module('debugModule', [])

  .factory('RecursionHelper', ['$compile', function($compile){
    return {
      /**
       * Manually compiles the element, fixing the recursion loop.
       * @param element
       * @param [link] A post-link function, or an object with function(s) registered via pre and post properties.
       * @returns An object containing the linking functions.
       */
      compile: function(element, link){
        // Normalize the link parameter
        if(angular.isFunction(link)){
          link = { post: link };
        }

        // Break the recursion loop by removing the contents
        var contents = element.contents().remove();
        var compiledContents;
        return {
          pre: (link && link.pre) ? link.pre : null,
          /**
           * Compiles and re-adds the contents
           */
          post: function(scope, element){
            // Compile the contents
            if(!compiledContents){
              compiledContents = $compile(contents);
            }
            // Re-add the compiled contents to the element
            compiledContents(scope, function(clone){
              element.append(clone);
            });

            // Call the post-linking function, if any
            if(link && link.post){
              link.post.apply(null, arguments);
            }
          }
        };
      }
    };
  }])

  .directive('debugPanel', function(){
    return {
      restrict:'E',
      scope: { options: '=' },
      templateUrl:'component/templates/debugPanel.tpl.html'
    };
  })

  .directive('optionsForm', function(RecursionHelper){
    
    return {
      restrict:'E',
      scope: {
        options:'='
      },
      templateUrl:'component/templates/optionsForm.tpl.html',
      compile: function(element){
        return RecursionHelper.compile(element, function(scope){
          scope.isObject = function(thingToCheck){
            return angular.isObject(thingToCheck);
          };
          scope.getType = function(thingToCheck){
            if(angular.isArray(thingToCheck))
              return 'Array';
            if(angular.isObject(thingToCheck))
              return 'Object';
            if(typeof thingToCheck === 'boolean')
              return 'Boolean';
            return 'Default';
          };
        });
      }
    };
  })
  // From the docs
  .directive('myDraggable', function($document) {
    return function(scope, element) {
      var startX = 0, startY = 0, x = 0, y = 0;

      element.css({
       position: 'relative',
       border: '1px solid red',
       backgroundColor: 'lightgrey',
       padding:'10px',
       borderRadius: '10px',
       cursor: 'pointer'
      });

      element.on('mousedown', function(event) {
        // Prevent default dragging of selected content
        event.preventDefault();
        startX = event.pageX - x;
        startY = event.pageY - y;
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });

      function mousemove(event) {
        y = event.pageY - startY;
        x = event.pageX - startX;
        element.css({
          top: y + 'px',
          left:  x + 'px'
        });
      }

      function mouseup() {
        $document.off('mousemove', mousemove);
        $document.off('mouseup', mouseup);
      }
    };
  }).directive('blockMouseDown', function(){
    return {
      restrict:'A',
      link:function(scope, iElem){
        iElem.on('mousedown', function(event){
          event.stopImmediatePropagation();
        });
      }
    };
  });

  /**
  * itHolyGrail Module
  *
  * Description
  */

  var mod = angular.module('itHolyGrail', ['debugModule'])

  .service('StyleSheetHandler', function(){
    var StyleSheetHandler = {};

    StyleSheetHandler.createStyleSheet = function(){
      if(!document.styleSheets) {
        return;
      }

      if(document.getElementsByTagName('head').length === 0) {
        return;
      }

      var styleSheet;
      var GEN_ID = 'generated';

      var styleSheetElement = document.createElement('style');
      styleSheetElement.type = 'text/css';
      styleSheetElement.title = GEN_ID;

      document.getElementsByTagName('head')[0].appendChild(styleSheetElement);

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

      return {mediaType:typeof styleSheet.media, styleSheet:styleSheet};
    };

    StyleSheetHandler.findEnabledScreenStylesheet = function(){
      var styleSheet,mediaType;
      if(!document.styleSheets) {
        return;
      }

      if(document.getElementsByTagName('head').length === 0) {
        return;
      }
      //If there are existing stylesheets
      if(document.styleSheets.length > 0) {

        //Iterate through them
        for( var i = 0; i < document.styleSheets.length; i++) {
          //If a stylesheet is disabled skip this iteration
          if(document.styleSheets[i].disabled) {
            continue;
          }
          //Get the media from the current stylesheet
          var media = document.styleSheets[i].media;
          mediaType = typeof media;

          //Check the media type (must vary between browsers)
          if(mediaType == 'string') {
            //Check that the media target, if it targets the screen use it
            if(media === '' || (media.indexOf('screen') != -1)) {
              styleSheet = document.styleSheets[i];
            }
          } else if(mediaType == 'object') {
            if(media.mediaText === '' || (media.mediaText.indexOf('screen') != -1)) {
              styleSheet = document.styleSheets[i];
            }
          }

          //If we have found a usable stylesheet during this iteration exit the loop
          if( typeof styleSheet != 'undefined') {
            return styleSheet;
          }
        }
      }
    };

    StyleSheetHandler.createCSSSelector = function(selector, style){
      var styleSheet = StyleSheetHandler.baseStyleSheet.styleSheet;
      var mediaType = StyleSheetHandler.baseStyleSheet.mediaType;
      var i = 0;

      //Finally after we have the stylesheet to use we need to add the new rule appropriately
      //this searches for an existing matching rule
      if(mediaType == 'string') {
        for(i = 0; i < styleSheet.rules.length; i++) {
          if(styleSheet.rules[i].selectorText && styleSheet.rules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
            styleSheet.rules[i].style.cssText = style;
            return;
          }
        }

        //If we didn't find a matching rule we add the rule
        styleSheet.addRule(selector, style);

      } else if(mediaType == 'object') {
        for(i = 0; i < styleSheet.cssRules.length; i++) {
          if(styleSheet.cssRules[i].selectorText && styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
            styleSheet.cssRules[i].style.cssText = style;
            return;
          }
        }

        //Again but for other browsers if we didn't find the rule we add a new rule
        styleSheet.insertRule(selector + '{' + style + '}', styleSheet.cssRules.length);
      }
    };

    StyleSheetHandler.baseStyleSheet = StyleSheetHandler.createStyleSheet();

    return StyleSheetHandler;

  })
  
  .directive('holyGrail', function($window, $timeout, StyleSheetHandler){
    // Constants for the padding arrays
    var TOP = 0;
    var RIGHT = 1;
    var BOTTOM = 2;
    var LEFT = 3;

    return {
      restrict:'E',
      scope:{
        layoutConfig:'='
      },
      controller:function($scope){
        // Keep a list of all the child panels we want to have access
        // to directly from this directive.
        $scope.panels = {};
        
        this.addPanel = function(name, panel){
          $scope.panels[name] = panel;
        };
      },
      link:function(scope, element){

        var defaultBody = {
          // Height calculated
          padding: ['9px', '9px', '9px', '9px']
        };
        
        var defaultHeadAndFoot = {
          show:true,
          height: '60px',
          padding: ['9px', '9px', '9px', '9px']
        };

        var layoutConfig={
          westCol: {
            width: '20%',
            minWidth: '60px',
            maxWidth: '400px',
            show: true,
            head:angular.copy(defaultHeadAndFoot),
            body:angular.copy(defaultBody),
            foot:angular.copy(defaultHeadAndFoot)
          },
          mainCol: {
            // width: CALCULATED BASED ON REMAINDER
            head:angular.copy(defaultHeadAndFoot),
            body:angular.copy(defaultBody),
            foot:angular.copy(defaultHeadAndFoot)
          },
          eastCol: {
            width: '20%',
            minWidth: '60px',
            maxWidth: '400px',
            show: true,
            head:angular.copy(defaultHeadAndFoot),
            body:angular.copy(defaultBody),
            foot:angular.copy(defaultHeadAndFoot)
          },
          outsideBorder: '10px',
          insideBorder: '5px',
          transition: 'all ease-in .1s'
        };

        angular.extend(layoutConfig, scope.layoutConfig);

        // CC is used for the calculated config, used a short name
        // since it is referenced a lot for determinig the layout.
        // The calculated config contains objects with percentages
        // and pixel sizes in CSS normalized into pixel size in numbers.
        var cc = {};
        
        // Some aliases to the parts of the cc for further condensing the code

        // cc.westCol
        var wc;
        // cc.eastCol
        var ec;
        // cc.mainCol
        var mc;

        var lc = layoutConfig;

        // Function determines all the pixel sizes as Numbers based on the
        // string input, converts each based on the percentage or the value
        // supplied.
        function _calcPixelSizes(inputObj, resultObj){
          _.forOwn(inputObj, function(value, key, obj){
            if(key == 'width'){
              resultObj[key] = determinePixelSize(obj); 
            }
            else if(angular.isArray(value)){
              resultObj[key] = [];
              _.forEach(value, function(item){
                resultObj[key].push(normalizePercentAndPixel(item));
              });
            }
            else if(angular.isString(value)) {
              resultObj[key] = normalizePercentAndPixel(value);
            }
            else if(angular.isObject(value)){
              resultObj[key] = {};
              _calcPixelSizes(value, resultObj[key]);
            }
            else /* if(typeof value === 'boolean') passing through any other type currently only boolean*/{
              resultObj[key] = value;
            }
          });
        }


        // Prepares the calculated config object for use in the setting of styles.
        // Initially the numbers are needed to calculate positions but then for
        // applying the values to the stylesheet the values need 'px' appended.
        function processCalculatedConfig(inputObj, resultObj){
          _.forOwn(inputObj, function(value, key){
            if(key == 'padding'){
              resultObj.padding = value[TOP]+'px '+value[RIGHT]+'px '+value[BOTTOM]+'px '+value[LEFT]+'px'; 
            }
            else if(angular.isObject(value)){
              resultObj[key] = {};
              processCalculatedConfig(value, resultObj[key]);
            }
            else if(typeof value === 'boolean'){
              // Dropping boolean values
            }
            else{
              resultObj[key] = value+'px';
            }
          });
        }
        
        // Wrapper function for calling the recursive _calcPixelSizes afterwards
        //sets up some aliases to parts of the calculated configuration
        function calcPixelSizes(inputObj, resultObj){
          _calcPixelSizes(inputObj, resultObj);
          
          console.log(resultObj);

          mc = cc.mainCol;
          wc = cc.westCol;
          ec = cc.eastCol;
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

        // Takes a string argument and checks for  %, if it's present then it
        // interprets the input using parseInt and does the calculation based
        // on the height of the element this directive is used on.
        // If no percentage is found and parseInt returns something other than
        // NaN, the parsed number is returned, if parseInt returns NaN for the
        // input, 0 is returned.
        function normalizePercentAndPixel(stringValue){
          var parsed = parseInt(stringValue);
          if(stringValue.indexOf('%')!=-1)
            return parsed/100*element[0].offsetWidth;
          else
          {
            if(!isNaN(parsed))
              return parsed;
            return 0;
          }
        }

        function recalcSizes(){
          console.log('lc',scope.layoutConfig);
          angular.extend(layoutConfig, scope.layoutConfig);
          calcPixelSizes(lc, cc);
          updateStyles();
        }
        
        function getPanelsStyles(panelName){
          return scope.panels[panelName][0].style;
        }

        function assignPanelStyles(panelNames, styles){
          _.forEach(panelNames, function(onePanel){
            angular.extend(getPanelsStyles(onePanel), styles);
          });
        }

        function updateStyles() {
          if(!wc)
            return;

          
          // For each of the columns need to determine for each of the three panels the values for the
          // position and size of each panel based on the show booleans.

          // Calculate West Column Values
          wc.foot.width =
          wc.body.width =
          wc.head.width = wc.width;

          ec.foot.width =
          ec.body.width =
          ec.head.width = ec.width;

          wc.head.top = 
          wc.head.left =
          wc.body.top =
          wc.body.left =
          wc.body.bottom =
          wc.foot.left =
          wc.foot.bottom =
          mc.head.top =
          mc.foot.bottom =
          mc.body.top =
          mc.body.right =
          mc.body.bottom =
          mc.body.left =
          ec.head.top =
          ec.head.right =
          ec.body.right =
          ec.body.top =
          ec.body.bottom =
          ec.foot.right =
          ec.foot.bottom = cc.outsideBorder;
          

          function calcVPositions(panel, body, property){
            if(panel.show){
              body[property] = cc.outsideBorder+panel.height+panel.padding[TOP]+panel.padding[BOTTOM]+cc.insideBorder;
            }
            else {
              panel[property] = -(cc.outsideBorder+panel.height+panel.padding[TOP]+panel.padding[BOTTOM]);
            }            
          }

          function calcHPositions(panel, sibling, property){
            panel[property] = cc.outsideBorder + sibling.width + sibling.padding[LEFT]+sibling.padding[RIGHT] + cc.insideBorder;
          }

          // West column calculate top and bottom for panel and body
          calcVPositions(wc.head,wc.body,'top');
          calcVPositions(wc.foot,wc.body,'bottom');

          // Main column calculate top and bottom for panel and body
          calcVPositions(mc.head,mc.body,'top');
          calcVPositions(mc.foot,mc.body,'bottom');
          
          // East column calculate top and bottom for panel and body
          calcVPositions(ec.head,ec.body,'top');
          calcVPositions(ec.foot,ec.body,'bottom');
            
          // Main column head caclulate left and right
          calcHPositions(mc.head, wc.head, 'left');
          calcHPositions(mc.head, ec.head, 'right');

          // Main column body caclulate left and right
          calcHPositions(mc.body, wc.body, 'left');
          calcHPositions(mc.body, ec.body, 'right');

          // Main column foot caclulate left and right
          calcHPositions(mc.foot, wc.foot, 'left');
          calcHPositions(mc.foot, ec.foot, 'right');


          // Create a new object to populate with all the values including the
          // 'px' prefix on all the values so they can be applied as styles
          var pcc = {};
          processCalculatedConfig(cc,pcc);
          console.log('processed', pcc);

          assignPanelStyles(['westHead'], pcc.westCol.head);
          assignPanelStyles(['westBody'], pcc.westCol.body);
          assignPanelStyles(['westFoot'], pcc.westCol.foot);

          assignPanelStyles(['eastHead'], pcc.eastCol.head);
          assignPanelStyles(['eastBody'], pcc.eastCol.body);
          assignPanelStyles(['eastFoot'], pcc.eastCol.foot);

          assignPanelStyles(['mainHead'], pcc.mainCol.head);
          assignPanelStyles(['mainBody'], pcc.mainCol.body);
          assignPanelStyles(['mainFoot'], pcc.mainCol.foot);
         
          //Delaying adding the transition so it's not seen on first load
          $timeout(function(){
            /*****************************************************( Transition )*/
            StyleSheetHandler.createCSSSelector('.head-row, .body-row, .foot-row', 'transition:'+lc.transition+';');
          });
        }

        // If the config changes or the window is resized, recalculate the
        // positions and sizes of the panels
        scope.$watch('layoutConfig', recalcSizes, true);
        angular.element($window).bind('resize', recalcSizes);

        // On document ready initialize base values for CSS
        angular.element(document).ready(setup);

        function setup(){
          calcPixelSizes(lc, cc);
          updateStyles();

        }
      }
    };
  });

  function createPanelDirectives(){

    function makeDirective(name){
      mod.directive(name, function(){
        return{
          restrict:'C',
          require: '^holyGrail',
          link: function (scope, element, attr, holyGrailCtrl) {
            holyGrailCtrl.addPanel(name, element);
          }
        };
      });
    }
    
    var panels = ['westBody', 'westHead', 'westFoot', 'eastBody', 'eastHead', 'eastFoot', 'mainBody', 'mainHead', 'mainFoot'];

    for (var i = panels.length - 1; i >= 0; i--) {
      var curPanel = panels[i];
      makeDirective(curPanel);
    }
  }
  createPanelDirectives();

})();
