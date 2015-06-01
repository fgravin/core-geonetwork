(function() {

  goog.provide('gn_search_unosat');

  goog.require('gn_search');
  goog.require('gn_search_unosat_config');
  goog.require('un-backgroundlayer');
  goog.require('un-search');
  goog.require('un-catalog');
  goog.require('un-layermanager');

  var module = angular.module('gn_search_unosat', [
    'ngAnimate',
    'gn_search',
    'gn_search_unosat_config',
    'un-backgroundlayer',
    'un-search',
    'un-layermanager',
    'un-catalog'
  ]);

  module.constant('defaultExtent', [604168.9251648698, 827653.5815669585, 3495323.0830233768, 2750197.7169957114]);

  gn.MainController = function($scope, gnSearchSettings, defaultExtent,
                               gnMeasure) {

    this.searchSettings_ = gnSearchSettings;
    this.defaultExtent_ = defaultExtent;
    this.map = null;
    this.setMap_();
    this.measureObj = {};

    this.map.addControl(new ol.control.MousePosition({
      target: document.querySelector('footer')
    }));
    this.map.addControl(new ol.control.ScaleLine({
      target: document.querySelector('footer')
    }));

    this.mInteraction = gnMeasure.create(this.map,
        this.measureObj, $scope);

  };

  /**
   * @private
   */
  gn.MainController.prototype.setMap_ = function() {

    this.map = new ol.Map({
      view: new ol.View({
        center: [2081543.807860756, 1688640.2681711826],
        zoom: 6
      }),
      controls: [
        new ol.control.Zoom(),
        new ol.control.ZoomToExtent({
          extent: this.defaultExtent_,
          tipLabel: 'Full extent',
          className: 'un-zoom-extent',
          label:goog.dom.htmlToDocumentFragment(
              '<span class="fa fa-globe"></span>')}),

        new ol.control.FullScreen({
          tipLabel: 'Full screen',
          className: 'un-full-screen',
          label:goog.dom.htmlToDocumentFragment(
            '<span class="fa fa-arrows-alt"></span>')})
      ]
    });

    map = this.map;
  };

  gn.MainController.prototype.closeSidebar = function() {
    this.layersOpen = false;
    this.catalogOpen = false;
    this.printOpen = false;
  };

  gn.MainController.prototype.sidebarOpen = function() {
    return this.layersOpen || this.catalogOpen || this.printOpen ||
        this.mInteraction.active;
  };

  module.controller('MainController', gn.MainController);
  gn.MainController['$inject'] = [
    '$scope',
    'gnSearchSettings',
    'defaultExtent',
    'gnMeasure'
  ];
})();
