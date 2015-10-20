Ext.namespace('cat');
Ext.namespace('cat.Templates');

cat.Templates.TITLE = '<h1><a href="#" onclick="javascript:catalogue.metadataShow(\'{uuid}\');return false;">{title}</a>'
		+ '</h1>';

cat.list = function() {

	var createSelect = function(str, options) {
		var disabled = (str.length) ? '' : 'disabled="disabled" ';
		var btn = new Ext.Button({
			fieldLabel : 'download'
		});
		return [
				'  <div class="buttonSet ui-helper-clearfix field select id={uuid}">',
				'    <select ', disabled, 'id="', options.id, '" name="',
				options.selectName, '">',
				'        <option value="-" selected="selected" class="',
				options.spanClass, '">', options.defaultText, '</option>', str,
				'    </select>', '  </div>' ].join('');
	};

	var getPanierBtn = function() {
		var defaultOptions = {
			id : 'panier-',
			selectName : "result-add",
			defaultText : 'download',
			spanClass : "cart-add",
			btnTitle : 'download'
		};
		return createSelect('', defaultOptions);
	};

	var template = undefined;

	var initTemplate = function() {

		template = new Ext.XTemplate(
			'<ul class="result-list">',
			'<tpl for=".">',
			'<li class="md md-full" style="{featurecolorCSS}">',
			'<table><tr>',
			'<td class="thumb">',
			'<div class="thumbnail">',
			'<tpl if="thumbnail">',
			    '<a rel="lightbox" href="{overview}"><img src="{thumbnail}" alt="Thumbnail"/></a>',
			'</tpl>',
			'<tpl if="thumbnail==\'\'"><span>' + OpenLayers.i18n('thumbnail_not_available') + '</tpl>',
			'</div>',
			'</td>',
			'<td id="{uuid}" class="content">',
      '<tpl if="values.type==\'map\'">',
        '<span class="sxt-glyph icon-globe"></span>',
      '</tpl>',
      '<tpl if="values.type==\'dataset\' || values.type==\'series\'">',
        '<span class="sxt-glyph icon-layers"></span>',
      '</tpl>',
      cat.Templates.TITLE,
			'<p class="abstract">{[Ext.util.Format.ellipsis(Ext.util.Format.stripTags(values.abstract), 350, true)]}</p>', 
			'<div class="md-contact">',
			'<tpl if="credit!=\'\'">',
			'<span>',
			OpenLayers.i18n('result-list-source'),
			'&nbsp;<tpl for="credit">{value}{[xindex==xcount?"":", "]}</tpl>',
			'</span>',
			'</tpl>',
      '<tpl if="catalogue.canSetInternalPrivileges() && editableForGroup != \'\'">',
      '<br/><span class="gn-group-list">',
      OpenLayers.i18n('result-list-groups'),
      '&nbsp;<tpl for="editableForGroup">{.}{[xindex==xcount?"":", "]}</tpl>',
      '</span>',
      '</tpl>',
			'</div>',
			'<hr/>',
			'<div class="md-links">',
			'<div class="md-action-menu">&nbsp;<span class="icon">&nbsp;</span>'+ OpenLayers.i18n('administrer') + '<span class="list-icon">&nbsp;</span></div>',
			'<div class="btn-separator">&nbsp;</div>',
			'<div class="downloadMenu"><span class="icon">&nbsp;</span>'+ OpenLayers.i18n('result-list-download')+ '<span class="list-icon">&nbsp;</span></div>',
			'<div class="btn-separator">&nbsp;</div>',
			'<div class="wmsMenu"><span class="icon">&nbsp;</span>'+ OpenLayers.i18n('result-list-view')+ '<span class="list-icon">&nbsp;</span></div>',
			'<tpl for="links">',
			'<tpl if="values.type == \'application/vnd.ogc.wms_xml\' || values.type == \'OGC:WMS\' || values.type == \'OGC:WMC\' || values.type == \'OGC:OWS\' || values.type == \'OGC:OWS-C\'">',
			'<div class="mdHiddenMenu wmsLink dynamic-{parent.dynamic}" title="'
					+ OpenLayers.i18n('addToMap') + ' {title}">',
			'<tpl if="values.title">',
				'{title}',
			'</tpl>',
			'<tpl if="values.title==\'\'">',
			OpenLayers.i18n('result-list-view'),
			'</tpl>',
			'<div style="display:none">{values.name}|{values.title}|{values.href}|{values.protocol}|{values.type}</div>',
			'</div>',
			'</tpl>',
			'<tpl if="values.protocol == \'DB\' || values.protocol == \'FILE\' || values.protocol == \'WFS\' || values.protocol == \'WCS\' || values.protocol == \'COPYFILE\'">',
			'<div class="mdHiddenMenu downloadLink download-{parent.download}">{title}<div style="display:none">{values.name}|</div></div>',
			'</tpl>',
      '<tpl if="values.protocol == \'WWW:DOWNLOAD-1.0-link--download\'">',
      '<div class="mdHiddenMenu downloadLink download-{parent.download}">{title}<div style="display:none">|{values.href}</div></div>',
      '</tpl>',
			'</tpl>',
			'<tpl if="this.hasDownloadLinks(values.links)">',
			'<a href="#" onclick="catalogue.metadataPrepareDownload({id});" class="md-mn downloadAllIcon" title="'
					+ OpenLayers.i18n('prepareDownload')
					+ '" alt="download">&nbsp;</a>', '</tpl>', '</div>',
			'</td></tr></table>', 
			'<div class="relation" title="' + OpenLayers.i18n('relateddatasets') + '"><span></span><ul id="md-relation-{id}"></ul></div>',
			'</li>', '</tpl>', '</ul>', 
			
			{
				isFirstSource : function(idx) {
					return idx == 1;
				},
				isLastSource : function(idx, length) {
					return idx == length - 1;
				},
				hasDownloadLinks : function(values) {
					var i;
					for (i = 0; i < values.length; i++) {
						if (values[i].type === 'application/x-compressed') {
							return true;
						}
					}
					return false;
				}
			}
		);
	};
	
	return {
		getTemplate : function() {
			if(!template) {
				initTemplate();
			}
			return template;
		}
	}
}();