import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { scaleLinear } from 'd3-scale';

interface LocationChartProps {
  data: Array<{ location: string; count: number }>;
}

// US States TopoJSON URL
const US_GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// US City coordinates [longitude, latitude]
const US_CITY_COORDS: Record<string, [number, number]> = {
  // Major cities
  'new york': [-74.006, 40.7128],
  'new york city': [-74.006, 40.7128],
  'nyc': [-74.006, 40.7128],
  'los angeles': [-118.2437, 34.0522],
  'la': [-118.2437, 34.0522],
  'chicago': [-87.6298, 41.8781],
  'houston': [-95.3698, 29.7604],
  'phoenix': [-112.074, 33.4484],
  'philadelphia': [-75.1652, 39.9526],
  'san antonio': [-98.4936, 29.4241],
  'san diego': [-117.1611, 32.7157],
  'dallas': [-96.797, 32.7767],
  'san jose': [-121.8863, 37.3382],
  'austin': [-97.7431, 30.2672],
  'jacksonville': [-81.6557, 30.3322],
  'fort worth': [-97.3308, 32.7555],
  'columbus': [-82.9988, 39.9612],
  'charlotte': [-80.8431, 35.2271],
  'san francisco': [-122.4194, 37.7749],
  'sf': [-122.4194, 37.7749],
  'indianapolis': [-86.1581, 39.7684],
  'seattle': [-122.3321, 47.6062],
  'denver': [-104.9903, 39.7392],
  'washington': [-77.0369, 38.9072],
  'washington dc': [-77.0369, 38.9072],
  'dc': [-77.0369, 38.9072],
  'boston': [-71.0589, 42.3601],
  'el paso': [-106.485, 31.7619],
  'nashville': [-86.7816, 36.1627],
  'detroit': [-83.0458, 42.3314],
  'oklahoma city': [-97.5164, 35.4676],
  'portland': [-122.6765, 45.5152],
  'las vegas': [-115.1398, 36.1699],
  'vegas': [-115.1398, 36.1699],
  'memphis': [-90.049, 35.1495],
  'louisville': [-85.7585, 38.2527],
  'baltimore': [-76.6122, 39.2904],
  'milwaukee': [-87.9065, 43.0389],
  'albuquerque': [-106.6504, 35.0844],
  'tucson': [-110.9747, 32.2226],
  'fresno': [-119.7871, 36.7378],
  'mesa': [-111.8315, 33.4152],
  'sacramento': [-121.4944, 38.5816],
  'atlanta': [-84.388, 33.749],
  'kansas city': [-94.5786, 39.0997],
  'colorado springs': [-104.8214, 38.8339],
  'miami': [-80.1918, 25.7617],
  'raleigh': [-78.6382, 35.7796],
  'omaha': [-95.9345, 41.2565],
  'long beach': [-118.1937, 33.77],
  'virginia beach': [-75.978, 36.8529],
  'oakland': [-122.2711, 37.8044],
  'minneapolis': [-93.265, 44.9778],
  'tulsa': [-95.9928, 36.154],
  'tampa': [-82.4572, 27.9506],
  'arlington': [-97.1081, 32.7357],
  'new orleans': [-90.0715, 29.9511],
  'wichita': [-97.3375, 37.6872],
  'cleveland': [-81.6944, 41.4993],
  'bakersfield': [-119.0187, 35.3733],
  'aurora': [-104.8319, 39.7294],
  'anaheim': [-117.9145, 33.8366],
  'honolulu': [-157.8583, 21.3069],
  'santa ana': [-117.8678, 33.7455],
  'riverside': [-117.3961, 33.9533],
  'corpus christi': [-97.3964, 27.8006],
  'lexington': [-84.5037, 38.0406],
  'stockton': [-121.2908, 37.9577],
  'henderson': [-114.9817, 36.0395],
  'saint paul': [-93.09, 44.9537],
  'st paul': [-93.09, 44.9537],
  'st. paul': [-93.09, 44.9537],
  'cincinnati': [-84.512, 39.1031],
  'pittsburgh': [-79.9959, 40.4406],
  'greensboro': [-79.791, 36.0726],
  'anchorage': [-149.9003, 61.2181],
  'plano': [-96.6989, 33.0198],
  'lincoln': [-96.6852, 40.8258],
  'orlando': [-81.3792, 28.5383],
  'irvine': [-117.7947, 33.6846],
  'newark': [-74.1724, 40.7357],
  'toledo': [-83.5379, 41.6528],
  'durham': [-78.8986, 35.994],
  'chula vista': [-117.0842, 32.6401],
  'fort wayne': [-85.1394, 41.0793],
  'jersey city': [-74.0431, 40.7178],
  'st. louis': [-90.1994, 38.627],
  'st louis': [-90.1994, 38.627],
  'saint louis': [-90.1994, 38.627],
  'laredo': [-99.5075, 27.5306],
  'scottsdale': [-111.9261, 33.4942],
  'reno': [-119.8138, 39.5296],
  'buffalo': [-78.8784, 42.8864],
  'gilbert': [-111.789, 33.3528],
  'glendale': [-112.1859, 33.5387],
  'north las vegas': [-115.1175, 36.1989],
  'winston-salem': [-80.2442, 36.0999],
  'chesapeake': [-76.2875, 36.7682],
  'norfolk': [-76.2859, 36.8508],
  'fremont': [-121.9886, 37.5485],
  'garland': [-96.6389, 32.9126],
  'irving': [-96.9489, 32.814],
  'hialeah': [-80.2781, 25.8576],
  'richmond': [-77.436, 37.5407],
  'boise': [-116.2023, 43.615],
  'spokane': [-117.426, 47.6588],
  'baton rouge': [-91.1403, 30.4515],
  'tacoma': [-122.4443, 47.2529],
  'san bernardino': [-117.2898, 34.1083],
  'modesto': [-120.9969, 37.6391],
  'fontana': [-117.435, 34.0922],
  'des moines': [-93.6091, 41.5868],
  'moreno valley': [-117.2297, 33.9425],
  'santa clarita': [-118.5426, 34.3917],
  'fayetteville': [-78.8784, 35.0527],
  'birmingham': [-86.8025, 33.5207],
  'rochester': [-77.6109, 43.161],
  'salt lake city': [-111.891, 40.7608],
  'slc': [-111.891, 40.7608],
};

// Check if a location is a US city
function isUSCity(location: string): boolean {
  const normalized = location.toLowerCase().trim();
  return US_CITY_COORDS.hasOwnProperty(normalized);
}

export function LocationChart({ data }: LocationChartProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [, setLocation] = useLocation();
  const [tooltipContent, setTooltipContent] = useState<string>('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Separate US cities and others
  const { usCities, othersCount, othersLocations, maxCount } = useMemo(() => {
    const cities: Array<{ name: string; originalName: string; count: number; coords: [number, number] }> = [];
    let others = 0;
    let othersList: Array<{ location: string; count: number }> = [];
    let max = 0;

    data.forEach(item => {
      const normalized = item.location.toLowerCase().trim();
      const coords = US_CITY_COORDS[normalized];

      if (coords) {
        cities.push({
          name: normalized,
          originalName: item.location,
          count: item.count,
          coords
        });
        if (item.count > max) max = item.count;
      } else {
        others += item.count;
        othersList.push(item);
      }
    });

    return { usCities: cities, othersCount: others, othersLocations: othersList, maxCount: max || 1 };
  }, [data]);

  // Bubble size scale
  const sizeScale = useMemo(() => {
    return scaleLinear()
      .domain([1, maxCount])
      .range([6, 24]);
  }, [maxCount]);

  const handleLocationClick = (locationName: string) => {
    setLocation(`/students?location=${encodeURIComponent(locationName)}`);
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-[350px] md:h-[450px] flex items-center justify-center text-muted-foreground">
        No location data available
      </div>
    );
  }

  // Calculate total for percentage
  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Mobile view: Simple list
  if (isMobile) {
    return (
      <div className="space-y-2 py-2 max-h-[350px] overflow-y-auto">
        {usCities.map((city, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b pb-2 cursor-pointer hover:bg-accent/50 rounded-md px-2 py-1 transition-colors"
            onClick={() => handleLocationClick(city.originalName)}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0 bg-blue-500" />
              <span className="text-sm font-medium">{city.originalName}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{city.count}</div>
              <div className="text-xs text-muted-foreground">
                {((city.count / total) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        ))}
        {othersCount > 0 && (
          <div className="flex items-center justify-between border-b pb-2 rounded-md px-2 py-1 bg-muted/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0 bg-gray-400" />
              <span className="text-sm font-medium">Others</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{othersCount}</div>
              <div className="text-xs text-muted-foreground">
                {((othersCount / total) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop: US Map with city bubbles
  return (
    <div className="h-[350px] md:h-[450px] relative">
      {/* Tooltip */}
      {tooltipContent && (
        <div
          className="absolute z-10 bg-popover text-popover-foreground px-3 py-2 rounded-md shadow-md text-sm pointer-events-none border"
          style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
        >
          {tooltipContent}
        </div>
      )}

      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 1100 }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* US States background */}
        <Geographies geography={US_GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#e2e8f0"
                stroke="#cbd5e1"
                strokeWidth={0.5}
                style={{
                  default: { outline: 'none' },
                  hover: { outline: 'none' },
                  pressed: { outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>

        {/* City markers */}
        {usCities.map((city, index) => (
          <Marker
            key={index}
            coordinates={city.coords}
            onMouseEnter={(e) => {
              setTooltipContent(`${city.originalName}: ${city.count} students`);
              const rect = (e.target as Element).closest('svg')?.getBoundingClientRect();
              if (rect) {
                setTooltipPosition({
                  x: e.clientX - rect.left + 10,
                  y: e.clientY - rect.top - 10
                });
              }
            }}
            onMouseLeave={() => setTooltipContent('')}
            onClick={() => handleLocationClick(city.originalName)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              r={sizeScale(city.count)}
              fill="hsl(210, 85%, 55%)"
              fillOpacity={0.7}
              stroke="hsl(210, 85%, 40%)"
              strokeWidth={1.5}
              className="hover:fill-opacity-100 transition-all"
            />
            <text
              textAnchor="middle"
              y={sizeScale(city.count) + 12}
              style={{ fontSize: '8px', fill: '#475569', fontWeight: 500 }}
            >
              {city.count}
            </text>
          </Marker>
        ))}
      </ComposableMap>

      {/* Others badge */}
      {othersCount > 0 && (
        <div className="absolute top-2 right-2 bg-gray-100 border border-gray-300 px-3 py-2 rounded-lg shadow-sm">
          <div className="text-xs text-muted-foreground">Others</div>
          <div className="text-lg font-semibold text-gray-600">{othersCount}</div>
          <div className="text-xs text-muted-foreground">
            {othersLocations.slice(0, 3).map(l => l.location).join(', ')}
            {othersLocations.length > 3 && '...'}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex items-center gap-3 bg-background/80 px-2 py-1 rounded text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500 opacity-70" />
          <span>City</span>
        </div>
        <div className="text-muted-foreground">
          Size = Student count
        </div>
      </div>
    </div>
  );
}
