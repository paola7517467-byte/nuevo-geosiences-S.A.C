/// <reference types="google.maps" />
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { CargoRole, AuthUser, GpsLocationRecord, RealtimePersonnelLocation } from '../types';
import {
  MapPin,
  Crosshair,
  Clock,
  Save,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Layers,
  ExternalLink,
  Loader2,
  Radio,
  Copy,
  Users,
  Navigation,
  MessageCircle,
  RefreshCw,
  Send,
  LocateFixed,
  Search,
  X,
  Plus,
  Minus,
  Car,
  Footprints,
  Route as RouteIcon,
  Bookmark,
  Activity,
} from 'lucide-react';

interface GpsModuleProps {
  cargo: CargoRole;
  user: AuthUser;
  onBack: () => void;
}

interface PhoneCoords {
  lat: number;
  lng: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: string;
}

interface MapTargetPoint {
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  kind: 'SEARCH' | 'TEAM' | 'LANDMARK';
}

type MapLayerType = 'roadmap' | 'satellite' | 'terrain';
type TravelModeType = 'DRIVING' | 'WALKING';

const MAP_TYPE_TO_GOOGLE_ID: Record<MapLayerType, string> = {
  roadmap: 'roadmap',
  satellite: 'hybrid',
  terrain: 'terrain',
};

// Haversine fallback distance in km
function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const c =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
}

// 1. Map Camera, MapType, and Traffic Layer Controller
const MapCameraController: React.FC<{
  targetCenter: { lat: number; lng: number } | null;
  recenterSignal: number;
  mapType: MapLayerType;
  showTraffic: boolean;
  onZoomChange?: (zoom: number) => void;
}> = ({ targetCenter, recenterSignal, mapType, showTraffic }) => {
  const map = useMap();
  const hasCenteredInitially = useRef(false);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);

  useEffect(() => {
    if (!map || !targetCenter) return;
    if (!hasCenteredInitially.current || recenterSignal > 0) {
      map.panTo(targetCenter);
      const currentZoom = map.getZoom() || 14;
      if (currentZoom < 16) {
        map.setZoom(17);
      }
      hasCenteredInitially.current = true;
    }
  }, [map, targetCenter?.lat, targetCenter?.lng, recenterSignal]);

  useEffect(() => {
    if (!map) return;
    map.setMapTypeId(MAP_TYPE_TO_GOOGLE_ID[mapType]);
  }, [map, mapType]);

  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps?.TrafficLayer) return;
    if (showTraffic) {
      if (!trafficLayerRef.current) {
        trafficLayerRef.current = new google.maps.TrafficLayer();
      }
      trafficLayerRef.current.setMap(map);
    } else if (trafficLayerRef.current) {
      trafficLayerRef.current.setMap(null);
    }
    return () => {
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
      }
    };
  }, [map, showTraffic]);

  return null;
};

// 2. Authentic Google Maps Zoom Controls rendered inside APIProvider context
const MapZoomControls: React.FC<{
  onRecenterPhone: () => void;
  isLocating: boolean;
}> = ({ onRecenterPhone, isLocating }) => {
  const map = useMap();

  const handleZoomIn = () => {
    if (!map) return;
    map.setZoom((map.getZoom() || 16) + 1);
  };

  const handleZoomOut = () => {
    if (!map) return;
    map.setZoom(Math.max(2, (map.getZoom() || 16) - 1));
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {/* My Location FAB (Classic Google Maps White Circle with Blue Icon) */}
      <button
        type="button"
        onClick={onRecenterPhone}
        className="w-11 h-11 rounded-full bg-white hover:bg-stone-50 text-[#1a73e8] shadow-lg border border-stone-200 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
        title="Centrar en la ubicación actual de mi celular"
      >
        {isLocating ? (
          <Loader2 className="w-5 h-5 animate-spin text-[#1a73e8]" />
        ) : (
          <LocateFixed className="w-5 h-5 text-[#1a73e8]" />
        )}
      </button>

      {/* Stacked + / - Zoom Control */}
      <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden flex flex-col">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-10 h-9 flex items-center justify-center text-stone-700 hover:bg-stone-100 active:bg-stone-200 transition-colors cursor-pointer border-b border-stone-200"
          title="Acercar mapa"
        >
          <Plus className="w-4 h-4 font-bold" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-10 h-9 flex items-center justify-center text-stone-700 hover:bg-stone-100 active:bg-stone-200 transition-colors cursor-pointer"
          title="Alejar mapa"
        >
          <Minus className="w-4 h-4 font-bold" />
        </button>
      </div>
    </div>
  );
};

// 3. Modern Places Autocomplete Search Bar (Zero-Legacy: AutocompleteSuggestion + Place.fetchFields)
const PlacesSearchOverlay: React.FC<{
  phoneCoords: PhoneCoords | null;
  onSelectPlace: (target: MapTargetPoint) => void;
  onClearTarget: () => void;
  hasActiveTarget: boolean;
}> = ({ phoneCoords, onSelectPlace, onClearTarget, hasActiveTarget }) => {
  const placesLib = useMapsLibrary('places');
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!placesLib || !query.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
        }

        const request: google.maps.places.AutocompleteRequest = {
          input: query.trim(),
          sessionToken: sessionTokenRef.current,
          language: 'es',
          region: 'pe',
          ...(phoneCoords
            ? { locationBias: { center: { lat: phoneCoords.lat, lng: phoneCoords.lng }, radius: 50000 } }
            : {}),
        };

        const res = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
        setSuggestions(res.suggestions || []);
        setShowDropdown(true);
      } catch (err) {
        console.warn('Autocomplete suggestion error:', err);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [placesLib, query, phoneCoords?.lat, phoneCoords?.lng]);

  const handleSelectSuggestion = async (suggestion: google.maps.places.AutocompleteSuggestion) => {
    if (!suggestion.placePrediction) return;
    try {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location'],
      });

      const loc = place.location;
      if (loc) {
        onSelectPlace({
          lat: loc.lat(),
          lng: loc.lng(),
          title: place.displayName || suggestion.placePrediction.text?.text || 'Destino',
          subtitle: place.formattedAddress || undefined,
          kind: 'SEARCH',
        });
        setQuery(place.displayName || suggestion.placePrediction.text?.text || '');
      }
      setShowDropdown(false);
      // Reset session token after Place details fetch
      sessionTokenRef.current = null;
      setSuggestions([]);
    } catch (err) {
      console.warn('Place fetchFields error:', err);
    }
  };

  return (
    <div className="relative w-full max-w-sm">
      <div className="flex items-center bg-white rounded-full shadow-lg border border-stone-200 px-3.5 py-2 gap-2 text-stone-900">
        <Search className="w-4 h-4 text-stone-500 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="Buscar lugar o dirección en Google Maps..."
          className="w-full bg-transparent text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none"
        />
        {isSearching && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1a73e8] shrink-0" />}
        {(query || hasActiveTarget) && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setShowDropdown(false);
              onClearTarget();
            }}
            className="p-0.5 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer shrink-0"
            title="Limpiar búsqueda"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-40 max-h-60 overflow-y-auto">
          {suggestions.map((s, idx) => {
            const label = s.placePrediction?.text?.text || 'Lugar sugerido';
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(s)}
                className="w-full px-3.5 py-2.5 text-left text-xs text-stone-800 hover:bg-blue-50 flex items-start gap-2.5 border-b border-stone-100 last:border-b-0 cursor-pointer transition-colors"
              >
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="font-medium leading-snug">{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 4. Modern Route Polyline & Calculation Renderer (uses useMapsLibrary('routes') -> Route.computeRoutes)
const RouteRenderer: React.FC<{
  origin: { lat: number; lng: number } | null;
  destination: MapTargetPoint | null;
  travelMode: TravelModeType;
  onRouteResult: (info: { distanceKm: number; durationMin: number; isApproximate?: boolean } | null) => void;
}> = ({ origin, destination, travelMode, onRouteResult }) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    // Cleanup previous polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    if (!map || !origin || !destination) {
      onRouteResult(null);
      return;
    }

    let cancelled = false;

    const drawStraightFallback = () => {
      if (cancelled) return;
      const fallbackPoly = new google.maps.Polyline({
        path: [origin, { lat: destination.lat, lng: destination.lng }],
        geodesic: true,
        strokeColor: '#1a73e8',
        strokeOpacity: 0.85,
        strokeWeight: 4,
        icons: [
          {
            icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
            offset: '0',
            repeat: '16px',
          },
        ],
        map,
      });
      polylinesRef.current = [fallbackPoly];
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(origin);
      bounds.extend({ lat: destination.lat, lng: destination.lng });
      map.fitBounds(bounds, 60);

      const km = haversineKm(origin, destination);
      const speedKmH = travelMode === 'WALKING' ? 4.5 : 35;
      onRouteResult({
        distanceKm: Number(km.toFixed(2)),
        durationMin: Math.max(1, Math.round((km / speedKmH) * 60)),
        isApproximate: true,
      });
    };

    if (!routesLib?.Route) {
      drawStraightFallback();
      return () => {
        cancelled = true;
        polylinesRef.current.forEach((p) => p.setMap(null));
        polylinesRef.current = [];
      };
    }

    const request: google.maps.routes.ComputeRoutesRequest = {
      origin,
      destination: { lat: destination.lat, lng: destination.lng },
      travelMode,
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
      internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio'],
    };

    routesLib.Route.computeRoutes(request)
      .then(({ routes }: { routes?: google.maps.routes.Route[] }) => {
        if (cancelled) return;
        const primary = routes?.[0];
        if (!primary) {
          drawStraightFallback();
          return;
        }

        // White casing + Google Maps Blue route line
        const casingPolylines = primary.createPolylines();
        casingPolylines.forEach((p: google.maps.Polyline) => {
          p.setOptions({
            strokeColor: '#ffffff',
            strokeWeight: 9,
            strokeOpacity: 0.9,
          });
          p.setMap(map);
        });

        const innerPolylines = primary.createPolylines();
        innerPolylines.forEach((p: google.maps.Polyline) => {
          p.setOptions({
            strokeColor: '#1a73e8',
            strokeWeight: 5,
            strokeOpacity: 1,
          });
          p.setMap(map);
        });

        polylinesRef.current = [...casingPolylines, ...innerPolylines];

        if (primary.viewport) {
          map.fitBounds(primary.viewport, 60);
        }

        onRouteResult({
          distanceKm: Number(((primary.distanceMeters || 0) / 1000).toFixed(2)),
          durationMin: Math.max(1, Math.round((primary.durationMillis || 0) / 60000)),
          isApproximate: false,
        });
      })
      .catch(() => {
        drawStraightFallback();
      });

    return () => {
      cancelled = true;
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, routesLib, origin?.lat, origin?.lng, destination?.lat, destination?.lng, travelMode]);

  return null;
};

// 5. Realistic Google Maps Blue Dot Marker for the Cell Phone
const PhoneLocationMarker: React.FC<{
  coords: PhoneCoords;
  cargo: CargoRole;
  userName: string;
  address?: string | null;
}> = ({ coords, cargo, userName, address }) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: coords.lat, lng: coords.lng }}
        onClick={() => setInfoOpen((prev) => !prev)}
        title={`Tu Celular (${cargo})`}
        zIndex={100}
      >
        <div className="relative flex items-center justify-center cursor-pointer">
          <span className="absolute w-12 h-12 rounded-full bg-[#1a73e8]/25 animate-ping" />
          <span className="absolute w-8 h-8 rounded-full bg-[#1a73e8]/20 border border-[#1a73e8]/40" />
          <div className="w-5 h-5 rounded-full bg-[#1a73e8] border-[3px] border-white shadow-lg" />
        </div>
      </AdvancedMarker>

      {infoOpen && marker && (
        <InfoWindow anchor={marker} onCloseClick={() => setInfoOpen(false)} maxWidth={270}>
          <div className="text-stone-900 p-1 space-y-1.5 text-xs font-sans">
            <div className="font-extrabold text-[#1a73e8] uppercase tracking-wide flex items-center gap-1">
              <span>📍 Ubicación Actual de tu Celular</span>
            </div>
            <div className="font-bold text-stone-800">
              {userName} • {cargo}
            </div>
            {address && <div className="text-[11px] text-stone-600 leading-snug">{address}</div>}
            <div className="font-mono text-[11px] bg-stone-100 px-2 py-1 rounded border border-stone-200">
              {coords.lat.toFixed(6)}°, {coords.lng.toFixed(6)}°
            </div>
            <div className="text-[11px] text-stone-500">
              Precisión satelital: ±{coords.accuracy} metros
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#1a73e8] hover:underline font-bold pt-0.5"
            >
              Abrir en Google Maps
            </a>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

// 6. Interactive Pin for Team Members
const TeamMemberMarker: React.FC<{
  member: RealtimePersonnelLocation;
  onStartRoute: (target: MapTargetPoint) => void;
}> = ({ member, onStartRoute }) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState(false);

  const pinColor =
    member.cargo === 'RESIDENTE'
      ? '#0284c7'
      : member.cargo === 'ADMINISTRADOR'
        ? '#4f46e5'
        : '#ea580c';

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: member.latitude, lng: member.longitude }}
        onClick={() => setInfoOpen((prev) => !prev)}
        title={`${member.userName} (${member.cargo})`}
      >
        <Pin background={pinColor} borderColor="#ffffff" glyphColor="#ffffff" scale={0.95} />
      </AdvancedMarker>

      {infoOpen && marker && (
        <InfoWindow anchor={marker} onCloseClick={() => setInfoOpen(false)} maxWidth={250}>
          <div className="text-stone-900 p-1 space-y-1.5 text-xs">
            <div className="font-extrabold uppercase text-[10px] tracking-wider text-stone-500">
              {member.cargo}
            </div>
            <div className="font-bold text-stone-900">{member.userName}</div>
            <div className="font-mono text-[11px] text-stone-700">
              {member.latitude.toFixed(5)}°, {member.longitude.toFixed(5)}°
            </div>
            {member.notes && <div className="text-[11px] text-stone-600 italic">{member.notes}</div>}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setInfoOpen(false);
                  onStartRoute({
                    lat: member.latitude,
                    lng: member.longitude,
                    title: `${member.userName} (${member.cargo})`,
                    subtitle: member.notes,
                    kind: 'TEAM',
                  });
                }}
                className="px-2.5 py-1 rounded-lg bg-[#1a73e8] hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer"
              >
                Cómo llegar
              </button>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${member.latitude},${member.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[11px]"
              >
                Google Maps
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

// 7. Pin for Searched Destination or Inspected Target
const TargetPlaceMarker: React.FC<{
  target: MapTargetPoint;
  onStartRoute: (target: MapTargetPoint) => void;
}> = ({ target, onStartRoute }) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState(true);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: target.lat, lng: target.lng }}
        onClick={() => setInfoOpen((prev) => !prev)}
        title={target.title}
        zIndex={90}
      >
        <Pin background="#ea4335" borderColor="#b31412" glyphColor="#ffffff" scale={1.1} />
      </AdvancedMarker>

      {infoOpen && marker && (
        <InfoWindow anchor={marker} onCloseClick={() => setInfoOpen(false)} maxWidth={260}>
          <div className="text-stone-900 p-1 space-y-1.5 text-xs">
            <div className="font-extrabold text-stone-900">{target.title}</div>
            {target.subtitle && <div className="text-[11px] text-stone-600">{target.subtitle}</div>}
            <div className="font-mono text-[10px] text-stone-500">
              {target.lat.toFixed(6)}°, {target.lng.toFixed(6)}°
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setInfoOpen(false);
                  onStartRoute(target);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#1a73e8] hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer"
              >
                Trazar Ruta
              </button>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${target.lat},${target.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[11px]"
              >
                Abrir Maps
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export const GpsModule: React.FC<GpsModuleProps> = ({ cargo, user, onBack }) => {
  // Real-time cell phone coordinates state (MAIN COORDINATE)
  const [currentCoords, setCurrentCoords] = useState<PhoneCoords | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [resolvedPlusCode, setResolvedPlusCode] = useState<string | null>(null);

  // Target pin & Active Route state
  const [selectedTarget, setSelectedTarget] = useState<MapTargetPoint | null>(null);
  const [routeDestination, setRouteDestination] = useState<MapTargetPoint | null>(null);
  const [travelMode, setTravelMode] = useState<TravelModeType>('DRIVING');
  const [routeSummary, setRouteSummary] = useState<{
    distanceKm: number;
    durationMin: number;
    isApproximate?: boolean;
  } | null>(null);

  const [recenterSignal, setRecenterSignal] = useState(0);

  // Maps API key loaded from server config or Vite env
  const [mapsApiKey, setMapsApiKey] = useState<string>(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  );
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  const [isLiveTracking, setIsLiveTracking] = useState(true);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [lastTransmittedTime, setLastTransmittedTime] = useState<string | null>(null);
  const [transmissionCount, setTransmissionCount] = useState(0);

  const [isLocating, setIsLocating] = useState(true);
  const [gpsStatusMsg, setGpsStatusMsg] = useState<string | null>(
    'Obteniendo ubicación exacta del celular...'
  );
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const [notes, setNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [isRefreshingTeam, setIsRefreshingTeam] = useState(false);

  // Map view layer & traffic
  const [mapType, setMapType] = useState<MapLayerType>('satellite');
  const [showTraffic, setShowTraffic] = useState(false);

  // History, team, and drawer tabs
  const [savedRecords, setSavedRecords] = useState<GpsLocationRecord[]>([]);
  const [teamMembers, setTeamMembers] = useState<RealtimePersonnelLocation[]>([]);
  const [panelTab, setPanelTab] = useState<'MI_CELULAR' | 'EQUIPO' | 'HITOS'>('MI_CELULAR');

  // Refs
  const watchIdRef = useRef<number | null>(null);
  const lastSendTimestampRef = useRef<number>(0);
  const lastGeocodeCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const notesRef = useRef<string>('');
  notesRef.current = notes;

  // Fetch Google Maps API key from backend & listen for quota fallback
  useEffect(() => {
    if (!mapsApiKey) {
      fetch('/api/config/maps')
        .then((res) => res.json())
        .then((data) => {
          if (data?.apiKey) {
            setMapsApiKey(data.apiKey);
          } else {
            setUseIframeFallback(true);
          }
        })
        .catch(() => {
          setUseIframeFallback(true);
        });
    }

    const onQuota = () => setUseIframeFallback(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, [mapsApiKey]);

  // Reverse geocode current cell phone location when moved > 50m
  useEffect(() => {
    if (!currentCoords) return;
    const prev = lastGeocodeCoordsRef.current;
    if (prev && haversineKm(prev, currentCoords) < 0.05) return;

    lastGeocodeCoordsRef.current = { lat: currentCoords.lat, lng: currentCoords.lng };
    fetch(`/api/maps/reverse-geocode?lat=${currentCoords.lat}&lng=${currentCoords.lng}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.formattedAddress) {
          setResolvedAddress(data.formattedAddress);
        }
        if (data?.plusCode) {
          setResolvedPlusCode(data.plusCode);
        }
      })
      .catch(() => {});
  }, [currentCoords?.lat, currentCoords?.lng]);

  // Transmit coordinates to server in real time
  const sendRealtimeCoordinates = useCallback(
    async (coords: PhoneCoords, showSuccessToast = false) => {
      try {
        setIsTransmitting(true);
        const res = await fetch('/api/gps/realtime', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: user.email,
            userName: user.displayName || user.email.split('@')[0],
            cargo,
            latitude: coords.lat,
            longitude: coords.lng,
            accuracy: coords.accuracy,
            altitude: coords.altitude,
            speed: coords.speed,
            heading: coords.heading,
            notes: notesRef.current.trim() || resolvedAddress || undefined,
          }),
        });

        if (res.ok) {
          setLastTransmittedTime(new Date().toLocaleTimeString('es-PE'));
          setTransmissionCount((prev) => prev + 1);
          if (showSuccessToast) {
            setSaveSuccess('Coordenadas enviadas al servidor en tiempo real.');
            setTimeout(() => setSaveSuccess(null), 3500);
          }
        }
      } catch (err) {
        console.warn('Realtime sync heartbeat error:', err);
      } finally {
        setIsTransmitting(false);
      }
    },
    [cargo, user.displayName, user.email, resolvedAddress]
  );

  const parsePosition = (position: GeolocationPosition): PhoneCoords => ({
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: Math.round(position.coords.accuracy),
    altitude: position.coords.altitude !== null ? Math.round(position.coords.altitude) : undefined,
    speed: position.coords.speed !== null ? Math.round(position.coords.speed * 3.6) : undefined,
    heading:
      position.coords.heading !== null && !Number.isNaN(position.coords.heading)
        ? Math.round(position.coords.heading)
        : undefined,
    timestamp: new Date(position.timestamp).toISOString(),
  });

  const describeGeoError = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Permiso de ubicación denegado. Active "Ubicación / GPS" en su teléfono y permita el acceso en el candado del navegador.';
      case error.POSITION_UNAVAILABLE:
        return 'Señal GPS no disponible en este momento. Encienda el GPS de su celular y presione "Actualizar GPS".';
      case error.TIMEOUT:
        return 'Tiempo agotado buscando satélites. Presione "Actualizar GPS" o salga a cielo abierto.';
      default:
        return 'Error al contactar el sensor GPS del celular.';
    }
  };

  const capturePhoneLocation = useCallback(
    (centerMapAfter = true, openInGoogleMapsAfter = false) => {
      if (!navigator.geolocation) {
        setIsLocating(false);
        setGpsStatusMsg(null);
        setPermissionError('Su navegador o dispositivo no soporta geolocalización GPS.');
        return;
      }

      setIsLocating(true);
      setPermissionError(null);
      setActionError(null);
      setGpsStatusMsg('Localizando ubicación exacta de su celular...');

      const onGotPosition = (position: GeolocationPosition) => {
        const coords = parsePosition(position);
        setCurrentCoords(coords);
        setIsLocating(false);
        setGpsStatusMsg(null);
        setPermissionError(null);
        if (centerMapAfter) {
          setSelectedTarget(null);
          setRecenterSignal((s) => s + 1);
        }
        lastSendTimestampRef.current = Date.now();
        sendRealtimeCoordinates(coords);

        if (openInGoogleMapsAfter) {
          const url = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      };

      navigator.geolocation.getCurrentPosition(
        onGotPosition,
        (highAccError) => {
          if (highAccError.code === highAccError.PERMISSION_DENIED) {
            setIsLocating(false);
            setGpsStatusMsg(null);
            setPermissionError(describeGeoError(highAccError));
            return;
          }
          setGpsStatusMsg('Obteniendo ubicación por Wi-Fi / red celular...');
          navigator.geolocation.getCurrentPosition(
            onGotPosition,
            (fallbackError) => {
              setIsLocating(false);
              setGpsStatusMsg(null);
              setPermissionError(describeGeoError(fallbackError));
            },
            {
              enableHighAccuracy: false,
              timeout: 12000,
              maximumAge: 30000,
            }
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 7000,
          maximumAge: 5000,
        }
      );
    },
    [sendRealtimeCoordinates]
  );

  // Initial location capture & continuous live tracking
  useEffect(() => {
    capturePhoneLocation(true, false);
  }, [capturePhoneLocation]);

  useEffect(() => {
    if (!navigator.geolocation || !isLiveTracking) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newCoords = parsePosition(position);
        setCurrentCoords(newCoords);
        setIsLocating(false);
        setGpsStatusMsg(null);
        setPermissionError(null);

        const now = Date.now();
        if (now - lastSendTimestampRef.current >= 4000) {
          lastSendTimestampRef.current = now;
          sendRealtimeCoordinates(newCoords);
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setIsLocating(false);
          setGpsStatusMsg(null);
          setPermissionError(describeGeoError(error));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isLiveTracking, sendRealtimeCoordinates]);

  // Poll active field personnel
  const fetchTeamNow = useCallback(async () => {
    try {
      setIsRefreshingTeam(true);
      const res = await fetch('/api/gps/realtime');
      const data = await res.json();
      if (data && data.activePersonnel) {
        setTeamMembers(data.activePersonnel);
      }
    } catch {
      // ignore transient poll errors
    } finally {
      setIsRefreshingTeam(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamNow();
    const interval = setInterval(fetchTeamNow, 5000);
    return () => clearInterval(interval);
  }, [fetchTeamNow]);

  // Fetch saved landmarks
  useEffect(() => {
    fetch('/api/gps')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.locations) {
          setSavedRecords(data.locations);
        }
      })
      .catch(() => {});
  }, []);

  const handleCopyCoords = async () => {
    if (!currentCoords) {
      setActionError('Esperando ubicación del celular...');
      capturePhoneLocation(true, false);
      return;
    }
    const text = `${currentCoords.lat.toFixed(6)}, ${currentCoords.lng.toFixed(6)}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('Clipboard unavailable');
      }
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  const getWhatsappShareUrl = () => {
    if (!currentCoords) return '#';
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${currentCoords.lat},${currentCoords.lng}`;
    const text =
      `🛰️ *UBICACIÓN EN TIEMPO REAL - GEOCIENCES S.A.C.*\n` +
      `👷 *Cargo:* ${cargo}\n` +
      `👤 *Personal:* ${user.displayName || user.email}\n` +
      (resolvedAddress ? `🏘️ *Dirección:* ${resolvedAddress}\n` : '') +
      `📍 *Coordenadas:* ${currentCoords.lat.toFixed(6)}, ${currentCoords.lng.toFixed(6)}\n` +
      `🎯 *Precisión:* ±${currentCoords.accuracy} m\n` +
      (currentCoords.altitude !== undefined ? `🏔️ *Altitud:* ${currentCoords.altitude} msnm\n` : '') +
      `⏰ *Hora:* ${new Date().toLocaleTimeString('es-PE')}\n\n` +
      `🗺️ *Abrir en Google Maps:*\n${mapsUrl}` +
      (notes.trim() ? `\n\n📝 *Nota:* ${notes.trim()}` : '');

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const handleSaveLocation = async () => {
    if (!currentCoords) {
      setActionError('Esperando ubicación GPS del celular para guardar el hito.');
      capturePhoneLocation(true, false);
      return;
    }

    try {
      setActionError(null);
      const record: GpsLocationRecord = {
        id: `gps-${Date.now()}`,
        userId: user.uid,
        userEmail: user.email,
        cargo,
        latitude: currentCoords.lat,
        longitude: currentCoords.lng,
        accuracy: currentCoords.accuracy,
        altitude: currentCoords.altitude,
        speed: currentCoords.speed,
        timestamp: currentCoords.timestamp,
        notes: notes.trim() || resolvedAddress || undefined,
      };

      const res = await fetch('/api/gps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });

      if (!res.ok) throw new Error('Error al guardar en el servidor');

      setSavedRecords((prev) => [record, ...prev]);
      setSaveSuccess('Hito guardado y sincronizado en el mapa.');
      setNotes('');
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch {
      setActionError('No se pudo guardar el hito en el servidor. Intente de nuevo.');
    }
  };

  const handleForceTransmit = () => {
    if (!currentCoords) {
      capturePhoneLocation(true, false);
      return;
    }
    sendRealtimeCoordinates(currentCoords, true);
  };

  const handleRecenterPhone = () => {
    setSelectedTarget(null);
    if (currentCoords) {
      setRecenterSignal((s) => s + 1);
    } else {
      capturePhoneLocation(true, false);
    }
  };

  const handleSelectTarget = (target: MapTargetPoint) => {
    setSelectedTarget(target);
    setRecenterSignal((s) => s + 1);
  };

  const handleStartRoute = (target: MapTargetPoint) => {
    setSelectedTarget(target);
    if (!currentCoords) {
      setActionError('Capturando ubicación del celular para calcular la ruta...');
      capturePhoneLocation(false, false);
    }
    setRouteDestination(target);
  };

  const phoneGoogleMapsUrl = currentCoords
    ? `https://www.google.com/maps/search/?api=1&query=${currentCoords.lat},${currentCoords.lng}`
    : null;

  const routeDirectionsUrl =
    currentCoords && routeDestination
      ? `https://www.google.com/maps/dir/?api=1&origin=${currentCoords.lat},${currentCoords.lng}&destination=${routeDestination.lat},${routeDestination.lng}&travelmode=${
          travelMode === 'WALKING' ? 'walking' : 'driving'
        }`
      : phoneGoogleMapsUrl;

  const mapCenter = selectedTarget
    ? { lat: selectedTarget.lat, lng: selectedTarget.lng }
    : currentCoords
      ? { lat: currentCoords.lat, lng: currentCoords.lng }
      : null;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Compact Corporate Google Maps Top Bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 px-3 sm:px-5 py-2.5 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Volver al panel principal"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center text-white shadow-sm">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-stone-900 tracking-tight">
                    Google Maps
                  </span>
                  <span className="text-xs font-semibold text-stone-400">•</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 text-[#1a73e8] border border-blue-200">
                    {cargo}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 hidden sm:block">
                  GEOCIENCES S.A.C. • Navegación y Telemetría GPS en Vivo
                </p>
              </div>
            </div>
          </div>

          {/* Right Status + Open Native Google Maps */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLiveTracking((v) => !v)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                isLiveTracking
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
              title="Activar o pausar envío de coordenadas en tiempo real"
            >
              <span className="flex h-2 w-2 relative">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                    isLiveTracking ? 'bg-emerald-500 opacity-75' : 'bg-amber-500'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isLiveTracking ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}
                />
              </span>
              <span>{isLiveTracking ? 'EN VIVO' : 'PAUSADO'}</span>
            </button>

            {phoneGoogleMapsUrl ? (
              <a
                href={phoneGoogleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-[#1a73e8] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Abrir App Google Maps</span>
                <span className="sm:hidden">Abrir Maps</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => capturePhoneLocation(true, true)}
                className="px-4 py-2 rounded-full bg-[#1a73e8] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                <span>Ubicar Celular</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Split Workspace: Realistic Interactive Google Maps Canvas + Control Sheet */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT / TOP: REALISTIC GOOGLE MAPS VIEWPORT (8 cols on desktop) */}
        <section className="lg:col-span-8 flex flex-col gap-3">
          <div className="relative w-full h-[460px] sm:h-[540px] lg:h-[640px] rounded-3xl overflow-hidden shadow-xl border border-stone-200 bg-stone-200">
            {mapCenter ? (
              mapsApiKey && !useIframeFallback ? (
                <APIProvider
                  apiKey={mapsApiKey}
                  libraries={['marker', 'places', 'routes']}
                  language="es"
                  region="PE"
                >
                  <GoogleMap
                    mapId="DEMO_MAP_ID"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    defaultCenter={mapCenter}
                    defaultZoom={17}
                    mapTypeId={MAP_TYPE_TO_GOOGLE_ID[mapType]}
                    gestureHandling="greedy"
                    disableDefaultUI={true}
                    className="w-full h-full"
                  >
                    <MapCameraController
                      targetCenter={mapCenter}
                      recenterSignal={recenterSignal}
                      mapType={mapType}
                      showTraffic={showTraffic}
                    />

                    {/* Real Google Places Search Bar inside Map */}
                    <div className="absolute top-3 left-3 right-3 sm:right-auto z-20 flex flex-col gap-2 pointer-events-auto">
                      <PlacesSearchOverlay
                        phoneCoords={currentCoords}
                        onSelectPlace={(target) => {
                          handleSelectTarget(target);
                          setRouteDestination(null);
                        }}
                        onClearTarget={() => {
                          setSelectedTarget(null);
                          setRouteDestination(null);
                          setRouteSummary(null);
                          if (currentCoords) setRecenterSignal((s) => s + 1);
                        }}
                        hasActiveTarget={Boolean(selectedTarget || routeDestination)}
                      />
                    </div>

                    {/* Top-Right Realistic Google Maps Layer Pills */}
                    <div className="hidden sm:flex absolute top-3 right-3 z-20 items-center gap-1.5 pointer-events-auto">
                      <div className="bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-stone-200 p-1 flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => setMapType('roadmap')}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                            mapType === 'roadmap'
                              ? 'bg-[#1a73e8] text-white'
                              : 'text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          Mapa
                        </button>
                        <button
                          type="button"
                          onClick={() => setMapType('satellite')}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                            mapType === 'satellite'
                              ? 'bg-[#1a73e8] text-white'
                              : 'text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          Satélite
                        </button>
                        <button
                          type="button"
                          onClick={() => setMapType('terrain')}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                            mapType === 'terrain'
                              ? 'bg-[#1a73e8] text-white'
                              : 'text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          Relieve
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowTraffic((t) => !t)}
                        className={`px-3 py-2 rounded-full text-[11px] font-bold shadow-lg border transition-colors cursor-pointer flex items-center gap-1 ${
                          showTraffic
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-white/95 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                        title="Mostrar u ocultar tráfico en tiempo real"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>Tráfico</span>
                      </button>
                    </div>

                    {/* Bottom-Right Classic Google Maps FABs (+, -, My Location) */}
                    <div className="absolute bottom-20 sm:bottom-5 right-3 z-20 pointer-events-auto">
                      <MapZoomControls
                        onRecenterPhone={handleRecenterPhone}
                        isLocating={isLocating}
                      />
                    </div>

                    {/* Blue Pulsing Marker for Cell Phone */}
                    {currentCoords && (
                      <PhoneLocationMarker
                        coords={currentCoords}
                        cargo={cargo}
                        userName={user.displayName || user.email}
                        address={resolvedAddress}
                      />
                    )}

                    {/* Active Field Personnel Pins */}
                    {teamMembers
                      .filter((m) => m.userEmail.toLowerCase() !== user.email.toLowerCase())
                      .map((member, idx) => (
                        <TeamMemberMarker
                          key={`${member.userEmail}-${idx}`}
                          member={member}
                          onStartRoute={handleStartRoute}
                        />
                      ))}

                    {/* Inspected / Searched Target Pin */}
                    {selectedTarget && (
                      <TargetPlaceMarker
                        target={selectedTarget}
                        onStartRoute={handleStartRoute}
                      />
                    )}

                    {/* Active Route Polyline Calculation */}
                    {routeDestination && currentCoords && (
                      <RouteRenderer
                        origin={{ lat: currentCoords.lat, lng: currentCoords.lng }}
                        destination={routeDestination}
                        travelMode={travelMode}
                        onRouteResult={setRouteSummary}
                      />
                    )}
                  </GoogleMap>
                </APIProvider>
              ) : (
                /* Graceful Iframe Fallback if API key unavailable / quota hit */
                <>
                  <iframe
                    title="Google Maps GEOCIENCES S.A.C."
                    className="w-full h-full border-0"
                    src={`https://maps.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&hl=es&z=17&t=${
                      mapType === 'satellite' ? 'k' : mapType === 'terrain' ? 'p' : 'm'
                    }&output=embed`}
                    loading="lazy"
                    allowFullScreen
                  />
                  {/* Layer buttons on fallback */}
                  <div className="absolute top-3 right-3 z-20 bg-white/95 rounded-full shadow-lg border border-stone-200 p-1 flex items-center gap-0.5">
                    {(['roadmap', 'satellite', 'terrain'] as MapLayerType[]).map((layer) => (
                      <button
                        key={layer}
                        type="button"
                        onClick={() => setMapType(layer)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize cursor-pointer ${
                          mapType === layer ? 'bg-[#1a73e8] text-white' : 'text-stone-700'
                        }`}
                      >
                        {layer === 'roadmap' ? 'Mapa' : layer === 'satellite' ? 'Satélite' : 'Relieve'}
                      </button>
                    ))}
                  </div>
                </>
              )
            ) : (
              /* Waiting for Initial Cell Phone Geolocation */
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-stone-900 text-white">
                {isLocating ? (
                  <>
                    <div className="relative">
                      <span className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
                      <div className="w-16 h-16 rounded-full bg-[#1a73e8] flex items-center justify-center shadow-lg relative">
                        <LocateFixed className="w-8 h-8 text-white animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-base font-extrabold">
                        Obteniendo ubicación exacta de tu celular...
                      </p>
                      <p className="text-xs text-stone-400 max-w-md">
                        {gpsStatusMsg ||
                          'Concede permiso de ubicación para abrir Google Maps exactamente donde te encuentras.'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <MapPin className="w-12 h-12 text-red-500" />
                    <div className="space-y-2 max-w-md">
                      <p className="text-base font-bold">Permiso de GPS requerido</p>
                      <p className="text-xs text-stone-400">
                        {permissionError || 'Presiona el botón para localizar tu celular en Google Maps.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => capturePhoneLocation(true, false)}
                        className="px-6 py-2.5 rounded-full bg-[#1a73e8] hover:bg-blue-700 text-white text-xs font-extrabold uppercase shadow-lg cursor-pointer"
                      >
                        ACTIVAR UBICACIÓN DEL CELULAR
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mobile Layer Switcher Pill */}
            {mapCenter && (
              <div className="flex sm:hidden absolute top-16 left-3 z-20 bg-white/95 backdrop-blur-md rounded-full shadow-md border border-stone-200 p-1 items-center gap-0.5">
                {(['roadmap', 'satellite', 'terrain'] as MapLayerType[]).map((layer) => (
                  <button
                    key={layer}
                    type="button"
                    onClick={() => setMapType(layer)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer ${
                      mapType === layer ? 'bg-[#1a73e8] text-white' : 'text-stone-700'
                    }`}
                  >
                    {layer === 'roadmap' ? 'Mapa' : layer === 'satellite' ? 'Satélite' : 'Relieve'}
                  </button>
                ))}
              </div>
            )}

            {/* Bottom-Left Realistic Google Maps Floating Location / Route Card */}
            {currentCoords && !routeDestination && (
              <div className="absolute bottom-3 left-3 right-16 sm:right-auto sm:max-w-sm z-20 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-stone-200 p-3 text-stone-900 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#1a73e8] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#1a73e8] animate-pulse" />
                    Tu Ubicación Actual
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ±{currentCoords.accuracy}m
                  </span>
                </div>
                {resolvedAddress && (
                  <p className="text-xs font-bold text-stone-800 leading-snug line-clamp-2">
                    {resolvedAddress}
                  </p>
                )}
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-stone-600">
                  <span>
                    {currentCoords.lat.toFixed(6)}, {currentCoords.lng.toFixed(6)}
                  </span>
                  {resolvedPlusCode && (
                    <span className="text-[10px] text-stone-400 truncate">{resolvedPlusCode}</span>
                  )}
                </div>
              </div>
            )}

            {/* Floating Google Maps Route Summary Card (when routing to a target) */}
            {routeDestination && (
              <div className="absolute bottom-3 left-3 right-16 sm:right-auto sm:w-96 z-20 bg-white rounded-2xl shadow-2xl border border-stone-200 p-3.5 text-stone-900 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1a73e8] flex items-center gap-1">
                      <RouteIcon className="w-3.5 h-3.5" /> Ruta desde tu Celular
                    </span>
                    <h4 className="text-xs font-extrabold text-stone-900 truncate mt-0.5">
                      Hacia: {routeDestination.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRouteDestination(null);
                      setRouteSummary(null);
                    }}
                    className="p-1 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
                    title="Cerrar ruta"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  {/* Travel Mode Toggle */}
                  <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-full">
                    <button
                      type="button"
                      onClick={() => setTravelMode('DRIVING')}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                        travelMode === 'DRIVING' ? 'bg-white text-[#1a73e8] shadow-sm' : 'text-stone-600'
                      }`}
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>Auto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTravelMode('WALKING')}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                        travelMode === 'WALKING' ? 'bg-white text-[#1a73e8] shadow-sm' : 'text-stone-600'
                      }`}
                    >
                      <Footprints className="w-3.5 h-3.5" />
                      <span>A pie</span>
                    </button>
                  </div>

                  {routeSummary && (
                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-700">
                        {routeSummary.durationMin} min
                      </div>
                      <div className="text-[11px] font-mono text-stone-500">
                        {routeSummary.distanceKm} km{' '}
                        {routeSummary.isApproximate ? '(línea directa)' : ''}
                      </div>
                    </div>
                  )}
                </div>

                {routeDirectionsUrl && (
                  <a
                    href={routeDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-full bg-[#1a73e8] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Iniciar Navegación en Google Maps</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT / BOTTOM: REALISTIC GOOGLE MAPS CONTROL SHEET (4 cols on desktop) */}
        <aside className="lg:col-span-4 bg-white rounded-3xl shadow-xl border border-stone-200 flex flex-col overflow-hidden">
          {/* Sheet Tabs */}
          <div className="grid grid-cols-3 border-b border-stone-200 bg-stone-50 p-1.5 gap-1">
            <button
              type="button"
              onClick={() => setPanelTab('MI_CELULAR')}
              className={`py-2 px-2 rounded-2xl text-[11px] font-extrabold uppercase tracking-wide flex items-center justify-center gap-1 transition-all cursor-pointer ${
                panelTab === 'MI_CELULAR'
                  ? 'bg-white text-[#1a73e8] shadow-sm border border-stone-200'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <LocateFixed className="w-3.5 h-3.5" />
              <span>Mi Celular</span>
            </button>

            <button
              type="button"
              onClick={() => setPanelTab('EQUIPO')}
              className={`py-2 px-2 rounded-2xl text-[11px] font-extrabold uppercase tracking-wide flex items-center justify-center gap-1 transition-all cursor-pointer ${
                panelTab === 'EQUIPO'
                  ? 'bg-white text-[#1a73e8] shadow-sm border border-stone-200'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Equipo ({teamMembers.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setPanelTab('HITOS')}
              className={`py-2 px-2 rounded-2xl text-[11px] font-extrabold uppercase tracking-wide flex items-center justify-center gap-1 transition-all cursor-pointer ${
                panelTab === 'HITOS'
                  ? 'bg-white text-[#1a73e8] shadow-sm border border-stone-200'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Hitos ({savedRecords.length})</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[590px]">
            {panelTab === 'MI_CELULAR' && (
              <>
                {/* Refresh + Transmit Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Radio
                      className={`w-4 h-4 ${
                        isLiveTracking ? 'text-emerald-600 animate-pulse' : 'text-stone-400'
                      }`}
                    />
                    <span className="text-xs font-extrabold uppercase tracking-wide text-stone-800">
                      Telemetría en Tiempo Real
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => capturePhoneLocation(true, false)}
                    disabled={isLocating}
                    className="px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-[#1a73e8] text-[11px] font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>Actualizar GPS</span>
                  </button>
                </div>

                {/* Permission Error */}
                {permissionError && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-900">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Permiso de Ubicación</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">{permissionError}</p>
                    <button
                      type="button"
                      onClick={() => capturePhoneLocation(true, false)}
                      className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer"
                    >
                      Reintentar Ubicación
                    </button>
                  </div>
                )}

                {actionError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
                    {actionError}
                  </div>
                )}

                {/* Coordinates & Telemetry Cards */}
                {currentCoords ? (
                  <div className="space-y-3">
                    {resolvedAddress && (
                      <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-0.5">
                        <span className="text-[10px] font-bold uppercase text-[#1a73e8]">
                          Dirección Detectada
                        </span>
                        <p className="text-xs font-bold text-stone-800 leading-snug">
                          {resolvedAddress}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 font-mono">
                      <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                        <span className="text-[10px] font-sans uppercase text-stone-400 block">
                          Latitud
                        </span>
                        <strong className="text-sm font-extrabold text-stone-900">
                          {currentCoords.lat.toFixed(6)}°
                        </strong>
                      </div>
                      <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                        <span className="text-[10px] font-sans uppercase text-stone-400 block">
                          Longitud
                        </span>
                        <strong className="text-sm font-extrabold text-stone-900">
                          {currentCoords.lng.toFixed(6)}°
                        </strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center font-mono">
                      <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                        <span className="text-[9px] font-sans uppercase text-stone-400 block">
                          Altitud
                        </span>
                        <strong className="text-xs text-stone-800">
                          {currentCoords.altitude !== undefined ? `${currentCoords.altitude}m` : 'N/D'}
                        </strong>
                      </div>
                      <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                        <span className="text-[9px] font-sans uppercase text-stone-400 block">
                          Velocidad
                        </span>
                        <strong className="text-xs text-stone-800">
                          {currentCoords.speed !== undefined ? `${currentCoords.speed} km/h` : '0 km/h'}
                        </strong>
                      </div>
                      <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                        <span className="text-[9px] font-sans uppercase text-stone-400 block">
                          Precisión
                        </span>
                        <strong className="text-xs text-emerald-700">
                          ±{currentCoords.accuracy}m
                        </strong>
                      </div>
                    </div>

                    {/* Server Transmission Bar */}
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-[11px]">
                      <span className="flex items-center gap-1.5 text-stone-600 font-mono">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        {lastTransmittedTime ? `Sync: ${lastTransmittedTime}` : 'Conectando...'}
                      </span>
                      <button
                        type="button"
                        onClick={handleForceTransmit}
                        disabled={isTransmitting}
                        className="font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>{isTransmitting ? 'Enviando...' : `Enviar (${transmissionCount})`}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-2">
                    <Loader2 className="w-6 h-6 mx-auto text-[#1a73e8] animate-spin" />
                    <p className="text-xs font-semibold text-stone-600">
                      {gpsStatusMsg || 'Capturando señal GPS del celular...'}
                    </p>
                  </div>
                )}

                {/* Landmark Notes */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-stone-600 uppercase">
                    Anotación o Punto de Control:
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej. Frente Norte • Pozo DDH-24-10"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  {phoneGoogleMapsUrl ? (
                    <a
                      href={phoneGoogleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-full bg-[#1a73e8] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>ABRIR EN GOOGLE MAPS DEL CELULAR</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => capturePhoneLocation(true, true)}
                      className="w-full py-3 px-4 rounded-full bg-[#1a73e8] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <LocateFixed className="w-4 h-4" />
                      <span>IR A MI UBICACIÓN EN MAPS</span>
                    </button>
                  )}

                  {currentCoords ? (
                    <a
                      href={getWhatsappShareUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>MANDAR COORDENADAS POR WHATSAPP</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActionError('Obteniendo ubicación para enviar por WhatsApp...');
                        capturePhoneLocation(true, false);
                      }}
                      className="w-full py-3 px-4 rounded-full bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>MANDAR COORDENADAS POR WHATSAPP</span>
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleCopyCoords}
                      className="py-2.5 px-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-stone-200 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedSuccess ? '¡Copiadas!' : 'Copiar Lat/Lng'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveLocation}
                      className="py-2.5 px-3 rounded-full bg-stone-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar Hito</span>
                    </button>
                  </div>
                </div>

                {saveSuccess && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{saveSuccess}</span>
                  </div>
                )}
              </>
            )}

            {panelTab === 'EQUIPO' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-stone-700">
                    Personal Activo en Vivo
                  </span>
                  <button
                    type="button"
                    onClick={fetchTeamNow}
                    disabled={isRefreshingTeam}
                    className="px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshingTeam ? 'animate-spin' : ''}`} />
                    <span>Actualizar</span>
                  </button>
                </div>

                {teamMembers.map((member, idx) => (
                  <div
                    key={`${member.userEmail}-${idx}`}
                    className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase bg-blue-100 text-blue-800">
                          {member.cargo}
                        </span>
                        <h4 className="font-bold text-xs text-stone-900 mt-1">{member.userName}</h4>
                        <p className="text-[10px] font-mono text-stone-500">
                          {member.latitude.toFixed(5)}°, {member.longitude.toFixed(5)}° • ±
                          {member.accuracy}m
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400">
                        {new Date(member.timestamp).toLocaleTimeString('es-PE')}
                      </span>
                    </div>

                    {member.notes && (
                      <p className="text-[11px] text-stone-600 italic">"{member.notes}"</p>
                    )}

                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectTarget({
                            lat: member.latitude,
                            lng: member.longitude,
                            title: `${member.userName} (${member.cargo})`,
                            subtitle: member.notes,
                            kind: 'TEAM',
                          })
                        }
                        className="py-1.5 px-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Crosshair className="w-3 h-3 text-[#1a73e8]" />
                        <span>Ubicar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleStartRoute({
                            lat: member.latitude,
                            lng: member.longitude,
                            title: `${member.userName} (${member.cargo})`,
                            subtitle: member.notes,
                            kind: 'TEAM',
                          })
                        }
                        className="py-1.5 px-2 rounded-xl bg-[#1a73e8] hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <RouteIcon className="w-3 h-3" />
                        <span>Ruta</span>
                      </button>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${member.latitude},${member.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2 rounded-xl bg-stone-900 hover:bg-black text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Maps</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {panelTab === 'HITOS' && (
              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase text-stone-700 block">
                  Puntos Geodésicos Guardados
                </span>

                {savedRecords.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-500">
                    Aún no hay hitos guardados. Captura tu ubicación en "Mi Celular" y presiona
                    "Guardar Hito".
                  </div>
                ) : (
                  savedRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-black uppercase text-red-600">{rec.cargo}</span>
                        <span className="font-mono text-stone-400">
                          {new Date(rec.timestamp).toLocaleTimeString('es-PE')}
                        </span>
                      </div>
                      <div className="font-mono text-xs font-bold text-stone-900">
                        {rec.latitude.toFixed(6)}°, {rec.longitude.toFixed(6)}°
                      </div>
                      {rec.notes && <p className="text-[11px] text-stone-600">{rec.notes}</p>}

                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleSelectTarget({
                              lat: rec.latitude,
                              lng: rec.longitude,
                              title: rec.notes || `Hito ${rec.cargo}`,
                              kind: 'LANDMARK',
                            })
                          }
                          className="py-1.5 px-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Crosshair className="w-3 h-3 text-[#1a73e8]" />
                          <span>Ubicar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleStartRoute({
                              lat: rec.latitude,
                              lng: rec.longitude,
                              title: rec.notes || `Hito ${rec.cargo}`,
                              kind: 'LANDMARK',
                            })
                          }
                          className="py-1.5 px-2 rounded-xl bg-[#1a73e8] hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <RouteIcon className="w-3 h-3" />
                          <span>Ruta</span>
                        </button>

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${rec.latitude},${rec.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-2 rounded-xl bg-stone-900 hover:bg-black text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Maps</span>
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
};
