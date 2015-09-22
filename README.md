VIDAE ADDON
============ 

This addon allows users to display and download temporal datas from Environment Research Observatories.

author:@hsquividant.

Compatibility: geOrchestra >= 14.12

Config
------

Example addon config to include in your GEOR_custom.js file:

```json
    {
        "id": "vidae", // unique & stable string identifier for this addon instance
        "name": "Vidae",
        "title": {
            "en": "VIDAE",
            "es": "VIDAE",
            "fr": "VIDAE"
        },
        "description": {
            "en": "Un outil qui permet de visualiser les chroniques des points de mesure l'ORE AgrHys",
            "es": "Un outil qui permet de visualiser les chroniques des points de mesure l'ORE AgrHys",
            "fr": "Un outil qui permet de visualiser les chroniques des points de mesure l'ORE AgrHys"
        },
       "preloaded": "true",
        "options": {
            "target": "tbar_11" // VIDAE button in toolbar.
        }
    }
```


another example of addon config to query AgrHys AND Aicha database :

```json
    {
        "id": "vidae", // unique & stable string identifier for this addon instance
        "name": "Vidae",
        "title": {
            "en": "VIDAE",
            "es": "VIDAE",
            "fr": "VIDAE"
        },
        "description": {
            "en": "Un outil qui permet de visualiser les chroniques des points de mesure l'ORE AgrHys",
            "es": "Un outil qui permet de visualiser les chroniques des points de mesure l'ORE AgrHys",
            "fr": "Un outil qui permet de visualiser les chroniques des points de mesure l'ORE AgrHys"
        },
        "options": {
            "VIDAE_LAYERS": [
                {"name": "AgrHys", "url": "http://geowww.agrocampus-ouest.fr/geoserver/wfs?", "layer": "ore:pointdemesure", "join_field": "location_id", "default_sensor_id": [55], "default_data_type": [102,103]},
                {"name": "Aicha", "url": "http://geoxxx.agrocampus-ouest.fr/geoserverwps/wfs?" , "layer": "aicha:Berambadi_Monitoring_Borewell_Locations", "join_field": "location_id", "default_sensor_id": [1,3], "default_data_type": [102,103]}
            ]
        }
    }
```

