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
    function ($scope,
      $http,
      $element,
      gnSearchSettings,
      gnMap,
      gnSearchLocation) {
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

        console.log('starting view services lookup...');

        // do a request to find related services
        $http.get('../api/records/' + metadata.getUuid() +
          '/related?type=services').then(function (response) {
          var relatedServices = response.data.services || [];
          var uuidList = relatedServices.map(function (s) {
            return s.id;
          }).join(' or ');

          // we have the related services: check the ones that have WMS
          $http.get('q?_content_type=json&fast=index&_uuid=' + uuidList)
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

              console.log('found view services: ', metadata.relatedViewServices);
            });
        });
      };

      // this will switch to the viewer and add all found view services
      this.addAllServices = function () {
        var services = me.metadata.relatedViewServices;
        if (!services || !services.length || !gnSearchSettings.viewerMap) {
          return;
        }
        services.forEach(function (service) {
          gnMap.addWmsFromScratch(gnSearchSettings.viewerMap,
            service.url, service.name,
            false, me.metadata);
        });
        gnSearchLocation.setMap();
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
