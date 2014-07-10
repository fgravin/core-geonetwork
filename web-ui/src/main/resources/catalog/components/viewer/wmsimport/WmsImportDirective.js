(function () {
  goog.provide('gn_wmsimport_directive');

  var module = angular.module('gn_wmsimport_directive', [
  ]);

  /**
   * @ngdoc directive
   * @name gn_wmsimport_directive.directive:gnWmsImport
   *
   * @description
   * Panel to load WMS capabilities service and pick layers.
   * The server list is given in global properties.
   */
  module.directive('gnWmsImport', [
    'gnOwsCapabilities',
    'gnMap',
    '$translate',
    function (gnOwsCapabilities, gnMap, $translate) {
    return {
      restrict: 'A',
      templateUrl: '../../catalog/components/viewer/wmsimport/' +
        'partials/wmsimport.html',
      scope: {
        map: '=gnWmsImportMap'
      },
      controller: function($scope){
        this.addLayer = function(getCapLayer) {

          var legend;
          if (getCapLayer) {
            var layer = getCapLayer;

            if(angular.isArray(layer.styles) && layer.styles.length > 0) {
              legend = layer.styles[layer.styles.length-1].legend.href;
            }

            return gnMap.addWmsToMap($scope.map, {
                    LAYERS: layer.name
                  }, {
                    url: $scope.url,
                    label: layer.title,
                    attribution: layer.attribution.title,
                    legend: legend,
                    extent: gnOwsCapabilities.getLayerExtentFromGetCap($scope.map, layer)
                  }
              );
          }
        };
      },
      link: function (scope, element, attrs) {

        //TODO: remove
        scope.servicesList = [
          'http://ids.pigma.org/geoserver/wms',
          'http://ids.pigma.org/geoserver/ign/wms',
          'http://www.ifremer.fr/services/wms/oceanographie_physique'
        ];
        scope.url = 'http://www.ifremer.fr/services/wms/oceanographie_physique';

        scope.load = function (url) {
          gnOwsCapabilities.getCapabilities(url)
            .then(function (layers) {
              scope.layers = layers;
            });
        };
      }
    };
  }]);

  /**
   * @ngdoc directive
   * @name gn_wmsimport_directive.directive:gnCapTreeCol
   *
   * @description
   * Directive to manage a collection of nested layers from
   * the capabilities document. This directive works with
   * gnCapTreeElt directive.
   */
  module.directive('gnCapTreeCol', [
    function () {
      return {
        restrict: 'E',
        replace: true,
        scope: {
          collection: '='
        },
        template: "<ul class='list-group'><gn-cap-tree-elt ng-repeat='member in collection' member='member'></gn-cap-tree-elt></ul>"
      }
    }]);

  /**
   * @ngdoc directive
   * @name gn_wmsimport_directive.directive:gnCapTreeElt
   *
   * @description
   * Directive to manage recursively nested layers from a capabilities
   * document. Will call its own template to display the layer but also
   * call back the gnCapTreeCol for all its children.
   */
  module.directive('gnCapTreeElt', [
    '$compile',
    function ($compile) {
    return {
      restrict: "E",
      require: '^gnWmsImport',
      replace: true,
      scope: {
        member: '='
      },
      template: "<li class='list-group-item' ng-click='toggleNode($event)'><label>" +
            "<span class='fa fa-plus-square-o'  ng-if='isParentNode()'></span>" +
            "<input type='checkbox' ng-if='!isParentNode()' data-ng-model='inmap' data-ng-change='select()'>" +
          " {{member.title}}</label></li>",
      link: function (scope, element, attrs, controller) {
        var el = element;
        if (angular.isArray(scope.member.nestedLayers)) {
          element.append("<gn-cap-tree-col class='list-group' collection='member.nestedLayers'></gn-cap-tree-col>");
          $compile(element.contents())(scope);
        }
        scope.select = function() {
          controller.addLayer(scope.member);
        };
        scope.toggleNode = function(evt) {
          el.find('.fa').first().toggleClass('fa-plus-square-o').toggleClass('fa-minus-square-o');
          el.children('ul').toggle();
          evt.stopPropagation();
          return false;
        };
        scope.isParentNode = function() {
          return angular.isArray(scope.member.nestedLayers) && scope.member.nestedLayers.length > 0;
        }
      }
    }
  }]);
})();
