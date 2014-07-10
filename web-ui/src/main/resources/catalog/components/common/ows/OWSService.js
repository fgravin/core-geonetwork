(function () {
  goog.provide('gn_ows_service');


  var module = angular.module('gn_ows_service', [
  ]);

  module.provider('gnOwsCapabilities', function () {
    this.$get = ['$http', 'gnUrlUtils', '$q',
      function ($http, gnUrlUtils, $q) {

        var displayFileContent = function (data) {
          var layers = [];
          var layerSelected = null; // the layer selected on user click
          var layerHovered = null; // the layer when mouse is over it

          try {
            var parser = new ol.parser.ogc.WMSCapabilities();
            var result = parser.read(data);

            // We don't add the root layer node in the list
            for (var i = 0, len = result.capability.layers.length - 1;
                 i < len; i++) {
              var layer = result.capability.layers[i];

              // If the  WMS layer has no name or if it can't be
              // displayed in the current SRS, we don't add it
              // to the list
              if (layer.name) {
                layers.push(layer);
              }
            }
            return result.capability;
          } catch (e) {
            console.log('error parsing WMSCapabilities');
          }

        };
        return {
          getCapabilities: function (url) {
            var defer = $q.defer();
            if (url) {
              //merge URL parameters with default ones
              var parts = url.split('?');
              var urlParams = angular.isDefined(parts[1]) ?
                gnUrlUtils.parseKeyValue(parts[1]) : {};

              var defaultParams = {
                service: 'WMS',
                request: 'getCapabilities'
              };

              for(var p in urlParams){
                defaultParams[p] = urlParams[p];
                if(defaultParams.hasOwnProperty(p.toLowerCase()) &&
                    p != p.toLowerCase()){
                      delete defaultParams.toLowerCase();
                }
              }

              url = gnUrlUtils.append(parts[0],
                gnUrlUtils.toKeyValue(defaultParams));

              //send request and decode result
              if (gnUrlUtils.isValid(url)) {
                var proxyUrl = '../../proxy?url=' + encodeURIComponent(url);
                $http.get(proxyUrl)
                  .success(function (data, status, headers, config) {
                    defer.resolve(displayFileContent(data));
                  })
                  .error(function (data, status, headers, config) {
                    defer.reject(status);
                  });
              }
            }
            return defer.promise;
          },

          getLayerExtentFromGetCap: function (map, getCapLayer) {
            var extent = null;
            var layer = getCapLayer;
            var srsCode = map.getView().getProjection().getCode();

            if (layer.bbox) {
              if (srsCode.toUpperCase() in layer.bbox) {
                extent = layer.bbox[srsCode.toUpperCase()].bbox;
              }
            }
            return extent;
          },

          getLayerInfoFromCap: function(name, capObj) {
            for (var i = 0, len = capObj.layers.length - 1;
                 i < len; i++) {
              if(name == capObj.layers[i].name) {
                return capObj.layers[i];
              }
            }
          }
        }
      }];
  });
})();
