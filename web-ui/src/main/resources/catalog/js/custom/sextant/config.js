(function() {

  goog.provide('gn_search_sextant_config');

  var module = angular.module('gn_search_sextant_config', []);

  module.constant('gnPanierSettings', {});

  module.run(['gnSearchSettings', 'gnViewerSettings', 'gnPanierSettings',
      'gnMap',

    function(searchSettings, viewerSettings, gnPanierSettings, gnMap) {

      /** *************************************
       * Define mapviewer background layers
       */
      viewerSettings.bgLayers = [
        gnMap.createLayerForType('wmts'),
        gnMap.createLayerForType('mapquest'),
        gnMap.createLayerForType('osm'),
        gnMap.createLayerForType('bing_aerial')
      ];
      angular.forEach(viewerSettings.bgLayers, function(l) {
        l.displayInLayerManager = false;
        l.background = true;
        l.set('group', 'Background layers');
      });

      viewerSettings.defaultContext = '../../catalog/data/defaultContext.xml';

      /** *************************************
       * Define OWS services url for Import WMS
       */
      viewerSettings.servicesUrl = {
        wms: [
          'http://ids.pigma.org/geoserver/wms',
          'http://ids.pigma.org/geoserver/ign/wms',
          'http://www.ifremer.fr/services/wms/oceanographie_physique'
        ],
        wmts: [
          'http://sdi.georchestra.org/geoserver/gwc/service/wmts'
        ]
      };
      proj4.defs("EPSG:2154","+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
      proj4.defs("http://www.opengis.net/gml/srs/epsg.xml#2154","+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

      var bboxStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgba(255,0,0,1)',
          width: 2
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255,0,0,0.3)'
        })
      });
      searchSettings.olStyles = {
        drawBbox: bboxStyle,
        mdExtent: new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'orange',
            width: 2
          })
        }),
        mdExtentHighlight:new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'orange',
            width: 3
          }),
          fill: new ol.style.Fill({
            color: 'rgba(255,255,0,0.3)'
          })
        })

      }

      /** *************************************
       * Define maps
       */
      var mapsConfig = {
        center: [280274.03240585705, 6053178.654789996],
        zoom: 2,
        maxResolution: '9783.93962050256'
      };

      var viewerMap = new ol.Map({
        view: new ol.View(mapsConfig)
      });

      var searchMap = new ol.Map({
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
        ],
        view: new ol.View({
          center: mapsConfig.center,
          zoom: 0
        })
      });

      /** Facets configuration */
      searchSettings.facetsConfig = [{
        key: 'keyword',
        value: 'keywords'
      },{
        key: 'orgName',
        value: 'orgNames'
      },{
        key: 'denominator',
        value: 'denominators'
      },{
        key: 'format',
        value: 'formats'
      },{
        key: 'createDateYear',
        value: 'createDateYears'
      }];

      /* Pagination configuration */
      searchSettings.paginationInfo = {
        hitsPerPage: 20
      };

      /* Custom templates for search result views */
      searchSettings.resultViewTpls = [{
        tplUrl: '../../catalog/components/search/resultsview/partials/viewtemplates/title.html',
        tooltip: 'Simple',
        icon: 'fa-list'
      }, {
        tplUrl: '../../catalog/components/search/resultsview/partials/viewtemplates/sextant.html',
        tooltip: 'Thumbnails',
        icon: 'fa-th-list'
      }];

      /* Hits per page combo values configuration */
      searchSettings.hitsperpageValues = [3,10,20,50,100];

      /* Sort by combo values configuration */
      searchSettings.sortbyValues = ['relevance', 'title', 'rating'];

      // Set custom config in gnSearchSettings
      angular.extend(searchSettings, {
        viewerMap: viewerMap,
        searchMap: searchMap
      });

      gnPanierSettings.projs = [{
        value: '27571',
        label: 'Lambert Zone I - Datum NTF'
      },{
        value: '27572',
        label: 'Lambert Zone II - Datum NTF'
      },{
        value: '27573',
        label: 'Lambert Zone III - Datum NTF'
      },{
        value: '27574',
        label: 'Lambert Zone IV - Datum NTF'
      },{
        value: '27561',
        label: 'Lambert Nord France - Datum NTF'
      },{
        value: '27562',
        label: 'Lambert Centre France - Datum NTF'
      },{
        value: '27563',
        label: 'Lambert Sud France - Datum NTF'
      },{
        value: '27564',
        label: 'Lambert Corse - Datum NTF'
      },{
        value: '4326',
        label: 'Geographique - Datum WGS84'
      },{
        value: '32600',
        label: 'UTM - Datum WGS84'
      },{
        value: '4230',
        label: 'Geographique - Datum ED50'
      },{
        value: '4258',
        label: 'European Terrestrial Reference System 1989 (ETRS89)'
      },{
        value: '3395',
        label: 'Mercator - Datum WGS84'
      }];

      gnPanierSettings.formats = [{
        value: 'ESRI Shapefile',
        label: 'ESRI Shapefile'
      },{
        value: 'MapInfo File TAB',
        label: 'MapInfo File TAB'
      },{
        value: 'GML',
        label: 'GML'
      },{
        value: 'KML',
        label: 'KML'
      }];

      gnPanierSettings.defaults = {
        format: 'ESRI Shapefile',
        proj: '4326'
      }

    }]);
})();
