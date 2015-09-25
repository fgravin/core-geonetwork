(function() {
  goog.provide('sxt_viewer_directive');

  var module = angular.module('sxt_viewer_directive', []);

  /**
   * @ngdoc directive
   * @name gn_viewer.directive:gnMainViewer
   * @deprecated Use gnRegionPicker instead
   *
   * @description
   */
  module.directive('sxtMainViewer', [
    'gnMap',
    'gnSearchLocation',
    'gnConfig',
    function(gnMap, gnSearchLocation, gnConfig) {
      return {
        restrict: 'A',
        replace: true,
        scope: true,
        templateUrl: '../../catalog/views/sextant/mapviewer/mainviewer.html',
        compile: function compile(tElement, tAttrs, transclude) {
          return {
            pre: function preLink(scope, iElement, iAttrs, controller) {
              scope.map = scope.$eval(iAttrs['map']);

              /** Define object to receive measure info */
              scope.measureObj = {};

              /** Define vector layer used for drawing */
              scope.drawVector;

              /** print definition */
              scope.activeTools = {};

              var firstRun = true;
              scope.handleTabParsing = function() {
                if (!firstRun) { return; }
                firstRun = false;
                scope.layerTabs.legend.active = false;
              };

              scope.zoom = function(map, delta) {
                gnMap.zoom(map, delta);
              };
              scope.zoomToMaxExtent = function(map) {
                map.getView().fitExtent(map.getView().
                    getProjection().getExtent(), map.getSize());
              };
              scope.ol3d = null;

              // 3D mode is allowed and disabled by default
              scope.is3DModeAllowed = gnConfig['map.is3DModeAllowed'] || false;
              scope.is3dEnabled = gnConfig['is3dEnabled'] || false;



              scope.init3dMode = function(map) {
                if (map) {
                  scope.ol3d = new olcs.OLCesium({map: map});
                } else {
                  console.warning('3D mode can be only by activated' +
                    ' on a map instance.');
                }
              };
              scope.switch2D3D = function(map) {
                if (scope.ol3d === null) {
                  scope.init3dMode(map);
                }
                scope.ol3d.setEnabled(
                  scope.is3dEnabled = !scope.ol3d.getEnabled());
              };
              // Turn off 3D mode when not using it because
              // it slow down the application.
              // TODO: improve
              scope.$on('$locationChangeStart', function() {
                if (!gnSearchLocation.isMap() && scope.is3dEnabled) {
                  scope.switch2D3D(scope.map);
                }
              });

              var div = document.createElement('div');
              div.className = 'overlay';
              var overlay = new ol.Overlay({
                element: div,
                positioning: 'bottom-left'
              });
              scope.map.addOverlay(overlay);

              scope.active = {
                tool: false,
                layersTools: false,
                NCWMS: null
              };
              scope.locService = gnSearchLocation;

              var activeTab = null;
              scope.layerTabSelect = function(tab) {
                if (!scope.active.layersTools) {
                  scope.active.layersTools = true;
                  scope.layerTabs[tab].active = true;
                  activeTab = tab;
                } else if (tab == activeTab) {
                  scope.active.layersTools = false;
                  scope.layerTabs[tab].active = false;
                  activeTab = null;
                  iElement.find('.main-tools').removeClass('sxt-maximize-layer-tools');
                } else {
                  scope.layerTabs[tab].active = true;
                  activeTab = tab;
                }
              };
              scope.loadTool = function(tab) {
                if(scope.isSeparatedTool()) {
                  scope.layerTabs[tab].active = true;
                  scope.active.layersTools = true;
                  activeTab = tab;
                }
                else {
                  scope.layerTabSelect(tab);
                }
              };

              /**
               * Tells if a separated tool (everything but legend/sources/sort)
               * is opened in the tool panel.
               * @returns {boolean}
               */
              scope.isSeparatedTool = function() {
                return activeTab == 'ncwms' || activeTab == 'wps';
              }

            },
            post: function postLink(scope, iElement, iAttrs, controller) {

              iElement.find('.panel-tools .btn-default.close').click(function() {
                scope.active.tool = false;
              });

              //TODO: find another solution to render the map
              setTimeout(function() {
                scope.map.updateSize();
              }, 100);

              scope.map.addControl(new ol.control.ScaleLine({
                target: document.querySelector('footer')
              }));

              scope.map.getLayers().on('remove', function(e) {
                  if(scope.active.NCWMS && scope.active.NCWMS == e.element) {
                    scope.active.NCWMS = null;
                    scope.active.layersTools = false;
                    scope.layerTabs.ncwms.active = false;
                  }
              });

              scope.isNcwms = function(layer) {
                return layer.ncInfo;
              }
            }
          };
        }
      };
    }]);

  module.directive('sxtTool', [ function() {
    return {
      restrict: 'A',
      link: function (scope, element) {
        element.on('click', function() {
          scope.active.tool = !$(this).hasClass('active');
        });
      }
    }
  }]);

  module.directive('sxtCloseTool', [ function() {
    return {
      restrict: 'A',
      link: function (scope, element) {
        element.on('click', function() {
          scope.$apply(function() {
            scope.active.tool = false;
          });
        });
      }
    }
  }]);

  module.directive('sxtMousePosition', [ function() {
    return {
      restrict: 'A',
      templateUrl: '../../catalog/views/sextant/templates/mouseposition/mouseposition.html',
      link: function (scope, element) {
        scope.projection = 'EPSG:4326';

        var control = new ol.control.MousePosition({
          projection: 'EPSG:4326',
          coordinateFormat: function(c) {
            return c.map(function(i) { return i.toFixed(3) });
          },
          target: element[0]
        });
        scope.map.addControl(control);
        scope.setProjection = function() {
          control.setProjection(ol.proj.get(scope.projection));
        }
      }
    }
  }]);

  module.directive('sxtFullScreen', [ function() {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var map = scope.$eval(attrs['sxtFullScreen']);
        // FIXME: which element to maximize??
        var elem = $('[sxt-main-viewer]')[0];
        element.on('click', function() {
          if (!document.fullscreenElement && !document.mozFullScreenElement &&
            !document.webkitFullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            }
          } else {
            if (document.cancelFullScreen) {
              document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
              document.webkitCancelFullScreen();
            }
          }
        });
      }
    }
  }]);

  module.directive('sxtPopoverDropdown', [ '$timeout', function($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
          var content = element.find('ul').css('display', 'none');
          var button = element.find('.dropdown-toggle');

          $timeout(function() {
            var className = (attrs['fixedHeight'] != 'false')  ?
                'popover-dropdown popover-dropdown-'+content.find('li').length : '' ;
            button.popover({
              animation: false,
              container: '.gn',
              placement: attrs['placement'] || 'right',
              content: ' ',
              template: '<div class="popover ' + className + '">' +
                '<div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
            });
          }, 1);

          button.on('shown.bs.popover', function() {
            var $tip = button.data('bs.popover').$tip;
            content.css('display', 'inline').appendTo(
              $tip.find('.popover-content')
            );
          });
          button.on('hidden.bs.popover', function() {
            content.css('display', 'none').appendTo(element);
          });

          // can’t use dismiss boostrap option: incompatible with opacity slider
          $('body').on('mousedown click', function(e) {
            if ( (button.data('bs.popover') && button.data('bs.popover').$tip)
                && (button[0] != e.target)
                && (!$.contains(button[0], e.target))
                && ($(e.target).parents('.popover')[0] != button.data('bs.popover').$tip[0])) {
              $timeout(function(){
                button.popover('hide');
              }, 30);
            }
          });

          if (attrs['sxtPopoverDismiss']) {
            $(attrs['sxtPopoverDismiss']).on('scroll', function(){
              button.popover('hide');
            });
          }

      }
    }
  }]);

  module.directive('sxtSelect', [ '$timeout', function($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        $timeout(function(){
          element.selectpicker();
        }, 0);
      }
    }
  }]);

  module.directive('gnvLayermanagerBtn', ['$timeout',
    function($timeout) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {

          var toggleLayer = attrs['gnvLayermanagerBtn'] === 'true';
          var buttons = element.find('.btn-group.flux button');
          buttons.bind('click', function() {
            buttons.removeClass('active');
            element.addClass('active');
            $(this).addClass('active');
            if (toggleLayer) element.find('.layers').addClass('collapsed');
            element.find('.panel-carousel').removeClass('collapsed');
            element.find('.unfold').css('opacity', 1);
            element.find('.panel-carousel-container').css('left',
                '-' + ($(this).index() * 100) + '%');
          });


          element.find('.unfold').click(function() {
            element.find('.btn-group button').removeClass('active');
            if (toggleLayer) element.find('.layers').removeClass('collapsed');
            element.find('.panel-carousel').addClass('collapsed');
            element.find('.unfold').css('opacity', 0);
          });

          // Select the first menu when loaded
          $timeout(function() {
            if (buttons.get(0)) {
              buttons.get(0).click();
            }
          });
        }
      };
    }]);


})();