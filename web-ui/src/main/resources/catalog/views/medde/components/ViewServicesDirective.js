/*
 * Copyright (C) 2001-2016 Food and Agriculture Organization of the
 * United Nations (FAO-UN), United Nations World Food Programme (WFP)
 * and United Nations Environment Programme (UNEP)
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or (at
 * your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301, USA
 *
 * Contact: Jeroen Ticheler - FAO - Viale delle Terme di Caracalla 2,
 * Rome - Italy. email: geonetwork@osgeo.org
 */

(function() {

  goog.provide('medde_viewservices');

  var module = angular.module('medde_viewservices', []);

  var viewServicesController = [
    '$scope',
    '$http',
    '$element',
    'gnSearchSettings',
    'gnMap',
    'gnSearchLocation',
    '$timeout',
    function ($scope,
      $http,
      $element,
      gnSearchSettings,
      gnMap,
      gnSearchLocation,
      $timeout) {
      var me = this;

      // watch the presence of related view services
      $scope.$watch('ctrl.metadata', function (metadata) {
        // do a lookup for services if not already done
        if (metadata && !metadata.relatedViewServices) {
          me.lookupViewServices(metadata);
        }
      });

      // adjust class based on the presence of view services
      $scope.$watch(function () {
        if (!me.metadata || !me.metadata.relatedViewServices) {
          return 0;
        }
        return me.metadata.relatedViewServices.length;
      }, function (length) {
        $element.toggleClass('disabled', !length);
      });

      // add view services on the metadata
      this.lookupViewServices = function (metadata) {
        metadata.relatedViewServices = [];
        $scope.$parent.loadingViewServices = true;

        // do a request to find related services
        $http.get('../api/records/' + metadata.getUuid() +
          '/related?type=services').then(function (response) {
          var relatedServices = response.data.services || [];
          var uuidList = relatedServices.map(function (s) {
            return s.id;
          }).join(' or ');

          // we have the related services: check the ones that have WMS
          return $http.get('q?_content_type=json&fast=index&_uuid=' + uuidList)
            .then(function (response) {
              var filteredServices = (response.data.metadata || []).filter(
                function (md) {
                  if (!md.link || !md.link.length) {
                    return false;
                  }
                  var found = false;
                  md.link.forEach(function (link) {
                    found = found || link.indexOf('OGC:WMS') > -1;
                  });
                  return found;
                }
              );

              // we loop on the services to gather url & layer name for wms
              var parentUuid = metadata.getUuid();
              filteredServices.forEach(
                function (service) {
                  if (!service.coupledResources ||
                    !service.coupledResources.length ||
                    !service.containsOperations ||
                    !service.containsOperations.length) {
                    return;
                  }

                  // look for WMS service url
                  var wmsUrl = '';
                  service.containsOperations.forEach(function (operation) {
                    if (operation.operationName.toLowerCase() === 'getmap') {
                      wmsUrl = operation.url;
                      // TODO: check for protocol here
                    }
                  });

                  // look for WMS layers, ie GetMap ops linked to the parent MD
                  var found = false;
                  service.coupledResources.forEach(function (res) {
                    if (res.identifier === parentUuid &&
                      res.operationName.toLowerCase() === 'getmap') {
                      metadata.relatedViewServices.push({
                        name: res.scopedName,
                        url: wmsUrl
                      });
                    }
                  });
                }
              );
            }).finally(function () {
              $scope.$parent.loadingViewServices = false;
            });
        });
      };

      // this will switch to the viewer and add all found view services
      // note: all layers will be set as invisible by default
      this.addAllServices = function () {
        var services = me.metadata.relatedViewServices;
        var map = gnSearchSettings.viewerMap;

        if (!services || !services.length || !map) {
          return;
        }
        services.forEach(function (service) {
          gnMap.addWmsFromScratch(map, service.url, service.name,
            false, me.metadata).then(function (layer) {
              layer.setVisible(false);
            });
        });
        gnSearchLocation.setMap();

        // center on metadata bounding box
        var crs = "EPSG:4326";
        var targetCrs = "EPSG:3857";
        var bbox = gnMap.getBboxFromMd(me.metadata)[0];
        var extent = gnMap.reprojExtent(bbox, crs, targetCrs);
        $timeout(function () {
          map.getView().fit(extent, map.getSize());
        }, 100);

        // open layers panel
        var layersPanel = $('[id=layers]');
        if (layersPanel) {
          $timeout(function() {
            layersPanel.removeClass('force-hide');
          });
        }
      };
    }
  ];

  /**
   * Gathers related services from the metadata and filters the ones which can
   * be displayed in the viewer (currently only WMS).
   * adds a "addAllServices" method to the scope
   */
  module.directive('meddeViewServices', [
    function() {
      return {
        restrict: 'A',
        scope: {
          metadata: '=meddeViewServices'
        },
        controllerAs: 'ctrl',
        bindToController: true,
        controller: viewServicesController,
        link: function (scope, element, attrs) {
          // bind controller method on click
          element.on('click', scope.ctrl.addAllServices);
        }
      };
    }]
  );
})();
