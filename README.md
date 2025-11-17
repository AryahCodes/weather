# 🎈 Stratospheric Wind Highway

An interactive 3D visualization of WindBorne Systems' global weather balloon constellation, combining live balloon tracking data with atmospheric wind patterns.

**Live Demo:** https://stratospheric-wind-highway.vercel.app/

Built for the WindBorne Systems Web Developer coding challenge.

---

## 🌟 Features

- **Live Balloon Tracking**: Real-time visualization of 1,000+ weather balloons across the globe
- **Historical Data**: 24-hour time slider to view balloon movement through the atmosphere
- **3D Globe Visualization**: Interactive Mapbox GL globe with atmospheric effects
- **Wind Data Integration**: Live wind speed and direction at sampled balloon locations
- **Dual-Dataset Combination**: Integrates WindBorne constellation API with OpenWeather API
- **Color-Coded Altitude**: Visual representation of balloon heights (0-30+ km)
- **Interactive Tooltips**: Click balloons and wind markers for detailed information

---

## 🛠️ Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Mapbox GL JS** - 3D globe visualization with globe projection
- **WindBorne Systems API** - Live balloon constellation data
- **OpenWeather API** - Atmospheric wind data
- **JavaScript/ES6+** - Modern JavaScript features

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Mapbox API token (free tier)
- OpenWeather API key (free tier)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/stratospheric-wind-highway.git
cd stratospheric-wind-highway
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file in the root directory:
```env
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_OPENWEATHER_API_KEY=your_openweather_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

---

## 📊 Data Processing

The application:
- Fetches 24 hours of balloon position data from WindBorne's API (00.json - 23.json)
- Parses undocumented JSON format containing ~1,000 balloons per hour
- Samples 20 balloon locations for wind data queries (staying within API limits)
- Combines datasets to visualize atmospheric "highways" that balloons follow

---

## 🎯 Challenge Requirements Met

✅ Query live constellation API and robustly extract balloon positions  
✅ Combine with second public dataset (OpenWeather API)  
✅ Create interactive, visual web application  
✅ Handle undocumented/corrupted API responses gracefully  
✅ Deploy to public URL  

---

## 🔧 Implementation Notes

- **API Rate Limiting**: Limited wind API calls to 20 samples per load to stay within free tier limits
- **Error Handling**: Robust parsing handles missing data and corrupted responses
- **Performance**: Efficient rendering of 24,000+ data points across 24 hours
- **Responsive Design**: Full-screen layout optimized for data visualization

---

## 📝 Future Enhancements

- Animation mode to auto-play 24-hour history
- Balloon trajectory predictions using wind patterns
- Filter balloons by altitude range
- Export data as CSV/JSON
- Real-time updates with WebSocket connection

---

## 👨‍💻 Author

**Aryahvishwa Babu**  
Computer Science Student, University of Maryland  
Quantum ML Researcher | Full-Stack Developer

Built as part of WindBorne Systems Flight Team Web Developer application.

---

## 📄 License

This project was created for a job application coding challenge.
