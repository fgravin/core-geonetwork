(function () {
  goog.provide('gn_ncwms_directive');

  var module = angular.module('gn_ncwms_directive', [
  ]);

  /**
   * @ngdoc directive
   * @name gn_ncwms_directive.directive:gnMainViewer
   * @deprecated Use gnRegionPicker instead
   *
   * @description
   */
  module.directive('gnNcwmsTransect', [
      'gnHttp',
      'gnNcWms',
      'gnPopup',
    function (gnHttp, gnNcWms, gnPopup) {
      return {
        restrict: 'A',
        scope: {
          layer: '=',
          map:'='
        },
        templateUrl: '../../catalog/components/viewer/ncwms/' +
          'partials/ncwmstools.html',
        link: function (scope, element, attrs) {

          var drawInteraction, featureOverlay;
          var map = scope.map;

          /**
           * Just manage active button in ui.
           * Values of activeTool can be 'time', 'profile', 'transect'
           * @param activeTool
           */
          scope.setActiveTool = function(activeTool) {
            if(scope.activeTool == activeTool) {
              scope.activeTool = undefined;
            } else {
              scope.activeTool = activeTool;
            }
            activateInteraction(scope.activeTool);
          };

          var resetInteraction = function() {
            if(featureOverlay) {
              featureOverlay.setMap(null);
              delete featureOverlay;
            }
            if(drawInteraction) {
              scope.map.removeInteraction(drawInteraction);
              delete drawInteraction;
            };
          };

          var activateInteraction = function(activeTool) {
            if(!activeTool) {
              resetInteraction();
            }
            else {
              var type = 'Point';
              if(activeTool == 'transect') {
                type = 'LineString';
              }

              if(!featureOverlay) {
                featureOverlay = new ol.FeatureOverlay();
                featureOverlay.setMap(scope.map);
              }
              if(drawInteraction) {
                scope.map.removeInteraction(drawInteraction);
              }

              drawInteraction = new ol.interaction.Draw({
                features: featureOverlay.getFeatures(),
                type: type
              });

              drawInteraction.on('drawend',
                  function(evt) {

                    gnPopup.create({
                      title: activeTool,
                      url : gnNcWms.getNcwmsServiceUrl(
                          scope.layer,
                          scope.map.getView().getProjection(),
                          evt.feature.getGeometry().getCoordinates(),
                          activeTool),
                      content: '<div class="gn-popup-iframe" style="width:400px">' +
                          '<iframe frameBorder="0" border="0" style="width:100%;height:100%;" src="{{options.url}}" ></iframe>' +
                          '</div>'
                    });
                    scope.$apply(function() {
                      scope.activeTool = undefined;
                    });
                  }, this);

              scope.map.addInteraction(drawInteraction);
            }
          };
          var disableInteractionWatchFn = function(nv, ov) {
            if(!nv) {
              resetInteraction();
              scope.activeTool = undefined;
            }
          };
          scope.$watch('layer.showInfo', disableInteractionWatchFn);
          scope.$watch('layer.visible', disableInteractionWatchFn);
          scope.$watch('layer', disableInteractionWatchFn);

          /**
           * init source layer params object
           */
          var initNcwmsParams = function() {

            scope.params = scope.layer.getSource().getParams() || {};

            scope.colorRange = {
              step: 1
            };
            scope.timeSeries = gnNcWms.parseTimeSeries(gnNcWms.getDimensionValue(scope.layer.ncInfo, 'time'));
            scope.elevations = gnNcWms.getDimensionValue(scope.layer.ncInfo, 'elevation').split(',');


            // Get maxExtent color ranges
            gnNcWms.getColorRangesBounds(scope.layer,
                scope.layer.ncInfo.EX_GeographicBoundingBox.join(',')).success(function(data) {

                  var min = Number((data.min).toFixed(5));
                  var max = Number((data.max).toFixed(5));

                  angular.extend(scope.colorRange, {min: min, max: max});
                  scope.colorscalerange = [min, max];
                  scope.onColorscaleChange(scope.colorscalerange);
            });

            if(angular.isUndefined(scope.params.LOGSCALE)) {
              scope.params.LOGSCALE = false;
            }
          };

          /**
           *  Get bounds of color range depending on the current extent.
           *  Called when user wlick on 'auto' button.
           *  Update the slider values to this bounds.
           */
          scope.setAutoColorranges = function(evt) {
            $(evt.target).addClass('fa fa-spinner');
            gnNcWms.getColorRangesBounds(scope.layer,
                ol.proj.transform(map.getView().calculateExtent(map.getSize()),
                    map.getView().getProjection(), 'EPSG:4326').join(',')).success(function(data) {
                  scope.colorscalerange = [data.min, data.max];
                  scope.onColorscaleChange(scope.colorscalerange);
                  $(evt.target).removeClass('fa fa-spinner');
                });
          };

          /**
           * Call when the input of the double slider get change.
           * The input is an array of 2 values. It updates the layer
           * with `COLORSCALERANGE` params and refreshes it.
           * @param v the colorange array
           */
          scope.onColorscaleChange = function(v) {
            if(angular.isArray(v) && v.length == 2) {
              colorange = v[0] + ',' + v[1];
              scope.params.COLORSCALERANGE = colorange;
              scope.updateLayerParams();}
          };

          scope.updateLayerParams = function() {
            scope.layer.getSource().updateParams(scope.params);
          };

          initNcwmsParams();
        }
      };
    }]);
})();
