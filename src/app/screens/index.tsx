"use client"

import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibmF2YW5paGsiLCJhIjoiY204MDIzOGxkMDZvZTJqczU2aGp5d3hneSJ9.i8pFygCwbKS6zYBv2_5ZCQ'

export function MapBox() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map:any = useRef<mapboxgl.Map | null>(null);

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
            style: 'mapbox://styles/navanihk/cm89q8a4k00es01safi2zeeju', // Changed to streets-v11 which definitely has waterway-label
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
       
        // [
        //     {
        //         "id": "cctv",
        //         "type": "symbol",
        //         "paint": {},
        //         "layout": {
        //             "icon-image": "rocket",
        //             "text-field": [
        //                 "to-string",
        //                 [
        //                     "get",
        //                     "id"
        //                 ]
        //             ]
        //         },
        //         "source": "composite",
        //         "source-layer": "cctv"
        //     }
        // ]
        map.current.on('click', (e) => {
            console.log(`Latitude: ${e.lngLat.lat}, Longitude: ${e.lngLat.lng}`);
        });
        // Add the heatmap when the map is loaded
        map.current.on('load', () => {
            // Check if the map still exists
            if (!map.current) return;
         
            
            map.current.addSource('cctv', {
                type: 'geojson',
                data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_ports.geojson'
            });
           
            // map.current.getSource('composite').setData([]);
            console.log(map.current.getLayer("cctv"))
            console.log(map.current.getSource("composite"))
            // const source = map.current.getSource("your-source-id");
            console.log(source)
         
            // if (source) {
            //     let currentData = source._data; // Access current data
            //     currentData.features.push(newFeature); // Add new feature
            //     source.setData(currentData); // Update source
            // }
            
            // [
            //     {
            //         "id": "cctv",
            //         "type": "symbol",
            //         "paint": {},
            //         "layout": {
            //             "icon-image": "rocket"
            //         },
            //         "source": "composite",
            //         "source-layer": "cctv"
            //     }
            // ]
          
        });
     
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    return <div ref={mapContainer} style={{ height: '100vh' }} />;
}