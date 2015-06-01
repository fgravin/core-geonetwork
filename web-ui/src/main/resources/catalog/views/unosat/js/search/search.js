(function() {

  goog.provide('un-search');

  var module = angular.module('un-search', []);

  gn.searchDirective  = function() {
    return {
      restrict: 'E',
      scope: {
        'map': '=unSearchMap'
      },
      controller: 'UnSearchController',
      bindToController: true,
      controllerAs: 'ctrl',
      templateUrl: '../../catalog/views/unosat/js/search/' +
          'search.html',
      link: function(scope, element, attrs) {

        element.find('input').on('focus', function() {
          $(this).val('');
          $(this).addClass('placeholder-text');
        });
        element.find('span.clear-button').on('click',
            goog.bind(function(scope) {
              $(this).find('input').val('').trigger('input');
              scope['ctrl'].featureOverlay_.getFeatures().clear();
            },element, scope));

        element.find('input').on(
            'input propertyChange focus blur', function() {
              var clearButton =
                  $(this).parents('.form-group').find('span.clear-button');
              if ($(this).val() === '') {
                clearButton.css('display', 'none');
              } else {
                clearButton.css('display', 'block');
              }
            });
          }
    };
  };
  module.directive('unSearch', gn.searchDirective);


  gn.SearchController = function($rootScope, $compile,
                                  ngeoCreateGeoJSONBloodhound, gnUrlUtils) {

    this.gnUrlUtils_ = gnUrlUtils;

    this.featureOverlay_ = this.createFeatureOverlay_();

    var bloodhoundEngine = this.createAndInitBloodhound_(
        ngeoCreateGeoJSONBloodhound);

    this['options'] = {
      highlight: true
    };

    this['datasets'] = [{
      source: bloodhoundEngine.ttAdapter(),
      displayKey: function(suggestion) {
        return suggestion.toponymName;
      },
      templates: {
        header: function() {
          return '<div class="header">Addresses</div>';
        },
        suggestion: function(suggestion) {

          // A scope for the ng-click on the suggestion's « i » button.
          var scope = $rootScope.$new(true);
          scope['extent'] = suggestion.bbox;
          scope['click'] = function(event) {
            window.alert(feature.get('label'));
            event.stopPropagation();
          };
          var formatter = function(loc) {
            var props = [];
            ['adminName1', 'countryName'].
                forEach(function(p) {
                  if (loc[p]) { props.push(loc[p]); }
                });
            return (props.length == 0) ? '' : '-' + props.join(', ');
          };

          var html = '<p>' + suggestion.toponymName + '<span class="italic">' + formatter(suggestion) +
              '</span></p>';
          return $compile(html)(scope);
        }
      }
    }];

    this['listeners'] = ({
      selected: angular.bind(this, gn.SearchController.selected_)
    });

  };


  /**
   * @return {ol.FeatureOverlay} The feature overlay.
   * @private
   */
  gn.SearchController.prototype.createFeatureOverlay_ = function() {
    var featureOverlay = new ol.FeatureOverlay();
    featureOverlay.setMap(this['map']);
    return featureOverlay;
  };


  /**
   * @param {ngeo.CreateGeoJSONBloodhound} ngeoCreateGeoJSONBloodhound The ngeo
   *     create GeoJSON Bloodhound service.
   * @return {Bloodhound} The bloodhound engine.
   * @private
   */
  gn.SearchController.prototype.createAndInitBloodhound_ =
      function(ngeoCreateGeoJSONBloodhound) {
        var params = {
          lang: 'fr',
          style: 'full',
          type: 'json',
          maxRows: 10,
          username: 'georchestra'
        };

        var url = 'http://api.geonames.org/searchJSON?';
        url = this.gnUrlUtils_.append(url,
            this.gnUrlUtils_.toKeyValue(params));

        url += '&name_startsWith=%QUERY';

        var geojsonFormat = new ol.format.GeoJSON();
        var bloodhoundOptions = ({
          remote: {
            url: url,
            filter: function(resp) {
              return resp.geonames;
            }
          }
        });
        var bloodhound = ngeoCreateGeoJSONBloodhound(bloodhoundOptions);

        bloodhound.initialize();
        return bloodhound;
      };


  /**
   * @param {jQuery.event} event Event.
   * @param {Object} suggestion Suggestion.
   * @param {TypeaheadDataset} dataset Dataset.
   * @this {gn.SearchController}
   * @private
   */
  gn.SearchController.selected_ = function(event, suggestion, dataset) {
    var map = this['map'];
    var extent = ol.proj.transformExtent([suggestion.bbox.west,
          suggestion.bbox.south, suggestion.bbox.east, suggestion.bbox.north],
        'EPSG:4326', 'EPSG:3857');

    var geom = ol.geom.Polygon.fromExtent(extent);
    map.getView().fitGeometry(geom, map.getSize(), {
      maxZoom: 16
    });
  };


  module.controller('UnSearchController', gn.SearchController);

  gn.SearchController['$inject'] = [
    '$rootScope', '$compile',
    'ngeoCreateGeoJSONBloodhound',
    'gnUrlUtils'];

})();
