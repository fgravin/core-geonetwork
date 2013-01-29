Ext.namespace('cat');

cat.who = function() {
	
	var configwho= "";
	
	/** the Who panel **/
	var panel;
	
	return {
		createCmp : function(services, what) {
			
			// if configwho is set, the groupFieldStore is loaded from data in configwho
			var mode, groupFieldStore;
			var configwhoInput = Ext.query('input[id*=configwho]');
			if(configwhoInput[0] && configwhoInput[0].value) {
				configwho = configwhoInput[0].value;
				groupFieldStore =  new Ext.data.ArrayStore({
					fields: ['value']
				});
				var data = configwho.split(',');
				for(i=0;i<data.length;i++) {
					data[i] = [data[i]];
				}
				groupFieldStore.loadData(data);
				mode='local';
			}
			else {
				groupFieldStore = new GeoNetwork.data.OpenSearchSuggestionStore({
	                url: services.opensearchSuggest,
	                rootId: 1,
	                baseParams: {
	                    field: 'orgName',
	                    threshold: 1
	                }
	            });
				mode='remote';
			}
			if(what.getConfigWhat) {
				groupFieldStore.baseParams.groupPublished = what.getConfigWhat();
			}
			var updateOrgList = function(cb, value, record) {
				groupFieldStore.baseParams.groupPublished = what.getCatalogueField().getValue() ? 
						what.getCatalogueField().getValue() : what.getConfigWhat();
			};
			what.getCatalogueField().on('additem', updateOrgList);
			what.getCatalogueField().on('removeitem', updateOrgList);
			
//	        var groupField = new Ext.ux.form.SuperBoxSelect({
//	            hideLabel: false,
//	            width: 230,
//	            minChars: 0,
//	            queryParam: 'q',
//	            hideTrigger: false,
//	            id: 'E_credit',
//	            name: 'E_credit',
//	            store: groupFieldStore,
//	            valueField: 'value',
//	            displayField: 'value',
//	            mode:mode,
//	            valueDelimiter: ' or ',
//	            fieldLabel: OpenLayers.i18n('orgs')
//	        });
	        var groupField = new Ext.ux.form.SuperBoxSelect({
	            hideLabel: false,
	            width: 230,
	            minChars: 0,
	            queryParam: 'q',
	            hideTrigger: false,
	            id: 'E_orgName',
	            name: 'E_orgName',
	            store: groupFieldStore,
	            valueField: 'value',
	            displayField: 'value',
	            valueDelimiter: ' or ',
	            mode:mode,
	            fieldLabel: OpenLayers.i18n('orgs')
	        });
	        
			return new Ext.Panel({
			    title: OpenLayers.i18n('Who'),
			    autoHeight: true,
			    autoWidth: true,
			    collapsible: true,
			    collapsed: true,
			    defaultType: 'checkbox',
			    layout: 'form',
			    listeners: {
			    	'afterrender': function(o) {
			    		o.header.on('click', function() {
			    			if(o.collapsed) o.expand();
			    			else o.collapse();
			    		});
			    	}
			    },
			    items: groupField
			});
		}
	}
}();