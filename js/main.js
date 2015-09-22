/*
 * @include GeoExt/data/FeatureStore.js
 * @include GeoExt/data/LayerRecord.js
 * @include GeoExt/data/LayerStore.js
 * @include OpenLayers/Layer/Markers.js
 * @include OpenLayers/Marker.js
 * @include OpenLayers/Map.js
 * @include OpenLayers/Icon.js
 * @include OpenLayers/Request.js
 * @include OpenLayers/Format/OWSCommon/v1_1_0.js
 * @include OpenLayers/Handler/Point.js
 * @include OpenLayers/Handler/Path.js
 * @include GEOR.js
 * @include GEOR_util.js
 * @include GEOR_waiter.js
 * @include GEOR_getfeatureinfo.js
 * @include GEOR_ResultsPanel.js
 * @include GEOR_selectfeature.js
 * @include VIDAE.js
 *
 */

Ext.namespace("GEOR.Addons");

GEOR.Addons.Vidae = Ext.extend(GEOR.Addons.Base, {

    /**
     * Property: map
     * {OpenLayers.Map} The map instance.
     */
    map: null,

    /**
     * Property: layerStore
     * {GeoExt.data.LayerStore} The application's layer store.
     */
    layerStore: null,

    /**
     * Property: layerRecord
     * {GeoExt.data.LayerRecord} contains only layers queryable
     */
    layerRecord: null,

    /**
     * Property: popup
     * {GeoExt.Popoup.} Display popup window.
     */
    popup: null,

    /**
     * Method: tr
     * Translation please !
     */
    tr: function (str) {
        return OpenLayers.i18n(str);
    },

    /**
     * Method: init
     *
     * Parameters:
     * record - {Ext.data.record} a record with the addon parameters
     */
    init: function (record) {
        var lang = OpenLayers.Lang.getCode() ;
        mask = new Ext.LoadMask (Ext.getBody(), {
            msg: tr("Loading...")
        }) ;
        map = this.map;
        layerStore  = Ext.getCmp("mappanel").layers;
        this.initVIDAELayers(layerStore, this.options.VIDAE_LAYERS) ;
        this.defControlClickSensor();
        this.clicksensor = new OpenLayers.Control.Click();
        this.map.addControl(this.clicksensor);
        var vidaeMenu =  new Ext.menu.Menu({
            listeners: {
                beforeshow: function () {
                    (this.enableSelectionTool(map) == true) ? Ext.getCmp('showgraphfromselection').enable() : Ext.getCmp('showgraphfromselection').disable();
                },
                scope: this
            },
            items: [
                new Ext.menu.CheckItem (new Ext.Action ({
                    id: "clicksensor",
                    iconCls: 'drawpoint',
                    text: tr("vidae.selectsensor"),
                    map: map,
                    toggleGroup: 'map',
                    enableToggle: true,
                    allowDepress: true,
                    tooltip: tr("vidae.selectsensortooltip"),
                    handler: function () {
                        if (this.layerRecord) {
                            GEOR.getfeatureinfo.toggle(this.layerRecord, true);
                            console.log ("in handler layerRecord OK") ;
                        }else {
                            GEOR.getfeatureinfo.toggle(false, true);
                            console.log ("in handler layerRecord vide") ;
                        }
                    },
                    scope: this
                })),
            {
                text: tr("vidae.showgraph"),
                handler: function () {
                    this.showgraph(false);
                },
                scope: this
            }, {
                id: "showgraphfromselection",
                text: tr("vidae.showgraphfromselection"),
                iconCls: "geor-btn-metadata",
                handler: function () {
                    this.showgraph(true);
                },
                scope: this
            }],
            scope: this
        })

        if (this.target) {
            // addon placed in toolbar
            this.components = this.target.insertButton(this.position, {
                xtype: 'button',
//                enableToggle: true,
                toggleGroup: 'map',
                tooltip: this.getTooltip(record), 
                iconCls: 'vidae-icon',
                menu: vidaeMenu, 
                scope: this 
            });
            this.target.doLayout();
        } else {
            // addon placed in "tools menu"
            this.item = new Ext.menu.CheckItem({
                text: this.getText(record), 
                qtip: this.getQtip(record),
                iconCls: 'vidae-icon',
                menu: vidaeMenu, 
                scope: this 
            });
        }
    },

    initVIDAELayers: function (ls,vl) {

        console.log ("Liste des couches VIDAE : ") ; // debug infos
        for (i=0 ; i < vl.length ; i++)	{
            console.log ("    name="+vl[i].name+" / url="+vl[i].url+" / layers="+vl[i].layer) ;
        } 
        console.log ("Liste des couches affichées: ") ; // debug infos
        var c = GEOR.util.createRecordType();
        ls.each (function (record)  {
            var layer = record.get('layer');
            var layerName = record.get ('name') ;
            var owsURL = record.get ('WFS_URL') ;
            var queryable = record.get('queryable');
            if (queryable) {
                console.log ("    name="+layer.name+" / url="+owsURL+" / layers="+layerName) ;
                for (i=0 ; i < vl.length ; i++)	{
                    if (owsURL == vl[i].url && layerName == vl[i].layer) {
                        console.log ("VIDAE OK    name="+layer.name+" / url="+owsURL+" / layers="+layerName) ;
                        var record = new c({layer: layer, name: layerName, type: "WMS"});
                        this.layerRecord = record.clone () ;
                        if (this.layerRecord) {
                            console.log ("ICI layerRecord OK") ;
                        }else {
                            console.log ("ICI layerRecord vide") ;
                        }
                    }    
                }
            }
        }) ;
    },

    /**
     * Method: showgraph
     * display graph
     *
     * selection - {boolean} .
     */
    showgraph: function (selection) {
        var tabField = new Array () ;
        tabField = this.options.VIDAE_LAYERS[0].default_data_type ;
        GEOR.waiter.show()
        if (selection) {
            var searchLayers = map.getLayersByName(/__georchestra_results_*/);
            var filterLayers = map.getLayersByName('__georchestra_filterbuilder');
            if (filterLayers.length > 0) {
                if (filterLayers[0].features.length > 0) {
                    console.log ("filterLayers[0].features.length="+filterLayers[0].features.length) ;
                }

            }
            
            if (searchLayers.length > 0) {
                idLayer = searchLayers.length - 1;
                console.log ("Search Layer OK in showgraph") ;
                var selectedFeatures = searchLayers[idLayer].selectedFeatures;
                var features = (selectedFeatures.length > 0)?selectedFeatures:searchLayers[idLayer].features;
                console.log ("features.length="+features.length) ;
                if (features.length > 0) {
                    var tabPiezo = new Array (features.length) ;
                    for (var i = 0; i < features.length; i++) {
                        att = features[i].attributes ;
                        for (var key in att) {
                            if (!att.hasOwnProperty(key)) {
                                continue;
                            }
                            if (key == this.options.VIDAE_LAYERS[0].join_field){
                                tabPiezo[i] = att[key] ;
                                console.log (this.options.VIDAE_LAYERS[0].join_field+"="+tabPiezo[i]) ;
                            }
                        }
                    }
                }
            }
        } else {
            var default_piezo = (this.options.VIDAE_LAYERS[0].default_sensor_id==null)?[1]:this.options.VIDAE_LAYERS[0].default_sensor_id ;
            var tabPiezo = default_piezo ;
        };
        console.log ("displayVIDAE ("+tabPiezo+","+tabField+")") ;
        displayVIDAE (tabPiezo, tabField) ;
    }, 

    /**
     * Method: enableSelectionTool
     *
     * Retourne true si une selection est effectuee dans le Panel Results
     * Parameters:
     * m - {OpenLayers.Map} The map instance.
     */
    enableSelectionTool: function (m) {
        var response = false;
        var searchLayers = map.getLayersByName(/__georchestra_results_*/);
        console.log ("searchLayers.length="+searchLayers.length);
        console.log ("searchLayers.name="+searchLayers.name);
        if (searchLayers.length > 0) {
            idLayer = searchLayers.length - 1;
            console.log ("Search Layer OK in enableSelectionTool") ;
            var features = searchLayers[idLayer].features;
            var selectedFeatures = searchLayers[idLayer].selectedFeatures;
            if (features.length > 0 || selectedFeatures.length > 0) {
                response = true;
            }
        }else{
            console.log ("Search Layer vide") ;
        }
        return response;
    },

    /**
     * Method: showgraph
     * display graph
     *
     * selection - {boolean} .
     */
    showgraph: function (selection) {
        var tabField = new Array () ;
        tabField = this.options.VIDAE_LAYERS[0].default_data_type ;
        GEOR.waiter.show()
        if (selection) {
            var searchLayers = map.getLayersByName(/__georchestra_results_*/);
            var filterLayers = map.getLayersByName('__georchestra_filterbuilder');
            if (filterLayers.length > 0) {
                if (filterLayers[0].features.length > 0) {
                    console.log ("filterLayers[0].features.length="+filterLayers[0].features.length) ;
                }

            }
            
            if (searchLayers.length > 0) {
                idLayer = searchLayers.length - 1;
                console.log ("Search Layer OK in showgraph") ;
                var selectedFeatures = searchLayers[idLayer].selectedFeatures;
                var features = (selectedFeatures.length > 0)?selectedFeatures:searchLayers[idLayer].features;
                console.log ("features.length="+features.length) ;
                if (features.length > 0) {
                    var tabPiezo = new Array (features.length) ;
                    for (var i = 0; i < features.length; i++) {
                        att = features[i].attributes ;
                        for (var key in att) {
                            if (!att.hasOwnProperty(key)) {
                                continue;
                            }
                            if (key == this.options.VIDAE_LAYERS[0].join_field){
                                tabPiezo[i] = att[key] ;
                                console.log (this.options.VIDAE_LAYERS[0].join_field+"="+tabPiezo[i]) ;
                            }
                        }
                    }
                }
            }
        } else {
            var default_piezo = (this.options.VIDAE_LAYERS[0].default_sensor_id==null)?[1]:this.options.VIDAE_LAYERS[0].default_sensor_id ;
            var tabPiezo = default_piezo ;
        };
        console.log ("displayVIDAE ("+tabPiezo+","+tabField+")") ;
        displayVIDAE (tabPiezo, tabField) ;
    }, 

    /**
     * Method: enableSelectionTool
     *
     * Retourne true si une selection est effectuee dans le Panel Results
     * Parameters:
     * m - {OpenLayers.Map} The map instance.
     */
    enableSelectionTool: function (m) {
        var response = false;
        var searchLayers = map.getLayersByName(/__georchestra_results_*/);
        console.log ("searchLayers.length="+searchLayers.length);
        console.log ("searchLayers.name="+searchLayers.name);
        if (searchLayers.length > 0) {
            idLayer = searchLayers.length - 1;
            console.log ("Search Layer OK in enableSelectionTool") ;
            var features = searchLayers[idLayer].features;
            var selectedFeatures = searchLayers[idLayer].selectedFeatures;
            if (features.length > 0 || selectedFeatures.length > 0) {
                response = true;
            }
        }else{
            console.log ("Search Layer vide") ;
        }
        return response;
    },

    /**
     * Method: showgraph
     * display graph
     *
     * selection - {boolean} .
     */
    showgraph: function (selection) {
        var tabField = new Array () ;
        tabField = this.options.VIDAE_LAYERS[0].default_data_type ;
        GEOR.waiter.show()
        if (selection) {
            var searchLayers = map.getLayersByName(/__georchestra_results_*/);
            var filterLayers = map.getLayersByName('__georchestra_filterbuilder');
            if (filterLayers.length > 0) {
                if (filterLayers[0].features.length > 0) {
                    console.log ("filterLayers[0].features.length="+filterLayers[0].features.length) ;
                }

            }
            
            if (searchLayers.length > 0) {
                idLayer = searchLayers.length - 1;
                console.log ("Search Layer OK in showgraph") ;
                var selectedFeatures = searchLayers[idLayer].selectedFeatures;
                var features = (selectedFeatures.length > 0)?selectedFeatures:searchLayers[idLayer].features;
                console.log ("features.length="+features.length) ;
                if (features.length > 0) {
                    var tabPiezo = new Array (features.length) ;
                    for (var i = 0; i < features.length; i++) {
                        att = features[i].attributes ;
                        for (var key in att) {
                            if (!att.hasOwnProperty(key)) {
                                continue;
                            }
                            if (key == this.options.VIDAE_LAYERS[0].join_field){
                                tabPiezo[i] = att[key] ;
                                console.log (this.options.VIDAE_LAYERS[0].join_field+"="+tabPiezo[i]) ;
                            }
                        }
                    }
                }
            }
        } else {
            var default_piezo = (this.options.VIDAE_LAYERS[0].default_sensor_id==null)?[1]:this.options.VIDAE_LAYERS[0].default_sensor_id ;
            var tabPiezo = default_piezo ;
        };
        console.log ("displayVIDAE ("+tabPiezo+","+tabField+")") ;
        displayVIDAE (tabPiezo, tabField) ;
    }, 

    /**
     * Method: enableSelectionTool
     *
     * Retourne true si une selection est effectuee dans le Panel Results
     * Parameters:
     * m - {OpenLayers.Map} The map instance.
     */
    enableSelectionTool: function (m) {
        var response = false;
        var searchLayers = map.getLayersByName(/__georchestra_results_*/);
        console.log ("searchLayers.length="+searchLayers.length);
        console.log ("searchLayers.name="+searchLayers.name);
        if (searchLayers.length > 0) {
            idLayer = searchLayers.length - 1;
            console.log ("Search Layer OK in enableSelectionTool") ;
            var features = searchLayers[idLayer].features;
            var selectedFeatures = searchLayers[idLayer].selectedFeatures;
            if (features.length > 0 || selectedFeatures.length > 0) {
                response = true;
            }
        }else{
            console.log ("Search Layer vide") ;
        }
        return response;
    },

    /**
     * Method: defControlGetUCS
     *
     * Retourne true si une selection est effectuee dans le Panel Results
     * Parameters:
     * m - {OpenLayers.Map} The map instance.
     */
    defControlClickSensor: function () {
        addon = this ;
        OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
            defaultHandlerOptions: {
                'single': true,
                'double': false,
                'pixelTolerance': 0,
                'stopSingle': false,
                'stopDouble': false
            },
            initialize: function () {
                this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
                OpenLayers.Control.prototype.initialize.apply(this, arguments);
                this.handler = new OpenLayers.Handler.Point(
                this, {
                    'done': this.trigger,
                }, 
                this.handlerOptions
                );
            },
            trigger: function (pt) {
            },
            scope: this
        });
    },

    /**             
     * Method: onCheckchange 
     * Callback on checkbox state changed
     */     
    onCheckchange: function(item, checked) {
        if (checked) {
            GEOR.helper.msg("Vidae",
                OpenLayers.i18n("vidae.helper.msg")) ;
            this.clicksensor.activate();
        } else {
            this.clicksensor.deactivate();
            if (this.vectorLayer) {
            }
            if (this.popup) {
                this.popup.hide();
            }
        }
    },

    destroy: function() {        
       this.clicksensor.deactivate();
       this.clicksensor.destroy();
       if (this.popup) {
           this.popup.hide();
           this.popup = null;
       }
       this.map = null;
       GEOR.Addons.Base.prototype.destroy.call(this);
    }
});
