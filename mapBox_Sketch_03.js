// MAPBOX TUTORIAL: Ridgewood Filtered Buildings Visualization
// ============================================================

var mapboxSketch03 = function() {
  // STEP 1: MAPBOX TOKEN
  mapboxgl.accessToken = 'pk.eyJ1IjoibWlrYTEiLCJhIjoiY21kYzZwYWQzMTNkZjJscTBzYXM5aHllciJ9.uX_nmaoWUhFkFVV8t9XtrA';

  // STEP 2: CREATE MAP
  const map3 = new mapboxgl.Map({
    container: 'mapbox-container-3',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-73.9018, 40.7092], // Ridgewood, Queens
    zoom: 14,
    pitch: 0,
    bearing: 0
  });

  // STEP 3: CONTROLS
  map3.addControl(new mapboxgl.NavigationControl(), 'top-right');
  map3.addControl(new mapboxgl.FullscreenControl(), 'top-right');
  map3.addControl(new mapboxgl.ScaleControl({ maxWidth: 80, unit: 'metric' }), 'bottom-left');

  // STEP 4: ON MAP LOAD
  map3.on('load', () => {
    console.log('Map 3 loaded successfully!');

    // STEP 5: FETCH FILTERED BUILDING DATA
    fetch('ridgewood_filtered.geojson')
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log('GeoJSON loaded:', data);
        map3.addSource('ridgewood-buildings', {
          type: 'geojson',
          data: data
        });

        // STEP 6: ADD LAYER FOR BUILDINGS
        map3.addLayer({
          id: 'buildings-fill',
          type: 'fill',
          source: 'ridgewood-buildings',
          paint: {
            'fill-color': '#6EE7B7',
            'fill-opacity': 0.7,
            'fill-outline-color': '#047857'
          }
        });

        // STEP 7: FIT MAP TO BUILDINGS
        const bounds = new mapboxgl.LngLatBounds();
        data.features.forEach(feature => {
          const geom = feature.geometry;
          if (geom.type === 'Polygon') {
            geom.coordinates[0].forEach(coord => bounds.extend(coord));
          } else if (geom.type === 'MultiPolygon') {
            geom.coordinates.forEach(polygon => {
              polygon[0].forEach(coord => bounds.extend(coord));
            });
          }
        });

        map3.fitBounds(bounds, {
          padding: 50,
          duration: 2000,
          maxZoom: 16
        });

        // STEP 8: ADD POPUPS
        map3.on('click', 'buildings-fill', (e) => {
          const props = e.features[0].properties;
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <strong>Address:</strong> ${props.Address || 'N/A'}<br>
              <strong>Year Built:</strong> ${props.YearBuilt || 'Unknown'}<br>
              <strong>Lot Area:</strong> ${props.LotArea || 'N/A'} sqft
            `)
            .addTo(map3);
        });

        map3.on('mouseenter', 'buildings-fill', () => {
          map3.getCanvas().style.cursor = 'pointer';
        });
        map3.on('mouseleave', 'buildings-fill', () => {
          map3.getCanvas().style.cursor = '';
        });

        // STEP 9: BUTTONS
        document.getElementById('fitToData').addEventListener('click', () => {
          map3.fitBounds(bounds, { padding: 50, duration: 2000, maxZoom: 16 });
        });

        document.getElementById('resetFilters').addEventListener('click', () => {
          document.getElementById('searchFeature').value = '';
          map3.setFilter('buildings-fill', null);
        });

        // STEP 10: SEARCH
        document.getElementById('searchFeature').addEventListener('input', (e) => {
          const term = e.target.value.toLowerCase();
          if (!term) {
            map3.setFilter('buildings-fill', null);
          } else {
            map3.setFilter('buildings-fill', ['in', term, ['downcase', ['get', 'Address']]]);
          }
        });

        // STEP 11: KEYBOARD SHORTCUTS
        document.addEventListener('keydown', (e) => {
          switch (e.key) {
            case 'f':
            case 'F':
              e.preventDefault();
              document.getElementById('fitToData').click();
              break;
            case 'r':
            case 'R':
              e.preventDefault();
              document.getElementById('resetFilters').click();
              break;
            case 'Escape':
              e.preventDefault();
              document.getElementById('searchFeature').value = '';
              document.getElementById('searchFeature').dispatchEvent(new Event('input'));
              break;
          }
        });

        console.log('Map initialized with Ridgewood data.');
      })
      .catch(error => {
        console.error('Error loading GeoJSON:', error);
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #ff4444;
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          z-index: 1000;
        `;
        errorDiv.innerHTML = `
          <h3>Error Loading Data</h3>
          <p>Could not load the GeoJSON file. Make sure you're running this on a local server.</p>
          <p>Error: ${error.message}</p>
        `;
        document.getElementById('mapbox-container-3').appendChild(errorDiv);
      });
  });
};

mapboxSketch03();
