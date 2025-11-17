import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN;

export default function Map({ balloons, allBalloons = [], windData = [] }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const windMarkers = useRef([]);

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20],
      zoom: 1.5,
      projection: 'globe'
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      
      map.current.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6
      });
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

  }, []);

  // Add balloon data to map
  useEffect(() => {
    if (!map.current || !mapLoaded || !balloons || balloons.length === 0) return;

    if (map.current.getLayer('balloons')) {
      map.current.removeLayer('balloons');
    }
    if (map.current.getSource('balloons')) {
      map.current.removeSource('balloons');
    }

    const geojsonData = {
      type: 'FeatureCollection',
      features: balloons.map(balloon => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [balloon.lon, balloon.lat]
        },
        properties: {
          id: balloon.id,
          altitude: balloon.altitude,
          hoursAgo: balloon.hoursAgo,
          timestamp: balloon.timestamp
        }
      }))
    };

    map.current.addSource('balloons', {
      type: 'geojson',
      data: geojsonData
    });

    map.current.addLayer({
      id: 'balloons',
      type: 'circle',
      source: 'balloons',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          1, 2,
          5, 6,
          10, 10
        ],
        'circle-color': [
          'interpolate',
          ['linear'],
          ['get', 'altitude'],
          0, '#3b82f6',
          10, '#8b5cf6',
          20, '#ec4899',
          30, '#f43f5e'
        ],
        'circle-opacity': 0.8,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-opacity': 0.5
      }
    });

    map.current.on('mouseenter', 'balloons', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'balloons', () => {
      map.current.getCanvas().style.cursor = '';
    });

    map.current.on('click', 'balloons', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const props = e.features[0].properties;

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`
          <div style="color: #000; padding: 8px;">
            <strong>🎈 Balloon ${props.id}</strong><br/>
            <strong>Altitude:</strong> ${props.altitude.toFixed(2)} km<br/>
            <strong>Time:</strong> ${props.hoursAgo}h ago<br/>
            <strong>Location:</strong> ${coordinates[1].toFixed(2)}°, ${coordinates[0].toFixed(2)}°
          </div>
        `)
        .addTo(map.current);
    });

    console.log(`Added ${balloons.length} balloons to map`);

  }, [balloons, mapLoaded]);

  // Add wind data markers
  useEffect(() => {
    if (!map.current || !mapLoaded || !windData || windData.length === 0) return;

    windMarkers.current.forEach(marker => marker.remove());
    windMarkers.current = [];

    windData.forEach(wind => {
      const el = document.createElement('div');
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.cursor = 'pointer';
      
      const speedColor = wind.windSpeed > 20 ? '#ef4444' : 
                        wind.windSpeed > 10 ? '#f59e0b' : 
                        '#22c55e';
      
      el.innerHTML = `
        <div style="
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(${wind.windDeg}deg);
        ">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <path 
              d="M 20 10 L 20 30 M 20 10 L 15 15 M 20 10 L 25 15" 
              stroke="${speedColor}" 
              stroke-width="3" 
              fill="none"
              stroke-linecap="round"
            />
          </svg>
        </div>
      `;

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat([wind.lon, wind.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="color: #000; padding: 8px;">
                <strong>🌬️ Wind Data</strong><br/>
                <strong>Speed:</strong> ${wind.windSpeed.toFixed(1)} m/s<br/>
                <strong>Direction:</strong> ${wind.windDeg}°<br/>
                <strong>Temperature:</strong> ${wind.temp.toFixed(1)}°C<br/>
                <strong>Pressure:</strong> ${wind.pressure} hPa
              </div>
            `)
        )
        .addTo(map.current);

      windMarkers.current.push(marker);
    });

    console.log(`Added ${windData.length} wind markers to map`);

  }, [windData, mapLoaded]);

  // Add balloon trails showing 24-hour paths
  useEffect(() => {
    if (!map.current || !mapLoaded || !allBalloons || allBalloons.length === 0) return;

    // Remove existing trails
    if (map.current.getLayer('balloon-trails')) {
      map.current.removeLayer('balloon-trails');
    }
    if (map.current.getSource('balloon-trails')) {
      map.current.removeSource('balloon-trails');
    }

    // Group balloons by their base ID
    const balloonGroups = {};
    allBalloons.forEach(balloon => {
      const baseId = balloon.id.split('-').slice(0, -1).join('-');
      if (!balloonGroups[baseId]) {
        balloonGroups[baseId] = [];
      }
      balloonGroups[baseId].push(balloon);
    });

    // Create line features for trails
    const trailFeatures = [];
    Object.entries(balloonGroups).forEach(([baseId, positions]) => {
      const sortedPositions = positions.sort((a, b) => b.hoursAgo - a.hoursAgo);
      
      if (sortedPositions.length >= 2) {
        const coordinates = sortedPositions.map(p => [p.lon, p.lat]);
        
        trailFeatures.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          },
          properties: {
            balloonId: baseId
          }
        });
      }
    });

    if (trailFeatures.length > 0) {
      map.current.addSource('balloon-trails', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: trailFeatures
        }
      });

      map.current.addLayer({
        id: 'balloon-trails',
        type: 'line',
        source: 'balloon-trails',
        paint: {
          'line-color': '#60a5fa',
          'line-width': 1.5,
          'line-opacity': 0.3
        }
      }, 'balloons');

      console.log(`✨ Added ${trailFeatures.length} balloon trails showing 24h paths!`);
    }

  }, [allBalloons, mapLoaded]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      
      <div style={{
        position: 'absolute',
        bottom: '30px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '15px',
        borderRadius: '8px',
        color: 'white',
        fontSize: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        <strong>🎈 Altitude (km)</strong>
        <div style={{ marginTop: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ width: '15px', height: '15px', background: '#3b82f6', borderRadius: '50%', marginRight: '8px' }}></div>
            <span>0-10 km</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ width: '15px', height: '15px', background: '#8b5cf6', borderRadius: '50%', marginRight: '8px' }}></div>
            <span>10-20 km</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ width: '15px', height: '15px', background: '#ec4899', borderRadius: '50%', marginRight: '8px' }}></div>
            <span>20-30 km</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '15px', height: '15px', background: '#f43f5e', borderRadius: '50%', marginRight: '8px' }}></div>
            <span>30+ km</span>
          </div>
        </div>
        
        <strong>🌬️ Wind Speed</strong>
        <div style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ width: '15px', height: '15px', background: '#22c55e', marginRight: '8px' }}></div>
            <span>&lt; 10 m/s</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ width: '15px', height: '15px', background: '#f59e0b', marginRight: '8px' }}></div>
            <span>10-20 m/s</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '15px', height: '15px', background: '#ef4444', marginRight: '8px' }}></div>
            <span>&gt; 20 m/s</span>
          </div>
        </div>
      </div>
    </div>
  );
}