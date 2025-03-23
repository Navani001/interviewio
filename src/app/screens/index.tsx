"use client";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css"
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css"
import { useEffect, useRef, useState } from "react";
import { SelectComponent } from "@/component";
import { cctvLocations, heatData, locations } from "./data";
import { calculateDistance } from "@/component/map/mapUtils";
import { createCCTVMarker, createCustomMarker } from "@/utils/marker/marker";
mapboxgl.accessToken = "pk.eyJ1IjoibmF2YW5paGsiLCJhIjoiY204MDIzOGxkMDZvZTJqczU2aGp5d3hneSJ9.i8pFygCwbKS6zYBv2_5ZCQ";
const DISTANCE_THRESHOLD = 50;

export function MapBox({ role }: any) {
    console.log(role);
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [userLocation, setUserLocation] = useState<{ lng: number, lat: number } | null>(null);
    const [markerLocation, setMarkerLocation] = useState<{ lng: number, lat: number } | null>(null);
    const markerEnabledRef = useRef(false);
    const [isNearHeatmap, setIsNearHeatmap] = useState(false);
    const [nearestDistance, setNearestDistance] = useState<number | null>(null);
    const [showAlert, setShowAlert] = useState(false);
    const [mapShow, setMapShow] = useState("all");
    const geocoderContainerRef = useRef<any>(null);
    const [model, setModel] = useState(false);
    const [marker, setMarker] = useState(false);
    const alertShownRef = useRef(false);
    const cctvMarkersRef = useRef<any[]>([]);

    const crimeMarkersRef = useRef<any[]>([]);

    const heatmapLayersCreated = useRef(false);
    const mapShowChange = (val: string) => {
        setMapShow(val)
    }
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
        if (!map.current || !heatmapLayersCreated.current) return;
        console.log("changer")
        // Handle crime heatmap layers visibility
        if (map.current.getLayer('dynamic-heatmap')) {
            map.current.setLayoutProperty(
                'dynamic-heatmap',
                'visibility',

                mapShow === 'all' || mapShow === 'crime' ? 'visible' : 'none'

            );
        }
        if (map.current.getLayer('heatmap-buffer-circles')) {
            map.current.setLayoutProperty(
                'heatmap-buffer-circles',
                'visibility',
                mapShow === 'all' || mapShow === 'crime' ? 'visible' : 'none'   
            );
        }

        // Handle CCTV markers visibility

        cctvMarkersRef.current.forEach(marker => {

            if (mapShow === 'all' || mapShow === 'cctv') {

                marker.addTo(map.current);

            } else {

                marker.remove();

            }

        });

        console.log(crimeMarkersRef)

        // Handle crime location markers visibility

        crimeMarkersRef.current.forEach(marker => {

            if (mapShow === 'all' || mapShow === 'crime') {

                marker.addTo(map.current);

            } else {

                marker.remove();

            }

        });

    }, [mapShow]);
    useEffect(() => {

        if (map.current || !mapContainer.current) return;
        const MapboxDirections = require('@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions');

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/navanihk/cm89q8a4k00es01safi2zeeju",
            center: [78.17336378284944, 10.659130671537582],
            zoom: 7, attributionControl: false,
            logoPosition: 'bottom-right' // Set this to an invalid position to hide it
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
            // voice_instructions:true,
            // instructions: false,

            steps: true,
            interactive: false,
        });

        map.current.addControl(directions, 'bottom-left');
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

        map.current.on("click", (e: any) => {
            console.log(`Latitude: ${e.lngLat.lat}, Longitude: ${e.lngLat.lng}`);
            console.log("Marker enabled:", markerEnabledRef.current);

            if (markerEnabledRef.current) {
                // Create a new marker at the clicked location
                new mapboxgl.Marker()
                    .setLngLat([e.lngLat.lng, e.lngLat.lat])
                    .setPopup(new mapboxgl.Popup().setHTML(`<h3>Custom Marker</h3><p>Lat: ${e.lngLat.lat.toFixed(6)}, Lng: ${e.lngLat.lng.toFixed(6)}</p>`))
                    .addTo(map.current);

                // Update state
                setMarkerLocation({ lng: e.lngLat.lng, lat: e.lngLat.lat });
                alert("Marker")
                // Reset marker flag after placing marker
                setMarker(false);
                markerEnabledRef.current = false;
            }
        });

        map.current.on("load", () => {
            if (!map.current) return;
            map.current.loadImage('/camera.png', (error, image) => {
                if (error) throw error;
                if (!image) return;

                map.current.addImage('camera', image);
            });

            // map.current.addLayer({
            //     id: 'cctv2',
            //     type: 'symbol',
            //     "layout": {
            //         "icon-image": "camera",
            //         'icon-size': 0.06,

            //     },
            //     source: 'cctv',

            // });
            // Add CCTV camera markers
            cctvMarkersRef.current = [];
            cctvLocations.forEach(camera => {
                const markerElement = createCCTVMarker();

                const marker = new mapboxgl.Marker({ element: markerElement })
                    .setLngLat([camera.lng, camera.lat])
                    .setPopup(new mapboxgl.Popup().setHTML(`<h3>${camera.title}</h3><p>${camera.description}</p>`))
                    .addTo(map.current);
                cctvMarkersRef.current.push(marker);

            });
            locations.forEach(loc => {

                const markerElement = createCustomMarker();

                const marker = new mapboxgl.Marker({ element: markerElement })

                    .setLngLat([loc.lng, loc.lat])

                    .setPopup(new mapboxgl.Popup().setHTML(`<h3>${loc.popup}</h3>`));
                if (mapShow === 'all' || mapShow === 'crime') {
                    marker.addTo(map.current);
                }
            });

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
                },
                layout: {

                    visibility: mapShow === 'all' || mapShow === 'crime' ? 'visible' : 'none'

                },
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
                layout: {

                    visibility: mapShow === 'all' || mapShow === 'crime' ? 'visible' : 'none'

                },
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
            heatmapLayersCreated.current = true;
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
        <div className="relative  w-full h-screen  ">
            {/* <div ref={geocoderContainerRef} className=""></div> */}
            <div className="absolute bg-white items-center  flex justify-between z-50 h-10 text-black w-full px-1">
                <div>Crimex</div>
                <div className="!w-[400px]">
                    <SelectComponent

                        value={mapShow}

                        setValue={mapShowChange}

                        contents={[

                            { key: "all", label: "all" },

                            { key: "cctv", label: "cctv" },

                            { key: "crime", label: "crime" }

                        ]}

                    />
                </div></div>
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
            {role == "user" && model && (
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
            {role == "user" && <div className="absolute bottom-4 right-4 p-2 bg-white text-black rounded shadow">
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
            }
        </div>
        // Updated container and header

    );
}