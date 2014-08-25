(function () {
  goog.provide('gn_localisation_directive');

  var module = angular.module('gn_localisation_directive', [
  ]);

  /**
   * @ngdoc directive
   * @name gn_localisation.directive:gnLocalisationInput
   *
   * @description
   * Panel to load WMS capabilities service and pick layers.
   * The server list is given in global properties.
   */
  module.directive('gnLocalisationInput', ['$timeout',
    function ($timeout) {
    return {
      restrict: 'A',
      require: 'gnLocalisationInput',
      replace: true,
      templateUrl: '../../catalog/components/viewer/localisation/' +
        'partials/localisation.html',
      scope: {
        map: '='
      },
      controllerAs: 'locCtrl',
      controller: ['$scope', '$http', 'gnGetCoordinate', function($scope, $http, gnGetCoordinate){

        var zoomTo = function(extent, map) {
          map.getView().fitExtent(extent, map.getSize());
        };
        this.onClick = function(loc, map) {
          zoomTo(loc.extent,map);
          $scope.query = loc.name;
          $scope.collapsed = true;
        };

        /**
         * Request geonames search. Trigger when user changes
         * the search input.
         *
         * @param query string value of the search input
         */
        this.search = function(query) {
          if(query.length < 3) return;

          var coord = gnGetCoordinate($scope.map.getView().getProjection().getExtent(), query);

          if(coord) {
            function moveTo(map, zoom, center) {
              var view = map.getView();

              view.setZoom(zoom);
              view.setCenter(center);
            }
            moveTo($scope.map, 5, ol.proj.transform(coord, 'EPSG:4326', 'EPSG:3857'));
            return;
          }

          var url = 'http://api.geonames.org/searchJSON';
          $http.get(url, {
            params: {
              featureClass:'P',
              lang:'en',
              style:'full',
              type:'json',
              maxRows:5,
              name_startsWith:query,
              username:'georchestra'
            }
          }).
          success(function(response) {
            var loc;
            $scope.results = [];
            for(var i=0;i<response.geonames.length;i++) {
              loc = response.geonames[i];
              $scope.results.push({
                name: loc.toponymName,
                region: loc.adminName1,
                country: loc.countryName,
                extent: ol.proj.transform([loc.bbox.west, loc.bbox.south, loc.bbox.east, loc.bbox.north], 'EPSG:4326', 'EPSG:3857')
              });
            }
          });
        };
      }],
      link: function (scope, element, attrs, ctrl) {

        /** localisation text query */
        scope.query = '';

        scope.collapsed = true;

        /** default localisation */
        scope.localisations = [{
          name: 'United States',
          extent: [-13884991, 2870341, -7455066, 6338219]
        }, {
          name: 'France',
          extent: [-13884991, 2870341, -7455066, 6338219]
        }];

        /** Clear input and search results */
        scope.clearInput = function() {
          scope.query = '';
          scope.results = [];

        };

        // Bind events to display the dropdown menu
        element.find('input').bind('focus', function(evt) {
          scope.$apply(function() {
            ctrl.search(scope.query);
            scope.collapsed = false;
          });
        });
      }
    };
  }]);
})();
