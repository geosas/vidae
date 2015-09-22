/*
 * @include WPS.js
 * @include GeoExt/data/FeatureStore.js
 * @include GeoExt/data/LayerRecord.js
 * @include GeoExt/data/LayerStore.js
 * @include OpenLayers/Layer/Markers.js
 * @include OpenLayers/Marker.js
 * @include OpenLayers/Icon.js
 * @include OpenLayers/Request.js
 * @include OpenLayers/Format/OWSCommon/v1_1_0.js
 * @include GEOR_waiter.js
 * @include VIDAE.js
 *
 */
Ext.namespace("GEOR");

GEOR.vidae = (function () {

    /*
     * Private
     */

    /**
     * Property: map
     * {OpenLayers.Map} The map instance.
     */
    var map = null;

    /**
     * Property: layerStore
     * {GeoExt.data.LayerStore} The application's layer store.
     */
    var layerStore = null ;
	
    var title = "default toptioooptionitlt";

    var abstract = "default abstract";


    /**
     * Property: config
     *{Object} Hash of options,. */	
	
    var config = null;

    var tr = function (str) {
            return OpenLayers.i18n(str);
        };


    /**
     * Method: showgraph
     * display graph
     *
     * selection - {boolean} .
     */
    var showgraph = function (selection) {
        var tabField = new Array () ;
        tabField [0] = config.default_data_type ;
        GEOR.waiter.show()
        if (selection) {
            var searchLayer = map.getLayersByName("search_results");
            var selectedFeatures = searchLayer[0].selectedFeatures;
            var features = (selectedFeatures.length > 0)?selectedFeatures:searchLayer[0].features;
            console.log ("features.length="+features.length) ;
            if (features.length > 0) {
                var tabPiezo = new Array (features.length) ;
                for (var i = 0; i < features.length; i++) {
                    att = features[i].attributes ;
                    for (var key in att) {
                        if (!att.hasOwnProperty(key)) {
                            continue;
                        }
                        if (key == config.join_field){
                            tabPiezo[i] = att[key] ;
                            console.log (config.join_field+"="+tabPiezo[i]) ;
                        }
                    } 
                } 
            }
        } else {
            var default_piezo = (config.default_piezo==null)?[1]:config.default_piezo ;
            var tabPiezo = default_piezo ;
        };
        displayVIDAE (tabPiezo, tabField) ;
    } ;

    /**
     * Method: enableSelectionTool
     *
     * Retourne true si une sélection est effectuée dans le Panel Results
     * Parameters:
     * m - {OpenLayers.Map} The map instance.
     */
    var enableSelectionTool = function (m) {
            var response = false;
            var searchLayers = m.getLayersByName("search_results");
            if (searchLayers.length == 1) {
                var features = searchLayers[0].features;
                var selectedFeatures = searchLayers[0].selectedFeatures;
                if (features.length > 0 || selectedFeatures.length > 0) {
                    response = true;
                }
            }
            return response;
        };

    return {
        /*
         * Public
         */


        /**
         * APIMethod: create
         *
         * APIMethod: create
         * Return a  {Ext.menu.Item} for GEOR_addonsmenu.js and initialize this module.
         * Parameters:
         * ls - {GeoExt.data.LayerStore} The application's layer store.
         */

        create: function (ls, wpsconfig) {
            layerStore = ls ;
            map = ls.map;
            config = wpsconfig.options;
            if (config.title){
                title = config.title;
            }
            if (config.abstract){
                abstract = config.abstract;
            }
            var menuitems = new Ext.menu.Item({
                text: title,				
                iconCls: 'agrhys',
		qtip: abstract,
		listeners:{afterrender: function( thisMenuItem ) {
		    Ext.QuickTips.register({
		        target: thisMenuItem.getEl().getAttribute("id"),
		        title: thisMenuItem.initialConfig.text,
		        text: thisMenuItem.initialConfig.qtip
		    });
		}},
                menu: new Ext.menu.Menu({
                    listeners: {
                        beforeshow: function () {
                            (enableSelectionTool(map) == true) ? Ext.getCmp('showgraphfromselection').enable() : Ext.getCmp('showgraphfromselection').disable();
                        }
                    },
                    items: [{
                        text: tr("vidae.showgraph"),
                        handler: function () {
                            showgraph(false);
                        }
                    }, {
                        id: "showgraphfromselection",
                        text: tr("vidae.showgraphfromselection"),
                        iconCls: "geor-btn-metadata",
                        handler: function () {
                            showgraph(true);
                        }
                    }]
                })
            });
            return menuitems;
        }
    }
})();
