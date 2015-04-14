(function() {
  goog.provide('sxt_layertree');

  var module = angular.module('sxt_layertree', []);

  module.directive('sxtLayertree', [
    'gnLayerFilters',
    '$filter',
    'gnWmsQueue',
    '$timeout',
    function (gnLayerFilters, $filter, gnWmsQueue, $timeout) {
      return {
        restrict: 'A',
        templateUrl: '../../catalog/views/sextant/directives/' +
            'partials/layertree.html',
        controller: [ '$scope', function($scope) {
          var $this = this;

          this.setNCWMS = function(layer) {
            $scope.active.layersTools = false;
            $scope.active.NCWMS = layer;
          };

          this.comboGroups = {};
          this.switchGroupCombo = function(groupcombo) {
            var activeLayer = this.comboGroups[groupcombo];
            var fLayers = $filter('filter')($scope.layers,
                $scope.layerFilterFn);
            for (var i = 0; i < fLayers.length; i++) {
              var l = fLayers[i];
              if(l.get('groupcombo') == groupcombo) {
                l.visible = false;
              }
            }
            activeLayer.visible = true;
          };

          $scope.setActiveComboGroup = function(l) {
            $this.comboGroups[l.get('groupcombo')] = l;
          };
          this.addToPanier = function(md, link) {
            $scope.resultviewFns.addMdLayerToPanier(link, md);
          }
        }],
        link: function(scope, element, attrs) {

          scope.layers = scope.map.getLayers().getArray();
          scope.layerFilterFn = gnLayerFilters.selected;

          var findChild = function(node, name) {
            var n;
            if (node.nodes) {
              for (var i = 0; i < node.nodes.length; i++) {
                n = node.nodes[i];
                if (name == n.name) {
                  return n;
                }
              }
            }
          };
          var createNode = function(layer, node, g, index) {
            var group = g[index];
            if (group) {
              var newNode = findChild(node, group);
              if (!newNode) {
                newNode = {
                  name: group
                };
                if (!node.nodes) node.nodes = [];
                node.nodes.push(newNode);
              }
              createNode(layer, newNode, g, index + 1);
            } else {
              if (!node.nodes) node.nodes = [];
              node.nodes.push(layer);
            }
          };

          // on OWS Context loading, we don't want to build the tree on each
          // layer remove or add. The delay also helps to get layer properties
          // (i.e 'group') that are set after layer is added to map.
          var debounce = 0;

          // Build the layer manager tree depending on layer groups
          var buildTree = function() {
            if(debounce > 0) {
              return;
            }
            debounce++;
            $timeout(function() {
              scope.layerTree = {
                nodes: []
              };
              var sep = '/';
              var fLayers = $filter('filter')(scope.layers,
                  scope.layerFilterFn);

              if(scope.layerFilter.length > 2) {
                fLayers = $filter('filter')(fLayers, filterFn);
              }

              for (var i = 0; i < fLayers.length; i++) {
                var l = fLayers[i];
                var groups = l.get('group');
                if (!groups) {
                  scope.layerTree.nodes.push(l);
                }
                else {
                  var g = groups.split(sep);
                  createNode(l, scope.layerTree, g, 1);
                }
                if(l.visible && l.get('groupcombo')) {
                  scope.setActiveComboGroup(l);
                }
              }
              debounce--;
            }, 100);
          };

          scope.map.getLayers().on('change:length', buildTree);

          scope.failedLayers = gnWmsQueue.errors;
          scope.removeFailed = function(layer) {
            gnWmsQueue.removeFromError(layer);
          };

          scope.layerFilter = '';
          var filterFn = function(layer) {
            var labelLc = layer.get('label').toLowerCase();
            var groupLc = layer.get('group').toLowerCase();
            var filterLc = scope.layerFilter.toLowerCase();
            return labelLc.indexOf(filterLc) >= 0 ||
                groupLc.indexOf(filterLc) >= 0;
          };

          scope.filterLayers = function() {
            if(scope.layerFilter == '' || scope.layerFilter.length > 2) {
              buildTree();
            }
          };

          scope.filterClear = function() {
            scope.layerFilter = '';
            scope.filterLayers();
          };

        }
      };
    }]);

  module.directive('sxtLayertreeCol', [
    function() {
      return {
        restrict: 'E',
        replace: true,
        scope: {
          collection: '=',
          map: '=map'
        },
        template: "<ul class='sxt-layertree-node'><sxt-layertree-elt ng-repeat='member" +
            " in collection' member='member' map='map'></sxt-layertree-elt></ul>"
      };
    }]);

  module.directive('sxtLayertreeElt', [
    '$compile', 'gnMap', 'gnMdView',
    function($compile, gnMap, gnMdView) {
      return {
        restrict: 'E',
        replace: true,
        require: '^sxtLayertree',
        scope: {
          member: '=',
          map: '='
        },
        templateUrl: '../../catalog/views/sextant/directives/' +
            'partials/layertreeitem.html',
        link: function(scope, element, attrs, controller) {
          var el = element;
          if (angular.isArray(scope.member.nodes)) {
            element.append("<sxt-layertree-col class='list-group' " +
                "collection='member.nodes' map='map'></sxt-layertree-col>");
            $compile(element.contents())(scope);
          }
          scope.toggleNode = function(evt) {
            el.find('.fa').first().toggleClass('fa-minus-square-o')
                .toggleClass('fa-plus-square-o');
            el.children('ul').toggle();
            evt.stopPropagation();
            return false;
          };
          scope.isParentNode = function() {
            return angular.isDefined(scope.member.nodes);
          };

          scope.mapService = gnMap;

          scope.setNCWMS = controller.setNCWMS;

          if(!scope.isParentNode()) {
            scope.groupCombo = scope.member.get('groupcombo');
            scope.comboGroups = controller.comboGroups;
            scope.switchGroupCombo = controller.switchGroupCombo;

            var d =  scope.member.get('downloads');
            if(angular.isArray(d)) {
              scope.download = d[0];

            }
          }

          scope.addToPanier = function(download) {
            controller.addToPanier(scope.member.get('md'), download);
          };

          scope.showMetadata = function() {
            gnMdView.openMdFromLayer(scope.member);
          };
        }
      };
    }]);

})();
