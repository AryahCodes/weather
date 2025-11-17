import { useState, useEffect } from 'react';
import { fetchWindBorneData, extractBalloonPositions } from './services/windborneAPI';
import { fetchWindDataBatch } from './services/weatherAPI';
import Map from './components/Map';
import './App.css';

function App() {
  const [balloonData, setBalloonData] = useState([]);
  const [windData, setWindData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHour, setSelectedHour] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching WindBorne data...');
      const rawData = await fetchWindBorneData();
      
      const balloons = extractBalloonPositions(rawData);
      console.log('Extracted balloons:', balloons);
      setBalloonData(balloons);
      
      // Fetch wind data for ONLY 20 sample locations to stay under limits
      const currentBalloons = balloons.filter(b => b.hoursAgo === 0);
      const sampledBalloons = currentBalloons.filter((_, index) => index % 50 === 0).slice(0, 20);
      
      if (sampledBalloons.length > 0) {
        console.log(`Fetching wind data for ${sampledBalloons.length} sample locations...`);
        const winds = await fetchWindDataBatch(sampledBalloons);
        console.log('Wind data:', winds);
        setWindData(winds);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Filter balloons by selected hour
  const filteredBalloons = balloonData.filter(b => b.hoursAgo === selectedHour);

  return (
    <div className="App">
      <header>
        <h1>🎈 Stratospheric Wind Highway</h1>
        <p>WindBorne Systems - Live Balloon Constellation</p>
      </header>

      <main>
        {loading && <div className="loading">Loading balloon constellation...</div>}
        
        {error && <div className="error">Error: {error}</div>}
        
        {!loading && !error && (
          <>
            <div className="data-summary">
              <div className="stat">
                <strong>{balloonData.length}</strong>
                <span>Total Positions (24h)</span>
              </div>
              <div className="stat">
                <strong>{filteredBalloons.length}</strong>
                <span>Current Balloons</span>
              </div>
              <div className="stat">
                <strong>{windData.length}</strong>
                <span>Wind Samples</span>
              </div>
              <button onClick={loadData}>Refresh Data</button>
            </div>

            {/* Time Slider */}
            <div className="time-slider">
              <label>
                <strong>Time: {selectedHour} hours ago</strong>
                <input 
                  type="range" 
                  min="0" 
                  max="23" 
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(parseInt(e.target.value))}
                  style={{ width: '100%', marginTop: '10px' }}
                />
              </label>
            </div>

            {/* Map */}
            <div className="map-container">
              <Map 
                balloons={filteredBalloons} 
                allBalloons={balloonData}
                windData={windData} 
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;