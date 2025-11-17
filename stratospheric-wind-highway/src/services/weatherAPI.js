const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

// Fetch wind data for a specific location
export const fetchWindData = async (lat, lon) => {
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      windSpeed: data.current?.wind_speed || 0,
      windDeg: data.current?.wind_deg || 0,
      windGust: data.current?.wind_gust || 0,
      temp: data.current?.temp || 0,
      pressure: data.current?.pressure || 0,
      lat,
      lon
    };
  } catch (error) {
    console.error('Failed to fetch wind data:', error);
    return { success: false, error: error.message, lat, lon };
  }
};

// Batch fetch wind data for multiple balloon positions
export const fetchWindDataBatch = async (balloonPositions) => {
  // Limit API calls - only get wind for unique locations
  const uniquePositions = getUniquePositions(balloonPositions);
  
  const windDataPromises = uniquePositions.map(pos => 
    fetchWindData(pos.lat, pos.lon)
  );
  
  const results = await Promise.all(windDataPromises);
  return results.filter(r => r.success);
};

// Helper to avoid duplicate API calls for same location
const getUniquePositions = (positions) => {
  const unique = new Map();
  
  positions.forEach(pos => {
    const key = `${pos.lat.toFixed(2)},${pos.lon.toFixed(2)}`;
    if (!unique.has(key)) {
      unique.set(key, { lat: pos.lat, lon: pos.lon });
    }
  });
  
  return Array.from(unique.values());
};