"use client";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { useEffect, useRef, useState } from "react";
// Import SearchBox with proper typing
mapboxgl.accessToken = "pk.eyJ1IjoibmF2YW5paGsiLCJhIjoiY204MDIzOGxkMDZvZTJqczU2aGp5d3hneSJ9.i8pFygCwbKS6zYBv2_5ZCQ";

const locations = [
    { lng: 78.17336378284944, lat: 10.659130671537582, popup: "New York" },
    { lng: 78.17336378284944, lat: 10.660000671537582, popup: "Los Angeles" },
    { lng: 78.17336378284944, lat: 10.661000671537582, popup: "Chicago" },
];

// Sample heat data points - replace with your actual heat data
const heatData = [
    { lng: 78.17336378284944, lat: 10.659130671537582 },    
    { lng: 78.17336378284944, lat: 10.660000671537582 },
    { lng: 78.17336378284944, lat: 10.661000671537582 },
    { lng: 78.17436378284944, lat: 10.659130671537582 },
    { lng: 78.17236378284944, lat: 10.659130671537582 },
    // { lng: 77.28001701113311, lat: 11.493044346877113 },
    // , Longitude: 
];

// Distance threshold in meters
const DISTANCE_THRESHOLD = 50;

export function MapBox() {
    const mapContainer = useRef<HTMLDivElement>(null);

    const map = useRef<mapboxgl.Map | null>(null);
    const [userLocation, setUserLocation] = useState<{ lng: number, lat: number } | null>(null);
    const [isNearHeatmap, setIsNearHeatmap] = useState(false);
    const [nearestDistance, setNearestDistance] = useState<number | null>(null);
    const [showAlert, setShowAlert] = useState(false);

    const geocoderContainerRef = useRef<any>(null);

    const [inputValue, setInputValue] = useState("");
    const alertShownRef = useRef(false);

    // Calculate distance between two points in meters using the Haversine formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180; // Convert to radians
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    };

    // Check if location is within 50 meters of any heatmap point
    const checkProximityToHeatmap = (lng: number, lat: number) => {
        let minDistance = Number.MAX_VALUE;

        for (const point of heatData) {
            const distance = calculateDistance(lat, lng, point.lat, point.lng);
            minDistance = Math.min(minDistance, distance);

            if (distance <= DISTANCE_THRESHOLD) {
                setNearestDistance(distance);
                return true;
            }
        }

        setNearestDistance(minDistance);
        return false;
    };

    useEffect(() => {
        if (map.current || !mapContainer.current) return;
        const MapboxDirections = require('@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions');
        import('@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css');
        import('@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css');

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/navanihk/cm89q8a4k00es01safi2zeeju",
            center: [78.17336378284944, 10.659130671537582],
            zoom: 7
        });
        
        
        // Add geolocation control
        const geolocateControl = new mapboxgl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showUserHeading: true
        });

        map.current.addControl(geolocateControl);
        const directions = new MapboxDirections({
            accessToken: mapboxgl.accessToken,
            unit: 'metric',
            profile: 'mapbox/driving',
            alternatives: true,
            congestion: true,
            routePadding: 50,
            voice_instructions:true,
            steps: true,
            controls: {
                inputs: true,
                instructions: true,
                profileSwitcher: true
            }
        });

        map.current.addControl(directions, 'top-left');
        // Listen for the geolocate event
        geolocateControl.on('geolocate', (e: any) => {
            const lng = e.coords.longitude;
            const lat = e.coords.latitude;
            setUserLocation({ lng, lat });

            const near = checkProximityToHeatmap(lng, lat);
            setIsNearHeatmap(near);

            if (near && !alertShownRef.current) {
                setShowAlert(true);
                alertShownRef.current = true;
            }
        });
        const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken || '',
            mapboxgl: mapboxgl as any,
        });

        if (geocoderContainerRef.current) {
            geocoderContainerRef.current.appendChild(geocoder.onAdd(map.current));
        }
        // Also check regularly for position updates (every 10 seconds)
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const lng = position.coords.longitude;
                const lat = position.coords.latitude;
                setUserLocation({ lng, lat });

                const near = checkProximityToHeatmap(lng, lat);

                // If user wasn't near before but is now, show alert
                if (near && !isNearHeatmap && !alertShownRef.current) {
                    setIsNearHeatmap(true);
                    setShowAlert(true);
                    alertShownRef.current = true;
                } else if (near !== isNearHeatmap) {
                    setIsNearHeatmap(near);
                }
            },
            (error) => {
                console.error("Error getting location:", error);
            },
            {
                enableHighAccuracy: false,
                maximumAge: 30000, // Accept positions up to 30 seconds old
                timeout: 10000 //
            }
        );
        

        // Add markers with popups
        locations.forEach(loc => {
            const marker = new mapboxgl.Marker()
                .setLngLat([loc.lng, loc.lat])
                .setPopup(new mapboxgl.Popup().setHTML(`<h3>${loc.popup}</h3>`));

            if (map.current) {
                map.current.on('zoom', () => {
                    if (map.current && map.current.getZoom() >= 7) {
                        marker.addTo(map.current); // Show marker when zoom is 7 or more
                    } else {
                        marker.remove(); // Hide marker when zoom is less than 7
                    }
                });
            }
        });

        map.current.on("click", (e) => {
            console.log(`Latitude: ${e.lngLat.lat}, Longitude: ${e.lngLat.lng}`);
            e.originalEvent.stopPropagation(); 
        });

        map.current.on("load", () => {
            if (!map.current) return;


            map.current.addSource('cctv', {
                type: 'geojson',
                data: {
                    "type": "FeatureCollection",
                    "features": [{
                        "type": "Feature",
                        "properties": {
                            "title": "CCTV Camera 1",
                            "description": "Main Street Surveillance"
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [
                                78.17336378284944, 10.659130671537582
                            ]
                        }
                    }]
                }
            });

            map.current.addLayer({
                id: 'cctv2',
                type: 'symbol',
                "layout": {
                    "icon-image": "rocket"
                },
                source: 'cctv',
                "paint": {
                    "text-color": "#000000"
                },
            });

            // Add click event to show popups for CCTV layer
            map.current.on('click', 'cctv2', (e) => {
                if (!e.features || e.features.length === 0 || !map.current) return;

                const feature: any = e.features[0];
                const coordinates = feature.geometry.coordinates.slice();
                const title = feature.properties.title;
                const description = feature.properties.description;

                // Create popup content
                const popupContent = `
                    <h3>${title}</h3>
                    <p>${description}</p>
                `;

                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(popupContent)
                    .addTo(map.current);
            });

            // Change cursor to pointer when hovering over CCTV points
            map.current.on('mouseenter', 'cctv2', () => {
                if (map.current) {
                    map.current.getCanvas().style.cursor = 'pointer';
                }
            });

            // Change cursor back when leaving CCTV points
            map.current.on('mouseleave', 'cctv2', () => {
                if (map.current) {
                    map.current.getCanvas().style.cursor = '';
                }
            });

            // Add actual heatmap data instead of placeholder
            const heatmapFeatures: any = heatData.map(point => ({
                type: "Feature",
                properties: {},
                geometry: { type: "Point", coordinates: [point.lng, point.lat] }
            }));

            map.current.addSource("crimex", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: heatmapFeatures
                }
            });

            map.current.addLayer({
                id: "dynamic-heatmap",
                type: "heatmap",
                source: "crimex",
                paint: {
                    "heatmap-weight": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 3],
                    "heatmap-color": [
                        "interpolate", ["linear"], ["heatmap-density"],
                        0, "rgba(0,0,255,0)",
                        0.2, "rgba(0,0,255,0.5)",
                        0.4, "rgba(0,255,255,0.7)",
                        0.6, "rgba(0,255,0,0.7)",
                        0.8, "rgba(255,255,0,0.8)",
                        1, "rgba(255,0,0,1)"
                    ],
                    "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 9, 20],
                    "heatmap-opacity": 0.8
                }
            });

            // Add 50m buffer circles around heatmap points
            const bufferSource: any = {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: heatData.map(point => ({
                        type: "Feature",
                        properties: {},
                        geometry: {
                            type: "Point",
                            coordinates: [point.lng, point.lat]
                        }
                    }))
                }
            };

            map.current.addSource("heatmap-buffers", bufferSource);

            map.current.addLayer({
                id: "heatmap-buffer-circles",
                type: "circle",
                source: "heatmap-buffers",
                paint: {
                    "circle-radius": {
                        stops: [
                            [0, 0],
                            [20, 50] // At zoom level 20, circle radius will be 50 pixels (approx 50m)
                        ],
                        base: 2
                    },
                    "circle-color": "rgba(255, 0, 0, 0.1)",
                    "circle-stroke-width": 1,
                    "circle-stroke-color": "rgba(255, 0, 0, 0.3)"
                }
            });
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
            navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    // Close alert modal
    const closeAlert = () => {
        setShowAlert(false);
    };

    return (
        <div className="relative ">
            {/* <div ref={geocoderContainerRef} className=""></div> */}

            <div ref={mapContainer} style={{ height: "100vh" }} />

            {/* Alert Modal */}
            {showAlert && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md">
                        <h2 className="text-xl font-bold mb-4">Proximity Alert!</h2>
                        <p className="mb-4">You are currently within 50 meters of a heatmap area. Please be aware of your surroundings.</p>
                        <button
                            onClick={closeAlert}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            I understand
                        </button>
                    </div>
                </div>
            )}

            {/* Status indicator */}
            <div className="absolute bottom-4 right-4 p-2 bg-white rounded shadow">
                {userLocation ? (
                    <div>
                        <p className="text-sm font-bold">Your Location:</p>
                        <p className="text-xs">Lat: {userLocation.lat.toFixed(6)}</p>
                        <p className="text-xs">Lng: {userLocation.lng.toFixed(6)}</p>
                        <p className={`text-xs font-bold ${isNearHeatmap ? 'text-red-500' : 'text-green-500'}`}>
                            {isNearHeatmap ?
                                `Within 50m of heatmap (${nearestDistance?.toFixed(1)}m)` :
                                nearestDistance ?
                                    `Outside heatmap area (${nearestDistance.toFixed(1)}m)` :
                                    'Outside heatmap area'}
                        </p>
                    </div>
                ) : (
                    <p className="text-sm">Waiting for location...</p>
                )}
            </div>
        </div>
    );
}