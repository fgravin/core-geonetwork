(function() {

  goog.provide('gn_search_geoportal');
  goog.require('gn_search_default');


  var module = angular.module('gn_search_geoportal',  ['gn_search_default']);

  module.run(['gnSearchSettings', function(gnSearchSettings){

    gnSearchSettings.resultTemplate ='../../catalog/views/geoportal/' +
        'templates/resultlist.html';

    gnSearchSettings.searchTplFiles.results =
        '../../catalog/views/geoportal/templates/results.html';

    gnSearchSettings.searchMap = new ol.Map({
      controls:[],
      layers: [
        new ol.layer.Tile({
          source: new ol.source.Stamen({
            layer: 'watercolor'
          })
        }),
        new ol.layer.Tile({
          source: new ol.source.Stamen({
            layer: 'terrain-labels'
          })
        })
      ],
      view: new ol.View({
        center: [-25714639.307585858, 4231553.885867357],
        zoom: 6
      })
    });

  }]);
})();
