(function() {
  goog.provide('gn_wfsfilter_directive');

  var module = angular.module('gn_wfsfilter_directive', [
  ]);

  /**
   * @ngdoc directive
   * @name gn_wfsfilter.directive:gnWfsFilterFacets
   *
   * @description
   */
  module.directive('gnWfsFilterFacets', [
    '$http', 'wfsFilterService', '$q', '$rootScope',

    function($http, wfsFilterService, $q, $rootScope) {
      return {
        restrict: 'A',
        replace: true,
        templateUrl: '../../catalog/components/viewer/wfsfilter/' +
            'partials/wfsfilterfacet.html',
        scope: {
          featureTypeName: '@',
          wfsUrl: '@',
          displayCount: '@',
          layer: '='
        },
        link: function(scope, element, attrs) {

          var solrUrl, uuid;
          var ftName = scope.featureTypeName;
          scope.user = $rootScope.user;

          scope.showCount = angular.isDefined(attrs['showcount']);

          function init() {
            scope.fields = [];
            scope.isWfsAvailable = undefined;
            scope.isFeaturesIndexed = false;
            scope.status = null;
            scope.md = scope.layer.get('md');
            uuid = scope.md && scope.md.getUuid();
            scope.url = scope.wfsUrl ||
                scope.layer.get('url').replace(/wms/i, 'wfs');

            ftName = scope.featureTypeName ||
                scope.layer.getSource().getParams().LAYERS;

            scope.checkWFSUrl();
            scope.checkFeatureTypeInSolr();

          };

          /**
           * Check if the WFS url provided return a response.
           */
          scope.checkWFSUrl = function() {
            return $http.get('../../proxy?url=' +
                encodeURIComponent(scope.url))
              .then(function() {
                  scope.isWfsAvailable = true;
                }, function() {
                  scope.isWfsAvailable = false;
                });
          };


          /**
           * Create SOLR request to get facets values
           * Check if the feature has an applicationDefinition, else get the
           * indexed fields for the Feature. From this, build the solr request
           * and retrieve the facet config from solr response.
           * This config is stored in `scope.fields` and is used to build
           * the facet UI.
           */
          scope.appProfile = null;
          scope.docFields = null;
          function loadAppProfile() {
            return wfsFilterService.getApplicationProfile(uuid,
                ftName,
                scope.url,
                // A WFS URL is in the metadata or we're guessing WFS has
                // same URL as WMS
                scope.wfsUrl ? 'WFS' : 'WMS').success(function(data) {
              scope.appProfile = data;
            });
          }

          function loadFields() {
            var url;
            if (scope.appProfile && scope.appProfile.fields != null) {
              url = wfsFilterService.getSolrRequestFromApplicationProfile(
                  scope.appProfile, ftName, scope.url, scope.docFields);
            } else {
              url = wfsFilterService.getSolrRequestFromFields(
                  scope.docFields, ftName, scope.url);
            }
            solrUrl = url;
            // Init the facets
            scope.resetFacets();
          }
          function getDataModelLabel(fieldId) {
            for (var j = 0; j < scope.md.attributeTable.length; j++) {
              if (fieldId ==
                  scope.md.attributeTable[j].name) {
                return scope.md.attributeTable[j].definition;
              }
            }
            return null;
          }
          scope.checkFeatureTypeInSolr = function() {
            wfsFilterService.getWfsIndexFields(
                ftName, scope.url).then(function(docFields) {
              scope.isFeaturesIndexed = true;
              scope.status = null;
              scope.docFields = docFields;

              if (scope.md && scope.md.attributeTable) {
                for (var i = 0; i < scope.docFields.length; i++) {
                  var label = getDataModelLabel(scope.docFields[i].attrName);
                  if (label) {
                    // TODO: Multilingual
                    scope.docFields[i].label = label;
                  }
                }
              }

              if (scope.appProfile == null) {
                loadAppProfile().then(function() {
                  loadFields();
                }, function() {
                  loadFields();
                });
              } else {
                loadFields();
              }
            }, function(error) {
              scope.status = error.statusText;
            });
          };
          /**
           * Update the state of the facet search.
           * The `scope.output` structure represent the state of the facet
           * checkboxes form.
           *
           * @param {string} fieldName index field name
           * @param {string} facetKey facet key for this field
           * @param {string} type facet type
           */
          scope.onCheckboxClick = function(fieldName, facetKey, type) {
            var output = scope.output;
            if (output[fieldName]) {
              if (output[fieldName].values[facetKey]) {
                delete output[fieldName].values[facetKey];
                if (Object.keys(output[fieldName].values).length == 0) {
                  delete output[fieldName];
                }
              }
              else {
                output[fieldName].values[facetKey] = true;
              }
            }
            else {
              output[fieldName] = {
                type: type,
                values: {}
              };
              output[fieldName].values[facetKey] = true;
            }
            scope.searchInput = '';
            scope.filterFacets();
          };

          /**
           * Send a new filtered request to solr to update the facet ui
           * structure.
           * This method is called each time the user check or uncheck a box
           * from the ui, or when he updates the filter input.
           * @param {boolean} fromInput the filter comes from input change
           */
          scope.filterFacets = function(fromInput) {

            // Update the facet UI
            var collapsedFields = [];
            angular.forEach(scope.fields, function(f) {
              collapsedFields;
              if (f.collapsed) {
                collapsedFields.push(f.name);
              }
            });

            scope.layer.set('solrQ', wfsFilterService.updateSolrUrl(
                solrUrl,
                scope.output,
                scope.searchInput));
            wfsFilterService.getFacetsConfigFromSolr(
                scope.layer.get('solrQ'), scope.docFields).
                then(function(facetsInfo) {
                  scope.fields = facetsInfo.facetConfig;
                  scope.count = facetsInfo.count;
                  scope.layer.set('featureCount', scope.count);
                  if (fromInput) {
                    angular.forEach(scope.fields, function(f) {
                      if (!collapsedFields ||
                          collapsedFields.indexOf(f.name) >= 0) {
                        f.collapsed = true;
                      }
                    });
                  }
                });
          };

          /**
           * reset and init the facet structure.
           * call the solr service to get info on all facet fields and bind it
           * to the output structure to generate the ui.
           */
          scope.resetFacets = function() {

            // output structure to send to filter service
            scope.output = {};

            scope.searchInput = '';

            // load all facet and fill ui structure for the list
            wfsFilterService.getFacetsConfigFromSolr(solrUrl, scope.docFields).
                then(function(facetsInfo) {
                  scope.fields = facetsInfo.facetConfig;
                  scope.count = facetsInfo.count;
                  scope.countTotal = facetsInfo.count;
                  scope.layer.set('featureCount', scope.count);
                  scope.layer.set('featureCountT', scope.countTotal);
                  angular.forEach(scope.fields, function(f) {
                    f.collapsed = true;
                  });
                });

            scope.resetSLDFilters();
          };

          scope.resetSLDFilters = function() {
            scope.layer.getSource().updateParams({
              SLD: null
            });
          };

          /**
           * On filter click, build from the UI the SLD rules config object
           * that will be send to generateSLD service.
           */
          scope.filterWMS = function() {
            var defer = $q.defer();
            var sldConfig = wfsFilterService.createSLDConfig(scope.output);
            if (sldConfig.filters.length > 0) {
              wfsFilterService.getSldUrl(sldConfig, scope.layer.get('url'),
                  ftName).success(function(data) {
                scope.layer.getSource().updateParams({
                  SLD: data.value
                });
              }).finally (function() {
                defer.resolve();
              });
            } else {
              scope.layer.getSource().updateParams({
                SLD: null
              });
              defer.resolve();
            }
            return defer.promise;
          };

          scope.indexWFSFeatures = function() {
            if (scope.appProfile == null) {
              loadAppProfile().then(function() {
                return wfsFilterService.indexWFSFeatures(
                    scope.url,
                    ftName,
                    scope.appProfile.tokenize);
              }, function() {
                return wfsFilterService.indexWFSFeatures(
                    scope.url,
                    ftName,
                    null
                );
              });
            } else {
              return wfsFilterService.indexWFSFeatures(
                  scope.url,
                  ftName,
                  scope.appProfile && scope.appProfile.tokenize ?
                  scope.appProfile.tokenize : null
              );
            }
          };


          scope.clearInput = function() {
            scope.searchInput = '';
            scope.filterFacets();
          };

          scope.searchInput = '';

          if (scope.layer) {
            init();
          }
          else {
            scope.$watch('layer', function(n, o) {
              if (n && n != o) {
                init();
              }
            });
          }
        }
      };
    }]);
})();
