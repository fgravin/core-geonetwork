(function () {
  goog.provide('gn_viewer');

  goog.require('gn');
  goog.require('gn_viewer_directive');
  goog.require('gn_viewer_service');
  goog.require('gn_wmsimport_directive');
  goog.require('gn_layermanager_directive');
  goog.require('gn_baselayerswitcher_directive');
  goog.require('gn_measure_directive');
  goog.require('gn_draw_directive');
  goog.require('gn_ows');
  goog.require('gn_popup');
  goog.require('gn_ncwms');
  goog.require('gn_localisation');
  goog.require('gn_print');

  var module = angular.module('gn_viewer', [
    'gn_ncwms',
    'gn_viewer_service',
    'gn_viewer_directive',
    'gn_wmsimport_directive',
    'gn_layermanager_directive',
    'gn_baselayerswitcher_directive',
    'gn_measure_directive',
    'gn_draw_directive',
    'gn_ows',
    'gn_localisation',
    'gn_popup',
    'gn_print',
    'gn'
  ]);

  module.controller('gnViewerController', [
    '$scope',
    'gnNcWms',
    'goDecorateLayer',
      'gnMapConfig',
      function($scope, gnNcWms, goDecorateLayer, gnMapConfig) {

        /** Define object to receive measure info */
        $scope.measureObj = {};

        /** Define vector layer used for drawing */
        $scope.drawVector;

        /** print definition */
        $scope.activeTools = {};

        // TODO : Move on layer load
        $scope.ncwmsLayer = gnNcWms.createNcWmsLayer();
        $scope.ncwmsLayer.displayInLayerManager = true;
        goDecorateLayer($scope.ncwmsLayer);

        $scope.map = new ol.Map({
          renderer: 'canvas',
          view: new ol.View({
            center: gnMapConfig.center,
            zoom: gnMapConfig.zoom,
            maxResolution: gnMapConfig.maxResolution
          })
        });
        $scope.map.addLayer($scope.ncwmsLayer);

        $scope.zoom = function(map, delta) {
          map.getView().setZoom(map.getView().getZoom() + delta);
        };
        $scope.zoomToMaxExtent = function(map) {
          map.getView().setResolution(gnMapConfig.maxResolution);
        };
      }]);

  var servicesUrl = {
    wms: [
      'http://ids.pigma.org/geoserver/wms',
      'http://ids.pigma.org/geoserver/ign/wms',
      'http://www.ifremer.fr/services/wms/oceanographie_physique'
    ],
    wmts: [
      'http://sdi.georchestra.org/geoserver/gwc/service/wmts'
    ]
  };

  var mapConfig = {
    maxResolution: '9783.93962050256',
    center: [280274.03240585705, 6053178.654789996],
    zoom: 2,
    servicesUrl: servicesUrl
  };
  module.constant('gnMapConfig', mapConfig);

  var source = new ol.source.TileWMS({
    params: {
      LAYERS: 'ETOPO1_BATHY_R_3857,continent'
    },
    url: 'http://www.ifremer.fr/services/wms/wmsproxy_double.cgi?'
  });
  var sxtLayer = new ol.layer.Tile({
    type: 'WMS',
    source: source,
    title: 'Sextant'
  });

  var osmLayer = new ol.layer.Tile({
    source: new ol.source.OSM(),
    title: 'OpenStreetMap'
  });
  osmLayer.displayInLayerManager = false;
  osmLayer.background = true;

  var mqLayer = new ol.layer.Tile({
    style: 'Road',
    source: new ol.source.MapQuest({layer: 'osm'}),
    title: 'MapQuest'
  });
  mqLayer.displayInLayerManager = false;
  mqLayer.background = true;

  var bingSatellite = new ol.layer.Tile({
    preload: Infinity,
    source: new ol.source.BingMaps({
      key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
      imagerySet: 'Aerial'
    }),
    title: 'Bing Aerial'
  });
  bingSatellite.displayInLayerManager = false;
  bingSatellite.background = true;

  module.constant('gnBackgroundLayers', [mqLayer, osmLayer, bingSatellite, sxtLayer]);

  module.controller('toolsController',
      ['$scope', 'gnMeasure',
        function($scope, gnMeasure) {
          $scope.mInteraction = gnMeasure.create($scope.map, $scope.measureObj, $scope);
        }
      ]);

})();
