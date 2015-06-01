(function() {

  goog.provide('un-layermanager');

  var module = angular.module('un-layermanager', []);

  gn.layermanagerDirective = function() {
    return {
      restrict: 'E',
      scope: {
        'map': '=unLayermanagerMap',
        'layers': '=unLayermanagerLayers'
      },
      controller: 'UnLayermanagerController',
      controllerAs: 'ctrl',
      bindToController: true,
      templateUrl: '../../catalog/views/unosat/js/layermanager/' +
          'layermanager.html'
    };
  };

  module.directive('unLayermanager', gn.layermanagerDirective);

  gn.LayermanagerController = function($scope, ngeoSyncArrays) {
    var $this = this;
    this['uid'] = goog.getUid(this);
    this.opacities_ = {};
    this.selectedLayers = [];
    ngeoSyncArrays(map.getLayers().getArray(), this.selectedLayers,
        true, $scope, goog.bind(function(layer) {
          return goog.array.indexOf(
              this.map.getLayers().getArray(), layer) !== 0;
        }, this));

    // watch any change on layers array to refresh the map
    $scope.$watchCollection(function() {
      return $this.selectedLayers;
    }, function() {
      $this.map.render();
    });
  };

  function layerFilter(layer) {
    goog.bind(function(layer) {
      return goog.array.indexOf(
          this.map.getLayers().getArray(), layer) !== 0;
    }, this)  }

  gn.LayermanagerController.prototype.removeLayer = function(layer) {
    this['map'].removeLayer(layer);
  };

  gn.LayermanagerController.prototype.changeVisibility = function(layer) {
    var currentOpacity = layer.getOpacity();
    var newOpacity;
    var uid = goog.getUid(layer);
    if (currentOpacity === 0) {
      if (goog.isDef(this.opacities_[uid])) {
        newOpacity = this.opacities_[uid];
      } else {
        newOpacity = 1;
      }
      // reset old opacity for later use
      delete this.opacities_[uid];
    } else {
      this.opacities_[uid] = currentOpacity;
      newOpacity = 0;
    }
    layer.setOpacity(newOpacity);
  };

  gn.LayermanagerController['$inject'] = [
    '$scope',
    'ngeoSyncArrays'
  ];

  module.controller('UnLayermanagerController', gn.LayermanagerController);

})();
