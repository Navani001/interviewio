"use client"

import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibmF2YW5paGsiLCJhIjoiY204MDIzOGxkMDZvZTJqczU2aGp5d3hneSJ9.i8pFygCwbKS6zYBv2_5ZCQ'

export function MapBox() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (map.current) return;

        if (!mapContainer.current) return;

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(position => {
                console.log(position.coords.latitude, position.coords.longitude);


            });

        }
        // Initialize the map
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/standard', // Changed to streets-v11 which definitely has waterway-label
            center: [77.27752542755714, 11.494102635566897],
            zoom: 3
        });

        map.current.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true,
                showUserHeading: true
            })
        );


        // Add the heatmap when the map is loaded
        map.current.on('load', () => {
            // Check if the map still exists
            if (!map.current) return;
            map.current.setConfigProperty('basemap', 'lightPreset', 'dusk');
            // Add the earthquake data source

            map.current.addSource('earthquakes', {
                type: 'geojson',
                data: {
                    "type": "FeatureCollection",
                    "features":
                        [
                            { "type": "Feature", "properties": { "id": "ak16994521", "mag": 2.3, "time": 1507425650893, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [10.942136, 78.082663] } },
                            { "type": "Feature", "properties": { "id": "ak16994519", "mag": 1.7, "time": 1507425289659, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [78.082663, 10.942136] } },
                            { "type": "Feature", "properties": { "id": "ak16994517", "mag": 1.6, "time": 1507424832518, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [12.60307000, 77.85193000, 105.5] } },
                            { "type": "Feature", "properties": { "id": "ci38021336", "mag": 1.42, "time": 1507423898710, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [12.60307000, 77.85193000, 105.5] } },
                            { "type": "Feature", "properties": { "id": "us2000b2nn", "mag": 4.2, "time": 1507422626990, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-87.6901, 12.0623, 46.41] } },
                            { "type": "Feature", "properties": { "id": "ak16994510", "mag": 1.6, "time": 1507422449194, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [78.082663, 10.942136] } },
                            { "type": "Feature", "properties": { "id": "us2000b2nb", "mag": 4.6, "time": 1507420784440, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-178.4576, -20.2873, 614.26] } },
                            { "type": "Feature", "properties": { "id": "ak16994298", "mag": 2.4, "time": 1507419370097, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-148.789, 63.1725, 7.5] } },
                            { "type": "Feature", "properties": { "id": "nc72905861", "mag": 1.39, "time": 1507418785100, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-120.993164, 36.421833, 6.37] } },
                            { "type": "Feature", "properties": { "id": "ci38021304", "mag": 1.11, "time": 1507418426010, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-117.0155, 33.656333, 12.37] } },
                            { "type": "Feature", "properties": { "id": "ak16994293", "mag": 1.5, "time": 1507417256497, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [77.27751247984386, 11.494112450605481] } },
                            { "type": "Feature", "properties": { "id": "ak16994287", "mag": 2.0, "time": 1507413903714, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-151.4378, 63.0933, 0.0] } },
                            { "type": "Feature", "properties": { "id": "ak16994285", "mag": 1.5, "time": 1507413670029, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-149.6538, 63.2272, 96.8] } },
                            { "type": "Feature", "properties": { "id": "ak16994283", "mag": 1.4, "time": 1507413587442, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [77.27751247984386, 11.494112450605481] } },
                            { "type": "Feature", "properties": { "id": "ak16994280", "mag": 1.3, "time": 1507413266231, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [77.27751247984386, 11.494112450605481] } },
                            { "type": "Feature", "properties": { "id": "ak16994278", "mag": 1.8, "time": 1507413195076, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-150.8597, 61.6214, 50.0] } },
                            { "type": "Feature", "properties": { "id": "ak16993960", "mag": 1.4, "time": 1507405129739, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-147.3106, 61.5726, 26.9] } },
                            { "type": "Feature", "properties": { "id": "ak16993952", "mag": 1.7, "time": 1507403679922, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-150.5846, 60.2607, 34.2] } },
                            { "type": "Feature", "properties": { "id": "ci38021224", "mag": 1.04, "time": 1507401391710, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-116.929, 34.254833, 18.27] } },
                            { "type": "Feature", "properties": { "id": "ak16993752", "mag": 1.3, "time": 1507401212982, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-151.5065, 63.0847, 0.0] } },
                            { "type": "Feature", "properties": { "id": "ak16993746", "mag": 1.3, "time": 1507399350671, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-147.8929, 63.5257, 3.3] } },
                            { "type": "Feature", "properties": { "id": "us2000b2jk", "mag": 4.6, "time": 1507398878400, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-175.7258, -18.9821, 195.22] } },
                            { "type": "Feature", "properties": { "id": "ak16993741", "mag": 1.6, "time": 1507398797233, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-151.3473, 63.0775, 0.0] } },
                            { "type": "Feature", "properties": { "id": "nc72905766", "mag": 2.64, "time": 1507397278960, "felt": 4, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-121.137497, 36.579834, 7.72] } },
                            { "type": "Feature", "properties": { "id": "ak16993738", "mag": 1.4, "time": 1507396778206, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-151.1075, 61.8312, 71.7] } },
                            { "type": "Feature", "properties": { "id": "ak16993736", "mag": 1.2, "time": 1507396542471, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-151.3769, 63.0621, 0.0] } },
                            { "type": "Feature", "properties": { "id": "us2000b2ii", "mag": 4.3, "time": 1507395765330, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-94.8319, 16.7195, 58.84] } },
                            { "type": "Feature", "properties": { "id": "uw61339006", "mag": 1.91, "time": 1507395622730, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-120.689833, 47.049167, 5.38] } },
                            { "type": "Feature", "properties": { "id": "ak16993732", "mag": 1.7, "time": 1507395602456, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-151.5283, 63.0785, 0.0] } },
                            { "type": "Feature", "properties": { "id": "ak16993720", "mag": 2.5, "time": 1507394741482, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-151.6683, 60.7696, 67.1] } },
                            { "type": "Feature", "properties": { "id": "ci38021048", "mag": 1.02, "time": 1507388708760, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-117.225, 34.0335, 0.39] } },
                            { "type": "Feature", "properties": { "id": "us2000b2cx", "mag": 4.9, "time": 1507343887900, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [69.1471, -23.7671, 10.0] } },
                            { "type": "Feature", "properties": { "id": "nc72905496", "mag": 1.94, "time": 1507341324260, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-121.101166, 40.842499, 6.01] } },
                            { "type": "Feature", "properties": { "id": "us2000b2cc", "mag": 5.0, "time": 1507340745260, "felt": null, "tsunami": 1 }, "geometry": { "type": "Point", "coordinates": [132.668, 1.1151, 7.01] } },
                            { "type": "Feature", "properties": { "id": "ci38020800", "mag": 1.46, "time": 1507340726000, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-116.462667, 33.466333, 5.78] } },
                            { "type": "Feature", "properties": { "id": "ak16991706", "mag": 1.7, "time": 1507339655320, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-141.2596, 60.2328, 0.0] } },
                            { "type": "Feature", "properties": { "id": "ak16991711", "mag": 1.6, "time": 1507339653625, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-141.2013, 60.2021, 10.5] } },
                            { "type": "Feature", "properties": { "id": "ak16991704", "mag": 1.7, "time": 1507338343941, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-149.7575, 62.4396, 50.8] } },
                            { "type": "Feature", "properties": { "id": "us2000b2av", "mag": 4.3, "time": 1507329021540, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [138.9649, 43.0121, 217.94] } },
                            { "type": "Feature", "properties": { "id": "nn00608329", "mag": 1.3, "time": 1507328136999, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-117.1198, 37.3861, 8.7] } },
                            { "type": "Feature", "properties": { "id": "ci38020720", "mag": 1.45, "time": 1507327306610, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-116.955667, 34.34, -0.29] } },
                            { "type": "Feature", "properties": { "id": "uw61338531", "mag": 1.37, "time": 1507326914640, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-122.991667, 46.572333, -0.3] } },
                            { "type": "Feature", "properties": { "id": "us2000b27a", "mag": 2.4, "time": 1507317641850, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-98.2269, 36.6265, 5.07] } },
                            { "type": "Feature", "properties": { "id": "ak16991058", "mag": 2.6, "time": 1507317554328, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-146.3172, 63.6837, 3.7] } },
                            { "type": "Feature", "properties": { "id": "ci38020656", "mag": 1.03, "time": 1507317548410, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-117.646667, 36.148333, 0.93] } },
                            { "type": "Feature", "properties": { "id": "ci38020648", "mag": 1.08, "time": 1507317476900, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-118.1915, 35.0025, -0.87] } },
                            { "type": "Feature", "properties": { "id": "nc72905416", "mag": 1.19, "time": 1507317386760, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-118.803333, 37.457667, -0.31] } },
                            { "type": "Feature", "properties": { "id": "uw61338426", "mag": 1.65, "time": 1507316609360, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-121.7105, 43.553333, 7.02] } },
                            { "type": "Feature", "properties": { "id": "mb80259489", "mag": 1.66, "time": 1507316359200, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-112.477167, 45.9945, -2.0] } },
                            { "type": "Feature", "properties": { "id": "ci38020624", "mag": 1.22, "time": 1507316271630, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-116.362, 32.941333, 10.15] } },
                            { "type": "Feature", "properties": { "id": "ak16991011", "mag": 2.0, "time": 1507315584886, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-148.9279, 62.7834, 4.5] } },
                            { "type": "Feature", "properties": { "id": "us2000b26p", "mag": 4.7, "time": 1507315424010, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [68.9568, -49.2119, 13.54] } },
                            { "type": "Feature", "properties": { "id": "uu60251447", "mag": 2.18, "time": 1507314096180, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-111.457, 42.633167, 4.91] } },
                            { "type": "Feature", "properties": { "id": "nc72905411", "mag": 1.24, "time": 1507313481610, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-121.962333, 37.920333, -0.33] } },
                            { "type": "Feature", "properties": { "id": "us2000b260", "mag": 4.4, "time": 1507311862190, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [86.7487, 30.0165, 10.0] } },
                            { "type": "Feature", "properties": { "id": "ci38020552", "mag": 1.28, "time": 1507311788210, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-118.351667, 35.052833, -1.01] } },
                            { "type": "Feature", "properties": { "id": "us2000b20f", "mag": 5.4, "time": 1507301800580, "felt": 169, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [141.1969, 37.0997, 47.42] } },
                            { "type": "Feature", "properties": { "id": "ak16990465", "mag": 1.7, "time": 1507301707708, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-156.519, 67.5663, 0.0] } },
                            { "type": "Feature", "properties": { "id": "ci38020392", "mag": 2.6, "time": 1507301676460, "felt": 1, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-115.894167, 31.614, 5.89] } },
                            { "type": "Feature", "properties": { "id": "ak16990463", "mag": 1.6, "time": 1507300956103, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [-152.1925, 59.8037, 20.0] } },
                        ]
                }
            });

            // Try to find a good insertion point in the map style
            const firstSymbolId = getFirstSymbolLayerId(map.current);
            // new mapboxgl.Marker().setLngLat([ 78.082663,10.942136]).addTo(map.current);

            // Add the heatmap layer
            map.current.addLayer(
                {
                    id: 'earthquakes-heat',
                    type: 'heatmap',
                    source: 'earthquakes',
                    maxzoom: 20,
                    paint: {
                        'heatmap-weight': [
                            'interpolate',
                            ['linear'],
                            ['get', 'mag'],
                            0, 0,
                            6, 1
                        ],
                        'heatmap-intensity': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            0, 1,
                            9, 3
                        ],
                        "heatmap-color": ["interpolate", ["linear"], ["heatmap-density"], 0, "rgba(0, 0, 255, 0)", 0.1, "#ffffb2", 0.3, "#feb24c", 0.5, "#fd8d3c", 0.7, "#fc4e2a", 1, "#e31a1c"],
                        'heatmap-radius': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            0, 2,
                            9, 20
                        ],
                        'heatmap-opacity': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            7, 1,
                            9, 0
                        ]
                    }
                },
                firstSymbolId // Insert before the first symbol layer
            );

            // Add the point layer
            map.current.addLayer(
                {
                    id: 'earthquakes-point',
                    type: 'circle',
                    source: 'earthquakes',
                    minzoom: 7,
                    paint: {
                        'circle-radius': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            7, ['interpolate', ['linear'], ['get', 'mag'], 1, 1, 6, 4],
                            16, ['interpolate', ['linear'], ['get', 'mag'], 1, 5, 6, 50]
                        ],
                        'circle-color': [
                            'interpolate',
                            ['linear'],
                            ['get', 'mag'],
                            1, 'rgb(255,255,255)',     // Transparent green
                            2, 'rgb(255,255,255)', // Light green
                            3, 'rgb(255,255,255)',    // Yellow
                            4, 'rgb(255,255,255)',    // Orange
                            5, 'rgb(255,255,255)',     // Orange-red
                            6, 'rgb(255,255,255)'
                        ],
                        'circle-stroke-color': 'white',
                        'circle-stroke-width': 1,
                        'circle-opacity': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            7, 0,
                            8, 1
                        ]
                    }
                },
                firstSymbolId // Insert before the first symbol layer
            );
        });
        // new mapboxgl.Marker().setLngLat([-147.8929, 63.5257]).addTo(mapContainer);

        // Helper function to find the first symbol layer
        function getFirstSymbolLayerId(map: any) {
            if (map) {

                const layers = map.getStyle().layers;
                for (let i = 0; i < layers.length; i++) {
                    if (layers[i].type === 'symbol') {
                        return layers[i].id;
                    }
                }
            }
            // Find the index of the first symbol layer in the map style

            return undefined;
        }

        // Cleanup on unmount
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    return <div ref={mapContainer} style={{ height: '100vh' }} />;
}