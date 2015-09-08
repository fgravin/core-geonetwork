(function() {

  goog.provide('gn_search_geoportal');
  goog.require('gn_search_default');


  var module = angular.module('gn_search_geoportal',  ['gn_search_default']);

  module.run(['gnSearchSettings', function(gnSearchSettings){

    gnSearchSettings.resultTemplate ='../../catalog/views/geoportal/' +
        'templates/resultlist.html'
  }]);
})();
