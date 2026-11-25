import React, { useEffect, useState } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap, 
  useMapEvents 
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Navigation, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from './StatusBadge';

// Fix for default Leaflet marker icon in Vite / Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom colored civic marker icons
const createCivicIcon = (color = '#1e3a8a') => {
  return L.divIcon({
    className: 'custom-civic-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
      <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const defaultIcon = createCivicIcon('#1e3a8a');
const emergencyIcon = createCivicIcon('#dc2626');
const resolvedIcon = createCivicIcon('#15803d');

// Helper to recenter map programmatically
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 15);
    }
  }, [center, zoom, map]);
  return null;
}

// Click listener for interactive location picking
function LocationPickerEvents({ onLocationPicked }) {
  useMapEvents({
    click(e) {
      if (onLocationPicked) {
        onLocationPicked(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export function CivicLeafletMap({
  mode = 'view', // 'view' | 'picker'
  center = [28.6139, 77.2090], // Default center (e.g. New Delhi / National Capital)
  zoom = 13,
  complaints = [],
  selectedComplaintId = null,
  onComplaintSelect = null,
  pickedLocation = null, // { lat, lng }
  onLocationPicked = null,
  height = '400px'
}) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [currentCenter, setCurrentCenter] = useState(
    pickedLocation?.lat && pickedLocation?.lng 
      ? [pickedLocation.lat, pickedLocation.lng] 
      : center
  );

  useEffect(() => {
    if (pickedLocation?.lat && pickedLocation?.lng) {
      setCurrentCenter([pickedLocation.lat, pickedLocation.lng]);
    }
  }, [pickedLocation]);

  // Request actual browser geolocation (no fabricated coordinates)
  const handleDetectLiveGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Browser geolocation is not supported on this device.');
      return;
    }

    setGpsLoading(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCurrentCenter([lat, lng]);
        if (onLocationPicked) {
          onLocationPicked(lat, lng, pos.coords.accuracy);
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) {
          setGpsError('Location access was denied. Please permit location access in your browser or click on the map to set location manually.');
        } else if (err.code === 2) {
          setGpsError('Position unavailable. Please select your position on the map manually.');
        } else {
          setGpsError('Geolocation request timed out. You may click on the map to set your location.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-2">
      
      {/* Top Action Bar for Location Detection (in Picker Mode) */}
      {mode === 'picker' && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="w-4 h-4 text-blue-900" />
            <span className="font-semibold">
              {pickedLocation?.lat && pickedLocation?.lng ? (
                <span>Selected Coordinates: <strong className="font-mono text-blue-900">{pickedLocation.lat.toFixed(5)}, {pickedLocation.lng.toFixed(5)}</strong></span>
              ) : (
                <span>Click on the map or use the GPS button to pin the exact complaint location</span>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={handleDetectLiveGps}
            disabled={gpsLoading}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded bg-blue-900 hover:bg-blue-800 text-white font-medium transition-colors disabled:opacity-50"
          >
            <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
            <span>{gpsLoading ? 'Requesting GPS...' : 'Detect My Live Location'}</span>
          </button>
        </div>
      )}

      {gpsError && (
        <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Leaflet Map Surface */}
      <div 
        style={{ height }} 
        className="w-full rounded-lg border border-slate-300 overflow-hidden shadow-sm relative z-0"
      >
        <MapContainer
          center={currentCenter}
          zoom={zoom}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeMapView center={currentCenter} zoom={zoom} />
          
          {/* OpenStreetMap Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Location Picker Mode: Single Drag/Click Marker */}
          {mode === 'picker' && (
            <>
              <LocationPickerEvents onLocationPicked={onLocationPicked} />
              {pickedLocation?.lat && pickedLocation?.lng && (
                <Marker 
                  position={[pickedLocation.lat, pickedLocation.lng]}
                  icon={defaultIcon}
                >
                  <Popup>
                    <div className="text-xs space-y-1">
                      <strong className="block text-slate-900">Marked Incident Location</strong>
                      <span className="text-slate-600 font-mono text-[11px] block">
                        Lat: {pickedLocation.lat.toFixed(5)}, Lng: {pickedLocation.lng.toFixed(5)}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Click elsewhere to re-position</span>
                    </div>
                  </Popup>
                </Marker>
              )}
            </>
          )}

          {/* View Mode: Multiple Complaints Markers */}
          {mode === 'view' && complaints.map((complaint) => {
            if (!complaint.latitude || !complaint.longitude) return null;

            const icon = complaint.status === 'Resolved' 
              ? resolvedIcon 
              : (complaint.severity === 'Emergency' || complaint.priority === 'Emergency') 
              ? emergencyIcon 
              : defaultIcon;

            return (
              <Marker
                key={complaint.id || complaint.complaintId}
                position={[complaint.latitude, complaint.longitude]}
                icon={icon}
              >
                <Popup>
                  <div className="text-xs space-y-2 min-w-[200px]">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                      <span className="font-mono font-bold text-blue-900 text-[11px]">
                        {complaint.id || complaint.complaintId}
                      </span>
                      <StatusBadge status={complaint.status} size="sm" />
                    </div>

                    <h4 className="font-bold text-slate-900 leading-snug">
                      {complaint.title}
                    </h4>

                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <div>Category: <strong>{complaint.categoryName}</strong></div>
                      <div>Ward: {complaint.ward}</div>
                      <div className="truncate max-w-[190px]">{complaint.address}</div>
                    </div>

                    {onComplaintSelect && (
                      <button
                        onClick={() => onComplaintSelect(complaint.id || complaint.complaintId)}
                        className="w-full mt-1 py-1 rounded bg-blue-900 text-white text-[11px] font-semibold text-center block"
                      >
                        Inspect Complaint
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

    </div>
  );
}

