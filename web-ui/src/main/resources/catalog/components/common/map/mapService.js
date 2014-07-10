(function() {
  goog.provide('gn_map_service');


  var module = angular.module('gn_map_service', [
    'go'
  ]);

  module.provider('gnMap', function() {
    this.$get = [
      'goDecorateLayer',
      'gnConfig',
      function(goDecorateLayer, gnConfig) {

        var defaultMapConfig = {
          'useOSM': 'true',
          'projection': 'EPSG:3857',
          'projectionList': [{
            'code': 'EPSG:4326',
            'label': 'WGS84 (EPSG:4326)'
          },{
            'code': 'EPSG:3857',
            'label': 'Google mercator (EPSG:3857)'
          }]
        };

        return {

          importProj4js: function() {
            Proj4js.defs['EPSG:3857'] = Proj4js.defs['EPSG:900913'];
            if (Proj4js && gnConfig['map.proj4js'] &&
                angular.isArray(gnConfig['map.proj4js'])) {
              angular.forEach(gnConfig['map.proj4js'], function(item) {
                Proj4js.defs[item.code] = item.value;
              });
            }
          },

          /**
           * Reproject a given extent. Extent is an object
           * defined as
           * {left,bottom,right,top}
           *
           */
          reprojExtent: function(extent, src, dest) {
            if (src == dest || extent === null) {
              return extent;
            }
            else {
              return ol.proj.transform(extent,
                  src, dest);
            }
          },

          isPoint: function(extent) {
            return (extent[0] == extent[2] &&
                extent[1]) == extent[3];
          },

          getPolygonFromExtent: function(extent) {
            return [
                    [
                     [extent[0], extent[1]],
                     [extent[0], extent[3]],
                     [extent[2], extent[3]],
                     [extent[2], extent[1]]
              ]
            ];
          },

          /**
           * Convert coordinates object into text
           *
           * @param coord must be an array of points (array with
           * dimension 2) or a point
           * @returns coordinates as text with format : 'x1 y1,x2 y2,x3 y3'
           */
          getTextFromCoordinates: function(coord) {
            var text;

            var addPointToText = function(point) {
              if(text) {
                text += ',';
              }
              else {
                text = '';
              }
              text += point[0] + ' ' + point[1];
            };

            if(angular.isArray(coord) && coord.length > 0) {
              if(angular.isArray(coord[0])) {
                for(var i=0;i<coord.length;++i) {
                  var point = coord[i];
                  if(angular.isArray(point) && point.length == 2) {
                    addPointToText(point);
                  }
                }
              } else if(coord.length == 2) {
                addPointToText(coord);
              }
            }
            return text;
          },

          getMapConfig: function() {
            if (gnConfig['map.config'] &&
                angular.isObject(gnConfig['map.config'])) {
              return gnConfig['map.config'];
            } else {
              return defaultMapConfig;
            }
          },

          getLayersFromConfig: function() {
            var conf = this.getMapConfig();
            var source;

            if (conf.useOSM) {
              source = new ol.source.OSM();
            }
            else {
              source = new ol.source.TileWMS({
                url: conf.layer.url,
                params: {'LAYERS': conf.layer.layers,
                  'VERSION': conf.layer.version}
              });
            }
            return new ol.layer.Tile({
              source: source
            });
          },

          /**
           * Check if the extent is valid or not.
           */
          isValidExtent: function(extent) {
            var valid = true;
            if (extent && angular.isArray(extent)) {
              angular.forEach(extent, function(value, key) {
                if (!value || value == Infinity || value == -Infinity) {
                  valid = false;
                }
              });
            }
            else {
              valid = false;
            }
            return valid;
          },

          /**
           * Transform map extent into dublin-core schema for
           * dc:coverage metadata element.
           * Ex :
           * North 90, South -90, East 180, West -180
           * or
           * North 90, South -90, East 180, West -180. Global
           */
          getDcExtent: function(extent) {
            if (angular.isArray(extent)) {
              var dc = 'North ' + extent[3] + ', ' +
                  'South ' + extent[1] + ', ' +
                  'East ' + extent[0] + ', ' +
                  'West ' + extent[2];
              if (location) {
                dc += '. ' + location;
              }
              return dc;
            } else {
              return '';
            }
          },

          addWmsToMap : function(map, layerParams, layerOptions, index) {
            var createWmsLayer = function(params, options, index) {
              options = options || {};

              var source = new ol.source.TileWMS({
                params: params,
                url: options.url,
                extent: options.extent,
                ratio: options.ratio || 1
              });

              var layer = new ol.layer.Tile({
                url: options.url,
                type: 'WMS',
                opacity: options.opacity,
                visible: options.visible,
                source: source
              });
              // TODO : move this into layer definition (maybe into an object)
              goDecorateLayer(layer);
              layer.preview = options.preview;
              layer.label = options.label;
              layer.displayInLayerManager = true;
              layer.legend = options.legend;
              layer.attribution = options.attribution;
              return layer;
            };

            var olLayer = createWmsLayer(layerParams, layerOptions);
            if (index) {
              map.getLayers().insertAt(index, olLayer);
            } else {
              map.addLayer(olLayer);
            }
            return olLayer;
          }
        };
      }];
  });

  module.provider('gnLayerFilters', function() {
    this.$get = function() {
      return {
        /**
         * Filters out background layers, preview
         * layers, draw, measure.
         * In other words, all layers that
         * were actively added by the user and that
         * appear in the layer manager
         */
        selected: function(layer) {
          return layer.displayInLayerManager;
        }
      };
    };
  });


})();
