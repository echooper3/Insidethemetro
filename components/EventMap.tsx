import React, { useEffect, useRef } from 'react';
import { EventRecommendation, City } from '../types';

interface EventMapProps {
  events: EventRecommendation[];
  city: City;
}

const EventMap: React.FC<EventMapProps> = ({ events, city }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Check if L (Leaflet) is available globally
    const L = (window as any).L;
    if (!L) {
      console.error("Leaflet not loaded");
      return;
    }

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView(city.coordinates, 12);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstanceRef.current);
    } else {
      // Update center if city changes
      mapInstanceRef.current.setView(city.coordinates, 12);
    }

    return () => {
      // Cleanup
    };
  }, [city]);

  // Update Markers
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = L.latLngBounds([city.coordinates]);

    events.forEach(event => {
      if (event.location && event.location.latitude && event.location.longitude) {
        
        const isSponsored = event.isSponsored;
        // Sponsored events get a distinct Amber color (#f59e0b) vs standard Orange (#ea580c)
        const markerColor = isSponsored ? '#f59e0b' : '#ea580c'; 
        const markerSize = isSponsored ? 32 : 24;
        const zIndexOffset = isSponsored ? 1000 : 0; // Bring promoted pins to front

        const markerIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: ${markerColor}; width: ${markerSize}px; height: ${markerSize}px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); transition: transform 0.2s;">
            ${isSponsored ? '<div style="position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; background: #fbbf24; border-radius: 50%; border: 1px solid white;"></div>' : ''}
          </div>`,
          iconSize: [markerSize, markerSize],
          iconAnchor: [markerSize / 2, markerSize / 2]
        });

        const popupContent = `
          <div style="font-family: 'Inter', sans-serif; min-width: 200px; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <h3 style="font-weight: 700; font-size: 14px; color: #1e293b; line-height: 1.2; margin: 0;">${event.name}</h3>
                ${isSponsored ? '<span style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #d97706; border: 1px solid #fbbf24; padding: 1px 3px; border-radius: 4px; margin-left: 4px;">Promoted</span>' : ''}
            </div>
            <span style="display: inline-block; background-color: #ffedd5; color: #c2410c; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">${event.category}</span>
            <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 1.4;">${event.location.address}</p>
          </div>
        `;

        const marker = L.marker([event.location.latitude, event.location.longitude], { 
            icon: markerIcon,
            zIndexOffset: zIndexOffset
        })
          .addTo(mapInstanceRef.current)
          .bindPopup(popupContent);
        
        // Add click listener to animate map
        marker.on('click', () => {
          mapInstanceRef.current.flyTo(
            [event.location.latitude, event.location.longitude], 
            15, // Zoom level
            {
              animate: true,
              duration: 1.5 // Animation duration in seconds
            }
          );
        });
        
        markersRef.current.push(marker);
        bounds.extend([event.location.latitude, event.location.longitude]);
      }
    });

    if (events.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [events, city]);

  return <div ref={mapContainerRef} className="w-full h-full rounded-xl z-0" />;
};

export default EventMap;