/*
 * Copyright (C) 2010  Agrocampus Ouest
 *
 * This file is part of geOrchestra / Vidae
 *
 * MapFish Client is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * GeoBretagne is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Agrocampus Ouest.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * Method: displayVIDAE
 * Display graphic for the selected features
 */

/*
 * @requires OpenLayers/Filter/Comparison.js
 * @include OpenLayers/Filter/Logical.js
 * @include OpenLayers/Format/Filter.js
 * @include OpenLayers/Format/XML.js
 * @include GEOR_ows.js
 */

var displayVIDAE = function(tabObject, tabField) {

    var vidaeRoot = "http://geoxxx.agrocampus-ouest.fr/proxy/?url=http://agrhys.fr/BVE/gvidae/"
//    var vidaeRoot = "http://geowww.agrocampus-ouest.fr/gvidae/"
        //	var urlPrefixe = "http://geowww.agrocampus-ouest.fr/gvidae/src/php/line.php?Var=" ;
        //	var urlPrefixe = vidaeRoot + "src/php/linehydras.php?Var=" ;
    var urlPrefixe = "http://agrhys.fr/BVE/gvidae/src/php/graph.php?Var=";
    // lancer l'export exportjour
    var urlExportCSV = vidaeRoot + "src/php/exportjourhydras.php?Var=";
    // var urlExportCSV ="http://w3.rennes.inra.fr/hysae/index.php";
    // la liste des piezos DOIT etre initialisee comme vide !
    var objectList = "";
    var filter = "";
    // la liste des types de données DOIT etre initialisee comme vide !
    var fieldList = "";
    var urlGraph = "";
    var chaineVar = "";
    var nbTabs = 1;
    var base = '1,3';

    /**
     * Method: getFeature
     *
     * Parameters:
     */
    var getFeature = function() {
        var selNodes = panelSensor.getChecked();
        var tabObjectSelected = new Array();
        filter = '';
       
        console.log("getfeature...");
// filter=(location_id = '1') OR (location_id = '3') GEOR_querier.js:194
        Ext.each(selNodes, function(node) {
            if (filter.length > 0) {
                filter += " OR " ;
            }
            filter += "(location_id = '"+node.attributes.location_id+"')"; // pour chaque node recherche du location_id
        });
        console.log ("filter="+filter) ;
        if (this.map.layers) {
            console.log ("nombre de couches: "+this.map.layers.length) ;
        }else{
            console.log ("NO LAYER ZONE!") ;
        }
        Ext.each(this.map.layers, function(layer) {
            console.log ("layer id="+layer.id+"/ name="+layer.name) ;
        }) ;

/*
        GEOR.ows.WFSProtocol(record, map, {geometryName: geometryName}).read({
            maxFeatures: GEOR.config.MAX_FEATURES,
            // some mapserver versions require that we list all fields to return  
            // (as seen with 5.6.1): 
            // see http://applis-bretagne.fr/redmine/issues/1996
            propertyNames: layerFields || [],  
            filter: filter, 
            callback: function(response) {
                // Houston, we've got a pb ...
        
                // When using WFS 1.0, getFeature requests are honored with geodata in the original data's SRS 
                // ... which might not be the map SRS !
                // When using GeoServer, an additional parameter can be used (srsName) to ask for feature reprojection, 
                // which is not part of the WFS 1.0 spec
                // When using MapServer, it seems that we have no way to do the same.
        
                // So, basically, we have two solutions :
                // - stick to WFS 1.1 spec, which leaves WFS servers with old MapServers unqueryable. 
                //   We don't want that.
                // - stick to WFS 1.0 spec and add the srsName parameter (in case we're in front of a GeoServer). 
                // In that case, WFSes made with MapServer will return geometries in the original data SRS ... 
                // which could be parsed, and reprojected on the client side using proj4js when user agrees to do so
        
                if (!response.success()) {
                    return; 
                }       
        
                var model =  (attStore.getCount() > 0) ? new GEOR.FeatureDataModel({
                    attributeStore: attStore
                }) : null; 

                observable.fireEvent("searchresults", {
                    features: response.features,
                    model: model,
                    tooltip: name + " - " + tr("WFS GetFeature on filter"),
                    title: GEOR.util.shortenLayerName(name)
                });     
            },      
            scope: this
        });     
*/

    }

    /**
     * Method: displayGraph
     *
     * Parameters:
     */
    var displayGraph = function() {
        var msg = '';
        imgscr = '';
        urlGraph = '';
        var selNodes = panelSensor.getChecked();
        //	    var selNodesW = panelType.getChecked();
        var selNodesW = Ext.getCmp('treeeast').getChecked();
        var tabObjectSelected = new Array();
        var tabFieldSelected = new Array();
        var chaine = "";
        var chaineFinale = "";
        var tailleChaine = 0;
        fieldList = '';
        objectList = '';
        filter = '';
       

        var tab = tabs.getActiveTab();
        console.log('Current tab: ' + 'jpgraphic_' + tab.id);
        console.log("Base selectionnee : " + base);

        Ext.each(selNodes, function(node) {
            if (objectList.length > 0) {
                objectList += ',';
            } else {
                //		    Ext.getCmp ('jpgraphic').getEl().dom.src = vidaeRoot + 'src/img/PasDeDonnee.png' ; }
                Ext.getCmp('jpgraphic_' + tab.id).getEl().dom.src = vidaeRoot + 'src/img/PasDeDonnee.png';
            }
            objectList += node.attributes.location_id; // pour chaque node recherche du location_id
            tabObjectSelected = objectList.split(","); // on sépare chaque valeur du caractère indiqué
        });

        Ext.each(selNodesW, function(node) {
            if (fieldList.length > 0) {
                fieldList += ',';
            }
            fieldList += node.attributes.typedonnees;
            if (fieldList.length < 0) {
                alert("ERREUR : vous de vez sÃ©lectionner au moins un type de donnÃ©es");
            }
            tabFieldSelected = fieldList.split(",");
        });


        for (i = 0; i < tabObjectSelected.length; i++) {
            for (j = 0; j < tabFieldSelected.length; j++) {
                chaine += tabObjectSelected[i] + "," + tabFieldSelected[j] + "-";
            };
        };

        tailleChaine = chaine.length;
        chaineFinale = chaine.substring(0, tailleChaine - 1);
        console.log("chaineFinale=" + chaineFinale);
        if (tailleChaine > 0) {
            urlGraph = urlPrefixe + chaineFinale + "&base=" + base;
            //		Ext.getCmp ('jpgraphic').getEl().dom.src = imgsrc ;
            Ext.getCmp('jpgraphic_' + tab.id).getEl().dom.src = urlGraph;
        }
    };

    if ((tabObject.length > 0) && (tabField.length > 0)) {
        for (var i = 0; i < tabObject.length; i++) {
            for (var j = 0; j < tabField.length; j++) {
                chaineVar += tabObject[i] + "," + tabField[j] + "-";
            }
        }
    }

    urlGraph = urlPrefixe + chaineVar.substring(0, chaineVar.length - 1) + "&base=" + base;


    if (tabObject.length > 0) // y a t il + d'un PointDeMesure
    {
        objectList += tabObject[0];
        // on parcourt la liste des PointDeMesure 
        for (var i = 1; i < tabObject.length; i++)
            objectList += "," + tabObject[i];
    } else {
        objectList += "";
    }


    if (tabField.length > 0) {
        fieldList += "" + tabField[0];
        for (var i = 1; i < tabField.length; i++)
            fieldList += "," + tabField[i];
    } else {
        fieldList += "";
    }

    // First tab panel
    var newTab = function() {

        nbTabs++;
        console.log("New Tab " + nbTabs);
        var tab = new Ext.form.FormPanel({
            bodyStyle: "padding:1px",
            title: 'Graphique ' + nbTabs,
            id: nbTabs,
            closable: true,
            items: [{
                xtype: "component",
                id: 'jpgraphic_' + nbTabs,
                title: urlGraph,
                autoEl: {
                    name: 'graphic ' + nbTabs,
                    tag: 'iframe',
                    height: 500,
                    width: "100%",
                    frameborder: 0,
                    src: urlGraph
                }
            }]
        });

        tabs.add(tab);
        console.log("insert en " + tabs.items.length - 1);
        //    	    tabs.insert(nbTabs-1, tab).
        tabs.setActiveTab(nbTabs);
    }



    // First tab panel
    var formPanel1 = new Ext.form.FormPanel({
        bodyStyle: "padding:0px",
        items: [{
            xtype: "component",
            id: 'jpgraphic_1',
            title: urlGraph,
            autoEl: {
                name: 'graphic 1',
                tag: 'iframe',
//                height: "100%",
                height: "500",
                width: "100%",
                frameborder: 0,
                src: urlGraph
            }
        }]
    });

    var plusTab = new Ext.Panel({
        id: 'plus',
        title: '+',
        listeners: {
            activate: function() {
                newTab();
            }
        }
    });

    // tabs for the center
    var tabs = new Ext.TabPanel({
        region: 'center',
        activeTab: 0,
        defaults: {
            autoScroll: true
        },

        items: [{
            title: 'Graphique 1',
            bodyStyle: "padding:0px",
            id: 1,
            items: [formPanel1]
        }, plusTab]
    });

// 
    var basefct = function() {
        var premier = true ;
        base = '' ;

        if (Ext.getCmp('checkbox1').getValue()){
            premier = false ;
            base = '1' ;
	}
        if (Ext.getCmp('checkbox2').getValue()){
            if (premier)	{
                premier = false ;
	    }else{ 
                base += ',' ;
            }
            base += '2' ;
	}
        if (Ext.getCmp('checkbox3').getValue()){
            if (premier)	{
                premier = false ;
	    }else{ 
                base += ',' ;
            }
            base += '3' ;
	}
        console.log("Base selectionnee: " + base);
        displayGraph();
/*
        if (this.checked) {
            base = this.inputValue;
            console.log("Base selectionnee: " + base);
            displayGraph();
        }
*/
    }

    var panelData = new Ext.form.FormPanel({
        title: 'Selection des Donnees',
        region: 'east',
        split: true,
        width: 280,
        collapsible: true,
        margins: '3 0 3 3',
        cmargins: '3 3 3 3',
        useArrows: true,
        autoScroll: true,
        animate: true,
        enableDD: true,
        containerScroll: true,
        rootVisible: false,
        frame: true,
        items: [{
            id: 'baseitem',
            xtype: 'fieldset',
            //                xtype: 'checkboxfield',
            title: 'Base de Donnees',
            collapsible: true,
            animate: true,
            autoHeight: true,
            defaultType: 'checkbox', // each item will be a radio button
            listeners: {
                change: function(field, newValue, oldValue) {
                    console.log('change:');
                    console.log('change:' + newValue + ' ' + oldValue);
                }
            },
            items: [{
                id: 'checkbox1',
                boxLabel: 'Brutes',
                name: 'rb-col',
                inputValue: 1,
                checked: true,
                fieldLabel: 'Donnees',
                handler: basefct
            }, {
                id: 'checkbox2',
                boxLabel: 'Validees',
                name: 'rb-col',
                inputValue: 2,
                handler: basefct
            }, {
                id: 'checkbox3',
                boxLabel: 'Elaborees ',
                name: 'rb-col',
                inputValue: 3,
                checked: true,
                handler: basefct
            }]
        }, {
            xtype: 'fieldset',
            title: "Types de donnees",
            collapsible: true,
            animate: true,
            autoHeight: true,
            items: [{
                id: 'treeeast',
                xtype: 'treepanel',
                useArrows: true,
                animate: true,
                rootVisible: false,
                listeners: {
                    'checkchange': function(node, checked) {
                        if (checked) {
                            displayGraph();
                            node.getUI().addClass('complete');
                        } else {
                            displayGraph();
                            node.getUI().removeClass('complete');
                        }
                    },
                    render: function() {
                        this.getRootNode().expand();
                    }
                },
                loader: new Ext.tree.TreeLoader({
                    dataUrl: vidaeRoot + 'src/php/treeWest.php?selectedleaf=' + fieldList
                }),
                root: {
                    nodeType: 'async',
                    id: 'node-root'
                }
            }]
        }]
    });

    // Panel for the west treePanel. A supprimer ! 
    var panelType = new Ext.tree.TreePanel({
        title: 'Selection des Donnees',
        region: 'east',
        split: true,
        width: 250,
        collapsible: true,
        margins: '3 0 3 3',
        cmargins: '3 3 3 3',
        useArrows: true,
        autoScroll: true,
        animate: true,
        enableDD: true,
        containerScroll: true,
        rootVisible: false,
        frame: true,
        root: {
            nodeType: 'async',
            id: 'node-root'
        },

        dataUrl: vidaeRoot + 'src/php/treeWest.php?selectedleaf=' + fieldList,

        listeners: {
            'checkchange': function(node, checked) {
                if (checked) {
                    displayGraph();
                    node.getUI().addClass('complete');
                } else {
                    displayGraph();
                    node.getUI().removeClass('complete');
                }
            },
            render: function() {
                this.getRootNode().expand();
            }
        },
        buttons: [{
            text: 'Effacer',
            handler: function() {
                console.log(panelType.getLoader());
                fieldList = '';
                panelType.getLoader().dataUrl = vidaeRoot + 'src/php/treeWest.php?selectedleaf=' + fieldList;
                panelType.getLoader().load(panelType.root);
            }
        }]
    });

    // Panel for the east. A garder !
    var panelSensor = new Ext.tree.TreePanel({
        title: 'Point de Mesure',
        region: 'west',
        split: true,
        width: 180,
        collapsible: true,
        margins: '3 0 3 3',
        cmargins: '3 3 3 3',
        useArrows: true,
        autoScroll: true,
        animate: true,
        enableDD: true,
        containerScroll: true,
        rootVisible: false,
        frame: true,
        root: {
            nodeType: 'async',
            id: 'node-root'
        },

        dataUrl: vidaeRoot + 'src/php/treeEast.php?selectedleaf=' + objectList,

        listeners: {
            'checkchange': function(node, checked) {
                if (checked) {
                    getFeature();
                    displayGraph();
                    node.getUI().addClass('complete');
                } else {
                    getFeature();
                    displayGraph();
                    node.getUI().removeClass('complete');
                }
            },
            render: function() {
                this.getRootNode().expand();

            }
        },
        columns: 2,

        buttons: [{
                xtype: 'button',
                width: '40%',
                align: 'right',
                text: 'Effacer',
                handler: function() {
                    var tab = tabs.getActiveTab();
                    console.log('Current tab: ' + tab.id + 'item id=' + 'jpgraphic_' + tab.id);

                    //		                    Ext.getCmp ('jpgraphic_'+tab.id).getEl().dom.src = vidaeRoot + 'src/img/PasDeDonnee.png' ; 
                    Ext.getCmp('jpgraphic_' + tab.id).getEl().dom.src = vidaeRoot + 'src/img/PasDeSelection.png';

                    console.log(panelType.getLoader());
                    objectList = '';
                    //alert ('objectList '+objectList);
                    panelSensor.getLoader().dataUrl = vidaeRoot + 'src/php/treeEast.php?selectedleaf=' + objectList;
                    panelSensor.getLoader().load(panelSensor.root);
                }
            },

            {
                xtype: 'button',
                width: '40%',
                align: 'right',
                text: 'Rafraichir',
                handler: function() {
                    displayGraph();
                }
            }
        ]

    });


    var win = new Ext.Window({
        title: 'Grapheur VIDAE',
        //        closable:true,
        //      layout : 'border',
        //      border : '5 5 5 5',
//        height: Ext.getBody().getViewSize().height - 10,
//        width: Ext.getBody().getViewSize().width - 10,
        		x:50,
        		y:50,
        		width:1070,
        		height:600,
        //border:false,
        plain: true,
        layout: 'border',
        items: [panelData, panelSensor, tabs]
            //	items: [panelType, panelSensor, tabs]
    });

    //	selectObject.getRootNode().expand(true);
    win.show(this);
};
