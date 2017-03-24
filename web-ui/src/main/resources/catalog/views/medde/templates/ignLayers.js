

(function() {

  var IGN_KEY = '1tkdsjfeqm5f0cyfoo5rmbwv';

  goog.provide('c2cGenerateIgnLayer');

  // initialize IGN WMTS source
  var resolutions = [];
  var matrixIds = [];
  var proj3857 = ol.proj.get('EPSG:3857');
  var maxResolution = ol.extent.getWidth(proj3857.getExtent()) / 256;
  for (var i = 0; i < 18; i++) {
    matrixIds[i] = i.toString();
    resolutions[i] = maxResolution / Math.pow(2, i);
  }

  var tileGrid = new ol.tilegrid.WMTS({
    origin: [-20037508, 20037508],
    resolutions: resolutions,
    matrixIds: matrixIds
  });

  c2cGenerateIgnLayer = function (layerName, format, minRes, maxRes) {

    return new ol.layer.Tile({
      source : new ol.source.WMTS({
        url: 'http://wxs.ign.fr/' + IGN_KEY + '/wmts',
        layer: layerName,
        matrixSet: 'PM',
        format: format || 'image/jpeg',
        projection: 'EPSG:3857',
        tileGrid: tileGrid,
        style: 'normal',
        attributions: [new ol.Attribution({
          html: '<a href="http://www.geoportail.fr/" target="_blank">' +
          '<img src="http://api.ign.fr/geoportail/api/js/latest/theme/geoportal/img/logo_gp.gif"></a>'
        })],
        wrapX: true
      }),
      minResolution: minRes,
      maxResolution: maxRes
    });

  };

})();
