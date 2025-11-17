// Fetch WindBorne balloon constellation data
export const fetchWindBorneData = async () => {
  const allData = [];
  
  for (let i = 0; i < 24; i++) {
    const hour = String(i).padStart(2, '0');
    const url = `https://corsproxy.io/?https://a.windbornesystems.com/treasure/${hour}.json`;
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        allData.push({
          hoursAgo: i,
          timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
          data: data,
          success: true
        });
      } else {
        allData.push({ hoursAgo: i, success: false });
      }
    } catch (error) {
      console.warn(`Failed to fetch hour ${hour}:`, error);
      allData.push({ hoursAgo: i, success: false, error: error.message });
    }
  }
  
  return allData;
};

// Extract balloon positions from API response
export const extractBalloonPositions = (allData) => {
  const balloons = [];
  
  allData.forEach(hourData => {
    if (hourData.success && hourData.data) {
      const hourBalloons = parseWindBorneResponse(hourData.data, hourData.hoursAgo);
      balloons.push(...hourBalloons);
    }
  });
  
  console.log('Total balloons extracted:', balloons.length);
  return balloons;
};

// Helper to parse WindBorne API response
// Helper to parse WindBorne API response
const parseWindBorneResponse = (data, hoursAgo) => {
  const balloons = [];
  
  console.log(`=== HOUR ${hoursAgo} ===`);
  console.log('Type:', typeof data, 'IsArray:', Array.isArray(data));
  
  // Data is an array of [lat, lon, altitude] arrays
  if (Array.isArray(data)) {
    console.log(`Processing ${data.length} balloons`);
    
    data.forEach((balloonArray, index) => {
      if (Array.isArray(balloonArray) && balloonArray.length >= 2) {
        const [lat, lon, altitude] = balloonArray;
        
        // Show first 3 for debugging
        if (index < 3) {
          console.log(`Balloon ${index}: [${lat}, ${lon}, ${altitude}]`);
        }
        
        balloons.push({
          id: `${hoursAgo}-${index}`, // Generate ID from hour + index
          lat: lat,
          lon: lon,
          altitude: altitude || 0,
          hoursAgo: hoursAgo,
          timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
          rawData: balloonArray
        });
      }
    });
  }
  
  console.log(`✅ Extracted ${balloons.length} balloons`);
  return balloons;
};