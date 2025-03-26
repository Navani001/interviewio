import React, { useState, useEffect, useRef } from 'react'
import { getRequest } from '@/utils'
import { GiCctvCamera } from 'react-icons/gi'
import { RiPoliceBadgeFill } from 'react-icons/ri'
import mapboxgl from "mapbox-gl";

export function Recommend({ map }: any) {
    const [recommendations, setRecommendations] = useState<{
        cctvNeeds: any[],
        policeAssignmentNeeds: any[]
    }>({
        cctvNeeds: [],
        policeAssignmentNeeds: []
    })

    const [selectedType, setSelectedType] = useState<'CCTV' | 'Police' | null>(null)
    const markersRef = useRef<mapboxgl.Marker[]>([])

    useEffect(() => {
        const fetchBackend = async () => {
            try {
                const response: any = await getRequest('/api/crime/recommendation')
                setRecommendations({
                    cctvNeeds: response.data.cctvNeeds || [],
                    policeAssignmentNeeds: response.data.policeAssignmentNeeds || []
                })
            } catch (error) {
                console.error('Failed to fetch recommendations:', error)
            }
        }
        fetchBackend()
    }, [])

    // Function to remove all existing markers
    const removeAllMarkers = () => {
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
    }

    const handleCardClick = (rec: any) => {
        // Remove all existing markers first
        removeAllMarkers();

        // Create new marker
        const marker = new mapboxgl.Marker({ color: 'red' })
            .setLngLat([parseFloat(rec.long), parseFloat(rec.lat)])
            .setPopup(new mapboxgl.Popup().setHTML(`
                <div>
                    <h3>Location Details</h3>
                    <p>Crime Type: ${rec.crime_type || 'N/A'}</p>
                    <p>Priority: ${rec.priority || 'N/A'}</p>
                </div>
            `))
            .addTo(map);

        // Store the marker in the ref array
        markersRef.current.push(marker);

        // Jump to marker location
        map.jumpTo({
            center: [parseFloat(rec.long), parseFloat(rec.lat)]
        })
    }

    // Update type selection to remove markers
    const handleTypeSelection = (type: 'CCTV' | 'Police') => {
        removeAllMarkers();
        setSelectedType(type);
    }

    const renderRecommendationDetails = () => {
        const recommend = selectedType === 'CCTV'
            ? recommendations.cctvNeeds
            : recommendations.policeAssignmentNeeds

        if (recommend.length === 0) {
            return <p className="text-center text-gray-500">No {selectedType} recommendations available</p>
        }

        return (
            <div className="mt-4 space-y-3 grid grid-col-2 h-96 overflow-scroll scrollbar-hide">
                {recommend.map((rec, index) => (
                    <div
                        key={index}
                        onClick={() => handleCardClick(rec)}
                        className="bg-[#3b3b42] cursor-pointer rounded-md p-4 hover:bg-[#4a4a54] transition-colors"
                    >
                        <div className="flex justify-between">
                            <div>
                                <p><strong>Crime Type:</strong> {rec.crime_type || 'N/A'}</p>
                                <p><strong>Location:</strong> {rec.lat}, {rec.long}</p>
                                <p><strong>Priority:</strong> {rec.priority || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="p-4">
            <p className="text-2xl text-primary text-center font-bold pb-6">
                SPOT RECOMMENDATIONS
            </p>

            <div className="flex justify-center gap-6 mb-6">
                <div
                    onClick={() => handleTypeSelection('CCTV')}
                    className={`
                        flex flex-col items-center cursor-pointer p-4 rounded-md 
                        ${selectedType === 'CCTV' ? 'bg-primary/20' : 'hover:bg-gray-700'}
                    `}
                >
                    <GiCctvCamera
                        size={40}
                        className={selectedType === 'CCTV' ? 'text-primary' : 'text-gray-400'}
                    />
                    <p className="mt-2 flex justify-center w-full text-center">CCTV Recommendations</p>
                </div>

                <div
                    onClick={() => handleTypeSelection('Police')}
                    className={`
                        flex flex-col items-center justify-center w-full cursor-pointer p-4 rounded-md 
                        ${selectedType === 'Police' ? 'bg-primary/20' : 'hover:bg-gray-700'}
                    `}
                >
                    <RiPoliceBadgeFill
                        size={40}
                        className={selectedType === 'Police' ? 'text-primary' : 'text-gray-400'}
                    />
                    <p className="mt-2 flex justify-center w-full text-center">Police Recommendations</p>
                </div>
            </div>

            {selectedType && renderRecommendationDetails()}
        </div>
    )
}