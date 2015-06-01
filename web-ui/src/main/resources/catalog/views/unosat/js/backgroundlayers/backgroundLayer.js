(function() {

  goog.provide('un-backgroundlayer');

  var module = angular.module('un-backgroundlayer', []);

  var bgLayers = [{
    "layer": "mapquest",
    "name": "MapQuest"
  }, {
    "name": "Open Street Map",
    "layer": "osm"
  }, {
    "name": "Bing Aerial",
    "layer": "bing_aerial"
  }];

  gn.backgroundlayerDirective = function() {
    return {
      restrict: 'E',
      scope: {
        'map': '=unBackgroundlayerMap'
      },
      templateUrl: '../../catalog/views/unosat/js/backgroundlayers/' +
          'backgroundlayerdropdown.html',
      controllerAs: 'ctrl',
      bindToController: true,
      controller: 'AppBackgroundlayerController'
    };
  };
  module.directive('unBackgroundlayer', gn.backgroundlayerDirective);


  gn.BackgroundlayerController = function(gnMap, ngeoBackgroundLayerMgr) {

    this.backgroundLayerMgr_ = ngeoBackgroundLayerMgr;
    this.gnMap_ = gnMap;
    this['bgLayers'] = bgLayers;

    this.setLayer(bgLayers[0]);
  };


  /**
   * Function called when the user selects a new background layer in the
   * dropdown. Called by the ng-click directive used in the partial.
   * @param {Object} layerSpec Layer specification object.
   * @export
   */
  gn.BackgroundlayerController.prototype.setLayer = function(layerSpec) {
    this['currentBgLayer'] = layerSpec;
    var layer = this.createLayer_(layerSpec['layer']);
    this.backgroundLayerMgr_.set(this['map'], layer);
  };


  /**
   * @param {string} layerName Layer name.
   * @return {ol.layer.Tile} The layer.
   * @private
   */
  gn.BackgroundlayerController.prototype.createLayer_ = function(layerName) {
    return this.gnMap_.createLayerForType(layerName);
  };

  module.controller('AppBackgroundlayerController',
      gn.BackgroundlayerController);

  gn.BackgroundlayerController['$inject'] = [
    'gnMap',
    'ngeoBackgroundLayerMgr'
  ];

})();
