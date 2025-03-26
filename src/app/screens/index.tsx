"use client";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import { useEffect, useRef, useState } from "react";
import {
  ButtonComponent,
  Chatbot,
  ComonPopup,
  Modals,
  SelectComponent,
} from "@/component";
import { locations } from "./data";
import { calculateDistance } from "@/component/map/mapUtils";
import {
  createCCTVMarker,
  createCustomMarker,
  creatingCCTVMarker,
  PoliceMarker,
  SpotMarker,
} from "@/utils/marker/marker";
import { Button, Checkbox, Drawer, DrawerBody, DrawerContent, DrawerHeader, Textarea, useDisclosure } from "@heroui/react";
import { getRequest, postRequest } from "@/utils";
import { GiCctvCamera } from "react-icons/gi";
import { RiPoliceBadgeFill } from "react-icons/ri";
mapboxgl.accessToken =
  "pk.eyJ1IjoibmF2YW5paGsiLCJhIjoiY204MDIzOGxkMDZvZTJqczU2aGp5d3hneSJ9.i8pFygCwbKS6zYBv2_5ZCQ";
const DISTANCE_THRESHOLD = 50;

export function MapBox({ role, token }: any) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<{
    lng: number;
    lat: number;
  } | null>(null);
  const [isPoliceAssign, setIsPoliceAssign] = useState(false);
  const [markerLocation, setMarkerLocation] = useState<{
    lng: number;
    lat: number;
  } | null>(null);
  const [isCrime, setIsCrime] = useState(false);
  const markerEnabledRef = useRef(false);
  const [crimeSpotDescription,setCrimeSpotDescription]=useState("")
  const markerAssignEnabledRef = useRef(false);
  const [isNearHeatmap, setIsNearHeatmap] = useState(false);
  const [nearestDistance, setNearestDistance] = useState<number | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [mapShow, setMapShow] = useState("all");
  const geocoderContainerRef = useRef<any>(null);
  const [model, setModel] = useState(false);
  const [marker, setMarker] = useState(false);
  const [assignMarker, setAssignMarker] = useState(false);
  const alertShownRef = useRef(false);
  const cctvLocations = useRef<any>([]);
  const setMarkerLocationRef = useRef<any>({});
  const cctvMarkersRef = useRef<any[]>([]);
  const [crimeType, setCrimeType] = useState("");
  const heatData = useRef<any>([]);
  const crimeMarkersRef = useRef<any[]>([]);
  const policeDataRef = useRef<any[]>([]);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [userSpot, setuserSpot] = useState(false);
  const [isAssignCCTV, setIsAssignCCTV] = useState(false);
  const [isAssignPolice, setIsAssignPolice] = useState(false);
  const [value, setValue] = useState("");
  const [police, setPolice] = useState("");

  const [crimeDescription, setCrimeDescription] = useState("");

  const [predict, setPredict] = useState(false);
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  const crimes = [
    {
      key: "1",
      label: "Theft",
    },
    {
      key: "2",
      label: "Robbery",
    },
    {
      key: "3",
      label: "Assault",
    },
    {
      key: "4",
      label: "Vehicle Theft",
    },
  ];

  const updateHeatmapData = () => {
    if (
      !map.current ||
      !map.current.isStyleLoaded() ||
      !map.current.getSource("crimex")
    ) {
      console.log("Map or source not ready yet");
      setTimeout(updateHeatmapData, 200); // Try again shortly
      return;
    }

    console.log("Updating heatmap with", heatData.current.length, "points");

    try {
      const heatmapFeatures = heatData.current.map((point: any) => ({
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [parseFloat(point.long), parseFloat(point.lat)],
        },
      }));

      // Update the main heatmap source
      map.current.getSource("crimex").setData({
        type: "FeatureCollection",
        features: heatmapFeatures,
      });

      // Update the buffer circles source
      if (map.current.getSource("heatmap-buffers")) {
        map.current.getSource("heatmap-buffers").setData({
          type: "FeatureCollection",
          features: heatmapFeatures,
        });
      }

      console.log("Heatmap data updated successfully");
    } catch (error) {
      console.error("Error updating heatmap:", error);
    }
  };
  useEffect(() => {
    const fetchBackend = async () => {
      try {
        const payload: any = {};
        if (crimeType !== "all") {
          payload.crimeTypeId = parseInt(crimeType);
        }
        if (role == "user") {
          // const data: any = await postRequest("/api/crime/high", payload, {
          //   Authorization: `Bearer ${token}`,
          // });
          const data: any = await postRequest("/api/crime/high", payload, {
            Authorization: `Bearer ${token}`,
          });
          heatData.current = [...data.data];
        } else {
          const data: any = await postRequest("/api/crime", payload, {
            Authorization: `Bearer ${token}`,
          });
          heatData.current = [...data.data];
        }

        // Update heatData.current with new data

        // Explicitly call updateHeatmapData to refresh the visualization
        updateHeatmapData();
      } catch (error) {
        console.error("Error fetching crime data:", error);
      }
    };

    fetchBackend();
  }, [crimeType]);
  useEffect(() => {
    const fetchBackend = async () => {
      try {
        const data: any = await getRequest("/api/cctv");

        console.log("Fetched cctv data:", data.data);
        cctvLocations.current = data.data;
      } catch (error) {
        console.error("Error fetching crime data:", error);
      }
    };
if(role=="admin"){
  fetchBackend();
}
  }, []);
  useEffect(() => {
    const fetchBackend = async () => {
      try {
        const data: any = await getRequest("/api/crime/policeLocation");

        console.log("Fetched cctv data:", data.data);
        policeDataRef.current = data.data;
      } catch (error) {
        console.error("Error fetching crime data:", error);
      }
    };

    fetchBackend();
  }, []);
  useEffect(() => {
    console.log(heatData.current);
  }, [heatData.current]);
  const handeleAssignCreate = () => {
    setIsAssignCCTV(false);
    setIsAssignPolice(false);
    setValue("");
    setCrimeDescription("");
    setIsAssignOpen(false);
  };
  const heatmapLayersCreated = useRef(false);
  const mapShowChange = (val: string) => {
    setMapShow(val);
  };
  const checkProximityToHeatmap = (lng: number, lat: number) => {
    let minDistance = Number.MAX_VALUE;
    for (const point of heatData.current) {
      console.log(point);
      const distance = calculateDistance(
        lat,
        lng,
        parseFloat(point.lat),
        parseFloat(point.long)
      );
      minDistance = Math.min(minDistance, distance);
      if (distance <= 50) {
        setNearestDistance(distance);
        return true;
      }
    }
    setNearestDistance(minDistance);
    return false;
  };

  useEffect(() => {
    if (!map.current || !heatmapLayersCreated.current) return;
    console.log("changer");
    // Handle crime heatmap layers visibility
    if (map.current.getLayer("dynamic-heatmap")) {
      map.current.setLayoutProperty(
        "dynamic-heatmap",
        "visibility",
        mapShow === "all" || mapShow === "crime" ? "visible" : "none"
      );
    }
    if (map.current.getLayer("heatmap-buffer-circles")) {
      map.current.setLayoutProperty(
        "heatmap-buffer-circles",
        "visibility",
        mapShow === "all" || mapShow === "crime" ? "visible" : "none"
      );
    }
    // Handle CCTV markers visibility
    cctvMarkersRef.current.forEach((marker) => {
      if (mapShow === "all" || mapShow === "cctv") {
        marker.addTo(map.current);
      } else {
        marker.remove();
      }
    });

    console.log(crimeMarkersRef);

    // Handle crime location markers visibility

    crimeMarkersRef.current.forEach((marker) => {
      if (mapShow === "all" || mapShow === "crime") {
        marker.addTo(map.current);
      } else {
        marker.remove();
      }
    });
  }, [mapShow]);

  useEffect(() => {
    // Call updateHeatmapData whenever heatmapLayersCreated changes to true
    if (heatmapLayersCreated.current && map.current) {
      console.log("Layers created, updating heatmap data");
      updateHeatmapData();
    }
  }, [heatmapLayersCreated.current]);
  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    const MapboxDirections = require("@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions");

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/navanihk/cm89q8a4k00es01safi2zeeju",
      center: [78.17336378284944, 10.659130671537582],
      zoom: 7,
      attributionControl: false,
      logoPosition: "bottom-right", // Set this to an invalid position to hide it
    });
    // Add geolocation controal
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,

      showUserHeading: true,
    });
    map.current.addControl(geolocateControl, "bottom-right");
    const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: "metric",
      profile: "mapbox/driving",
      alternatives: true,
      congestion: true,
      routePadding: 50,
      // voice_instructions:true,
      // instructions: false,
      steps: true,
      interactive: false,
    });

    map.current.addControl(directions, "bottom-left");
    geolocateControl.on("geolocate", (e: any) => {
      const lng = e.coords.longitude;
      const lat = e.coords.latitude;
      setUserLocation({ lng, lat });
    });
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken || "",
      mapboxgl: mapboxgl as any,
    });

    if (geocoderContainerRef.current) {
      geocoderContainerRef.current.appendChild(geocoder.onAdd(map.current));
    }
    // Also check regularly for position updates (every 10 seconds)

    // Add markers with popups

    map.current.on("click", (e: any) => {
      console.log(`Latitude: ${e.lngLat.lat}, Longitude: ${e.lngLat.lng}`);
      console.log("Marker enabled:", markerAssignEnabledRef.current);
      setMarkerLocation({ lng: e.lngLat.lng, lat: e.lngLat.lat });
      setMarkerLocationRef.current = { lng: e.lngLat.lng, lat: e.lngLat.lat };
      if (markerAssignEnabledRef.current && map.current) {
        // Create a new marker at the clicked location
        // new mapboxgl.Marker()
        //   .setLngLat([e.lngLat.lng, e.lngLat.lat])
        //   .setPopup(
        //     new mapboxgl.Popup().setHTML(
        //       `<h3>Custom Marker</h3><p>Lat: ${e.lngLat.lat.toFixed(
        //         6
        //       )}, Lng: ${e.lngLat.lng.toFixed(6)}</p>`
        //     )
        //   )
        //   .addTo(map.current);
        console.log("test");
        // alert("assign marker")
        setIsAssignOpen(true);
        // Update state
        // const fetchBackend=async ()=>{
        //     console.log('Fetch')
        //     await postRequest("/apifcc/crime/create", { crimeTypeId: 1, description: "testing1", lat: e.lngLat.lat, long: e.lngLat.lng, location: "karur" }, { Authorization: `Bearer ${token}` })
        // }
        // fetchBackend();
        
        // alert("Marker")
        // Reset marker flag after placing marker
        // setMarker(false);
        markerEnabledRef.current = false;
      }
      if (markerEnabledRef.current && map.current) {
        // Create a new marker at the clicked location
        setuserSpot(true);
       
        console.log("test");
        // Update state
       
        setMarkerLocation({ lng: e.lngLat.lng, lat: e.lngLat.lat });
        // alert("Marker")
        // Reset marker flag after placing marker
        setMarker(false);
        markerEnabledRef.current = false;
      }
    });

    map.current.on("load", () => {
      if (!map.current) return;
      map.current.loadImage("/camera.png", (error:any, image:any) => {
        if (error) throw error;
        if (!image) return;
        if (map.current) {
          map.current.addImage("camera", image);
        }
      });
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lng = position.coords.longitude;
          const lat = position.coords.latitude;
          setUserLocation({ lng, lat });

          const near = checkProximityToHeatmap(lng, lat);
          if (role === "user") {
            const near = checkProximityToHeatmap(lng, lat);
            setIsNearHeatmap(near);

            if (near && !alertShownRef.current) {
              setShowAlert(true);
              alertShownRef.current = true;
            }
          } else if (role === "police") {
            const fetchBackendData = async () => {
              const data: any = await postRequest(
                "/api/crime/spotPolice",
                { lat: lat, long: lng },
                { Authorization: `Bearer ${token}` }
              );
              console.log(data);
              if (data.data.message == "No") {
                return;
              }
              setIsPoliceAssign(true);
              if (data.data.message == "unassigned") {
                directions.setOrigin([lng, lat]); // can be address in form setOrigin("12, Elm Street, NY")
              
                directions.setDestination([
                  data.data.location.long,
                  data.data.location.lat,
                ]);

                
              } else {
                directions.setOrigin([lng, lat]); // can be address in form setOrigin("12, Elm Street, NY")
                console.log(data.data.crimes[0].crime.lat);
                directions.setDestination([
                  data.data.crimes[0].crime.long,
                  data.data.crimes[0].crime.lat,
                ]);
                setCrimeSpotDescription(data.data.crimes[0].crime.description)
              }
            };
            fetchBackendData();
          }
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
          timeout: 10000, //
        }
      );

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
      cctvLocations.current.forEach((camera: any) => {
        console.log();
        const markerElement = camera.isActive
          ? createCCTVMarker()
          : creatingCCTVMarker();
        if (map.current) {
          const marker = new mapboxgl.Marker({ element: markerElement })
            .setLngLat([parseFloat(camera.long), parseFloat(camera.lat)])
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>cctv</h3>`))
            .addTo(map.current);
          cctvMarkersRef.current.push(marker);
        }
      });
      policeDataRef.current.forEach((camera: any) => {
        const markerElement = PoliceMarker();
        if (map.current) {
          const marker = new mapboxgl.Marker({ element: markerElement })
            .setLngLat([
              parseFloat(camera.crime.long),
              parseFloat(camera.crime.lat),
            ])
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>cctv</h3>`))
            .addTo(map.current);
          cctvMarkersRef.current.push(marker);
        }
      });
      locations.forEach((loc) => {
        const markerElement = createCustomMarker();
        const marker = new mapboxgl.Marker({ element: markerElement })
          .setLngLat([loc.lng, loc.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`<h3>${loc.popup}</h3>`));
        if (mapShow === "all" || mapShow === "crime") {
          if (map.current) {
            marker.addTo(map.current);
          }
        }
      });

      const heatmapFeatures: any = heatData.current.map((point: any) => ({
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [parseFloat(point.long), parseFloat(point.lat)],
        },
      }));

      map.current.addSource("crimex", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: heatmapFeatures,
        },
      });

      map.current.addLayer({
        id: "dynamic-heatmap",
        type: "heatmap",
        source: "crimex",
        paint: {
          "heatmap-weight": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 3],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0,0,255,0)",
            0.2,
            "rgba(0,0,255,0.5)",
            0.4,
            "rgba(0,255,255,0.7)",
            0.6,
            "rgba(0,255,0,0.7)",
            0.8,
            "rgba(255,255,0,0.8)",
            1,
            "rgba(255,0,0,1)",
          ],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 9, 20],
          "heatmap-opacity": 0.8,
        },
        layout: {
          visibility:
            mapShow === "all" || mapShow === "crime" ? "visible" : "none",
        },
      });
      const bufferSource: any = {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: heatData.current.map((point: any) => ({
            type: "Feature",
            properties: {},
            geometry: {
              type: "Point",
              coordinates: [parseFloat(point.long), parseFloat(point.lat)],
            },
          })),
        },
      };

      map.current.addSource("heatmap-buffers", bufferSource);

      map.current.addLayer({
        id: "heatmap-buffer-circles",
        type: "circle",
        source: "heatmap-buffers",
        layout: {
          visibility:
            mapShow === "all" || mapShow === "crime" ? "visible" : "none",
        },
        paint: {
          "circle-radius": {
            stops: [
              [0, 0],
              [20, 50], // At zoom level 20, circle radius will be 50 pixels (approx 50m)
            ],
            base: 2,
          },
          "circle-color": "rgba(255, 0, 0, 0.1)",
          "circle-stroke-width": 1,
          "circle-stroke-color": "rgba(255, 0, 0, 0.3)",
        },
      });
      heatmapLayersCreated.current = true;
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
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
        <div className="!w-[400px] flex gap-2">
          <SelectComponent
            value={crimeType}
            setValue={setCrimeType}
            contents={[
              { key: "1", label: "all" },
              { key: "2", label: "theft" },
              { key: "3", label: "traffic" },
            ]}
          />
          {role == "admin" && (
            <div className="flex gap-2">
              <Button onPress={onOpen}>AI</Button>
              <Button onPress={() => setPredict(true)}>Predict</Button>
              <Button
                onPress={() => {
                  setAssignMarker(true);
                  markerAssignEnabledRef.current = true;
                }}
              >
                Assign
              </Button>
            </div>
          )}
          {role == "admin" && (
            <Button
              onPress={() => {
                setMarker(true);
                markerEnabledRef.current = true;
              }}
            >
              mark the location
            </Button>
          )}
          <SelectComponent
            value={mapShow}
            setValue={mapShowChange}
            contents={[
              { key: "all", label: "all" },
              { key: "cctv", label: "cctv" },
              { key: "crime", label: "crime" },
            ]}
          />
        </div>
      </div>
      <div ref={mapContainer} style={{ height: "100vh" }} />

      {/* Alert Modal */}
      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h2 className="text-xl font-bold mb-4">Proximity Alert!</h2>
            <p className="mb-4">
              You are currently within 50 meters of a heatmap area. Please be
              aware of your surroundings.
            </p>
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
            <p className="mb-4">
              You are currently within 50 meters of a heatmap area. Please be
              aware of your surroundings.
            </p>
            <button
              onClick={closeAlert}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              I understand
            </button>
          </div>
        </div>
      )}
      <Modals
        isopen={isAssignOpen}
        onClose={handeleAssignCreate}
        hideCloseButton
        ModalContents={
          <div className="">
            <ComonPopup
              //   icon={<FeaturedTickIcon />}
              bodyContent={
                <div>
                  <p className="font-semibold text-2xl text-center  text-content2-100 pb-10">
                    ASSIGN
                  </p>
                  <div className="flex justify-around">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        onClick={() => {
                          setIsAssignCCTV(!isAssignCCTV);
                          setIsAssignPolice(false);
                        }}
                        className={`p-5 bg-[#3b3b42] cursor-pointer rounded-md  ${
                          isAssignCCTV
                            ? "border-[#0266da] border-2"
                            : "border-[#18181b] border-2"
                        }   flex items-center justify-center `}
                      >
                        <GiCctvCamera size={30} />
                      </div>
                      <p>CCTV</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div
                        onClick={() => {
                          setIsAssignPolice(!isAssignPolice);
                          setIsAssignCCTV(false);
                        }}
                        className={`p-5 bg-[#3b3b42]  cursor-pointer ${
                          isAssignPolice
                            ? "border-[#0266da] border-2"
                            : "border-[#18181b] border-2"
                        } rounded-md  flex items-center justify-cente`}
                      >
                        <RiPoliceBadgeFill size={30} />
                      </div>
                      <p>Police</p>
                    </div>
                  </div>
                  {isAssignPolice && (
                    <div className="pt-6 px-4 gap-5 flex flex-col items-center">
                      {/* <Select onChange={handleSelectionChange}  size="sm" className="max-w-xs" label="Select Crime type">
                        {crimes.map((crime) => (
                          <SelectItem key={crime.key}>
                            {crime.label}
                          </SelectItem>
                        ))}
                      </Select> */}
                      <SelectComponent
                        value={value}
                        setValue={setValue}
                        contents={crimes}
                      />
                      <div className="flex gap-2 justify-between">
                        <div className="w-60">
                          <SelectComponent
                            value={police}
                            setValue={setPolice}
                            contents={[{ key: "1", label: "raj" }]}
                          />
                        </div>
                        <div className="flex gap-1 items-center">
                          {" "}
                          <Checkbox
                            isSelected={isCrime}
                            onValueChange={setIsCrime}
                          />{" "}
                          Crime
                        </div>
                      </div>
                      <Textarea
                        label="Description"
                        value={crimeDescription}
                        onValueChange={setCrimeDescription}
                        placeholder="Enter your description"
                      />
                    </div>
                  )}
                </div>
              }
              button1Text="Cancel"
              button2Text="Assign"
              Button1Variant="bordered"
              Button2Variant="bordered"
              button1Bgcolor="bg-transparent"
              Button1BaseClassName="border border-secondary-700 bg-transparent"
              Button1textClassName="text-secondary-1001"
              Button2textClassName="text-secondary-1001"
              onButton1Click={() => setIsAssignOpen(false)}
              onButton2Click={() => {
                console.log("Assigning...");
                if (isAssignCCTV) {
                  console.log("cctv assignment");
                  const fetchBackend = async () => {
                    const response = await postRequest(
                      "/api/cctv/create",
                      {
                        name: "cctv for test",
                        lat: setMarkerLocationRef.current.lat,
                        long: setMarkerLocationRef.current.lng,
                        location: "karur",
                      },
                      { Authorization: `Bearer ${token}` }
                    );
                    const newCCTV = {
                      name: "cctv for test",
                      lat: setMarkerLocationRef.current.lat + "",
                      long: setMarkerLocationRef.current.lng + "",
                      location: "karur",
                    };
                    markerAssignEnabledRef.current = false;
                    const markerElement = creatingCCTVMarker();
                    const newMarker = new mapboxgl.Marker({
                      element: markerElement,
                    })
                      .setLngLat([
                        setMarkerLocationRef.current.lng,
                        setMarkerLocationRef.current.lat,
                      ])
                      .setPopup(new mapboxgl.Popup().setHTML(`<h3>cctv</h3>`));
                    if (map.current) {
                      newMarker.addTo(map.current);
                    }

                    // After successful API call, add the new CCTV to the map
                    // if (response && map.current) {
                    //     // Add to local CCTV locations array

                    //     cctvLocations.current.push(newCCTV);

                    //     // Create a new marker for this CCTV

                    //     // Only add to map if the current view allows it
                    //     if (mapShow === "all" || mapShow === "cctv") {
                    //     }

                    //     // Add to the markers reference array
                    //     // cctvMarkersRef.current.push(newMarker);
                    // }
                  };

                  fetchBackend();
                } else {
                  // Add new data point to heatData.current
                  heatData.current = [
                    ...heatData.current,
                    {
                      crimeTypeId: parseInt(value),
                      lat: setMarkerLocationRef.current.lat + "",
                      long: setMarkerLocationRef.current.lng + "",
                    },
                  ];
                  console.log("poice", police);
                  const fetchBackend = async () => {
                    await postRequest(
                      "/api/crime/create",
                      {
                        crimeTypeId: parseInt(value),
                        description: crimeDescription,
                        lat: setMarkerLocationRef.current.lat,
                        long: setMarkerLocationRef.current.lng,
                        location: "karur",
                        isPatroll: true,
                        loginId: parseInt(value),
                        isCrime: isCrime,
                      },
                      { Authorization: `Bearer ${token}` }
                    );
                  };

                  fetchBackend();
                  markerEnabledRef.current = false;

                  console.log("Added new crime data:", value);
                  const markerElement = PoliceMarker();
                  const newMarker = new mapboxgl.Marker({
                    element: markerElement,
                  })
                    .setLngLat([
                      setMarkerLocationRef.current.lng,
                      setMarkerLocationRef.current.lat,
                    ])
                    .setPopup(new mapboxgl.Popup().setHTML(`<h3>cctv</h3>`));
                  if (map.current) {
                    newMarker.addTo(map.current);
                  }
                  // Call updateHeatmapData to refresh the visualization
                  if (isCrime) {
                    updateHeatmapData();
                  }

                  handeleAssignCreate();
                }
              }}
            />
          </div>
        }
        bodyClassName="p-0"
        size="lg"
        modalClassName=" overflow-y-auto  scrollbar-hide sm:my-0 w-[25rem]"
      />
      <Modals
        isopen={isPoliceAssign}
        onClose={handeleAssignCreate}
        hideCloseButton
        ModalContents={
          <div className="p-4">
            <p className="font-bold text-2xl text-center text-red-500  text-content2-100 pb-5 pt-3">
              You are Assigned to the crime spot
            </p>
            <p className="text-lg">Description:</p>
            <p className="text-lg p-4 bg-[#3b3b42] rounded-lg ">
              {crimeSpotDescription}
            </p>
            <div className="flex justify-center pt-5">
              <ButtonComponent
                isIcon={false}
                buttonText="Accept"
                ButtonVariant="bordered"
                bgColor="bg-primary"
                baseClassName="bg-primary border-none"
                textClassName="text-background font-semibold text-[16px]"
                handleOnClick={() => setIsPoliceAssign(false)}
              />
            </div>
          </div>
        }
        bodyClassName="p-0"
        size="lg"
        modalClassName=" overflow-y-auto  scrollbar-hide sm:my-0 w-[25rem]"
      />
      <Modals
        isopen={userSpot}
        onClose={handeleAssignCreate}
        hideCloseButton
        ModalContents={
          <div className="">
            <ComonPopup
              //   icon={<FeaturedTickIcon />}
              bodyContent={
                <div>
                  <p className="text-2xl text-center font-bold pb-8">
                    Spot the Location
                  </p>
                  <div className="flex flex-col gap-4">
                    <SelectComponent
                      value={value}
                      setValue={setValue}
                      contents={crimes}
                    />
                    <Textarea
                      label="Description"
                      value={crimeDescription}
                      onValueChange={setCrimeDescription}
                      placeholder="Enter your description"
                    />
                  </div>
                </div>
              }
              button1Text="Cancel"
              button2Text="Spot"
              Button1Variant="bordered"
              Button2Variant="bordered"
              button1Bgcolor="bg-transparent"
              Button1BaseClassName="border border-secondary-700 bg-transparent"
              Button1textClassName="text-secondary-1001"
              Button2textClassName="text-secondary-1001"
              onButton1Click={() => setuserSpot(false)}
              onButton2Click={() => {
                const fetchBackend = async () => {
                  console.log("Fetch");
                  console.log(setMarkerLocationRef.current)
                  if(
                    setMarkerLocationRef.current?.lat 
                  ){
                    await postRequest(
                      "/api/crime/create",
                      {
                        crimeTypeId: value,
                        description: crimeDescription,
                        lat: parseFloat(setMarkerLocationRef.current.lat),
                        long: parseFloat(setMarkerLocationRef.current.lng),
                        location: "karur",
                        isCrime: true,
                        isFake:false
                      },
                      { Authorization: `Bearer ${token}` }
                    );
                    const markerElement = SpotMarker();
                    const marker = new mapboxgl.Marker({ element: markerElement })
                      .setLngLat([setMarkerLocationRef.current.lng, setMarkerLocationRef.current.lat])
                      .setPopup(new mapboxgl.Popup().setHTML(`<h3>crime created</h3>`));

                    marker.addTo(map.current);
                  }
                
                };
                fetchBackend();
                
                // setuserSpot(false)
              
              }}
            />
          </div>
        }
        bodyClassName="p-0"
        size="lg"
        modalClassName=" overflow-y-auto  scrollbar-hide sm:my-0 w-[25rem]"
      />
      <Modals
        isopen={predict}
        onClose={() => setPredict(false)}
        hideCloseButton
        ModalContents={
          <div className="p-4">
            <p className="text-2xl text-primary text-center font-bold pb-6">
              PREDICTIONS
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col  gap-1">
                <div className="flex  gap-3">
                  <div>
                    <div
                      className={`p-5 bg-[#3b3b42] cursor-pointer rounded-md flex items-center justify-center `}
                    >
                      <GiCctvCamera size={30} />
                    </div>
                  </div>
                  <div className="flex flex-col justify-around">
                    <p>Location: "1,2"</p>
                    <p>Efficency: 90%</p>
                  </div>
                </div>
                <p className="px-4">CCTV</p>
              </div>
              <div className="flex flex-col  gap-1">
                <div className="flex  gap-3">
                  <div>
                    <div
                      className={`p-5 bg-[#3b3b42] cursor-pointer rounded-md flex items-center justify-center `}
                    >
                      <RiPoliceBadgeFill size={30} />
                    </div>
                  </div>
                  <div className="flex flex-col justify-around">
                    <p>Location: "1,2"</p>
                    <p>Efficency: 90%</p>
                  </div>
                </div>
                <p className="px-4">Police</p>
              </div>
            </div>
            <div className="flex justify-center pt-3">
            <ButtonComponent
                isIcon={false}
                buttonText="Done"
                ButtonVariant="bordered"
                bgColor="bg-primary"
                baseClassName="bg-primary border-none"
                textClassName="text-background font-semibold text-[16px]"
                handleOnClick={() => setPredict(false)}
              />
              </div>
          </div>
        }
        bodyClassName="p-0"
        size="lg"
        modalClassName=" overflow-y-auto  scrollbar-hide sm:my-0 w-[25rem]"
      />
      
      <Drawer isOpen={isOpen} size="xl" onOpenChange={onOpenChange}>
        <DrawerContent>
          
            <>
              <DrawerHeader className="flex flex-col gap-1 text-2xl">ChatBot</DrawerHeader>
              <DrawerBody className="bg-black p-0">
                
                <Chatbot />
                
              </DrawerBody>
              
            </>
        </DrawerContent>
      </Drawer>
      {/* Status indicator */}
      {role == "user" && (
        <div className="absolute bottom-4 right-4 p-2 bg-white text-black rounded shadow">
          {userLocation ? (
            <div>
              <p className="text-sm font-bold">Your Location:</p>
              <p className="text-xs">Lat: {userLocation.lat.toFixed(6)}</p>
              <p className="text-xs">Lng: {userLocation.lng.toFixed(6)}</p>
              <p
                className={`text-xs font-bold ${
                  isNearHeatmap ? "text-red-500" : "text-green-500"
                }`}
              >
                {isNearHeatmap
                  ? `Within 50m of heatmap (${nearestDistance?.toFixed(1)}m)`
                  : nearestDistance
                  ? `Outside heatmap area (${nearestDistance.toFixed(1)}m)`
                  : "Outside heatmap area"}
              </p>
            </div>
          ) : (
            <p className="text-sm">Waiting for location...</p>
          )}
        </div>
      )}
    </div>
    // Updated container and header
  );
}
