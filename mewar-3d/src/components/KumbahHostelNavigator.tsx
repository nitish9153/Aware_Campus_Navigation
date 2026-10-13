import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Compass,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Wrench,
  QrCode,
  MapPin,
  Accessibility,
  Footprints,
  Clock,
  ArrowLeft,
  Box,
  Volume2,
  VolumeX,
  Info,
  Languages
} from 'lucide-react';
import type {
  IndoorBuilding,
  IndoorRouteResult
} from '../types/indoor';
import { calculateIndoorRoute } from '../utils/indoorRouting';
import { KumbahHostel3DView } from './KumbahHostel3DView';

interface KumbahHostelNavigatorProps {
  isOpen: boolean;
  onClose: () => void;
  building: IndoorBuilding;
  initialRoomId?: string;
  initialFloorId?: string;
  wheelchairOnly: boolean;
  onToggleWheelchair: (val: boolean) => void;
  onOpenAdminEditor?: () => void;
  onSwitchToCampusMap?: () => void;
}

const BACKEND_API_BASE = 'http://127.0.0.1:8000';
const SAVED_ROOM_STORAGE_KEY = 'accesspath_saved_kumbah_room';
const SAVED_LANG_STORAGE_KEY = 'accesspath_kumbah_voice_lang';

// Helper to translate indoor step instructions to natural Hindi
function translateStepToHindi(instruction: string): string {
  let hi = instruction;

  // Common patterns
  if (hi.includes('Depart from Hostel Ground Floor Entrance') || hi.includes('Enter Kumbah Hostel via Hostel Ground Floor Entrance')) {
    return 'कुम्भा हॉस्टल भूतल मुख्य द्वार से यात्रा शुरू करें।';
  }
  if (hi.includes('Arrive at Room')) {
    const match = hi.match(/Room\s*(\d+|[A-Za-z0-9-]+)/i);
    const roomNum = match ? match[1] : '';
    return `भूतल पर अपने गंतव्य कमरा ${roomNum} के द्वार पर पहुंचें।`;
  }
  if (hi.includes('West Washroom')) {
    return 'गलियारे के पश्चिमी छोर पर स्थित वॉशरूम (शौचालय) द्वार पर पहुंचें।';
  }
  if (hi.includes('East Washroom')) {
    return 'गलियारे के पूर्वी छोर पर स्थित वॉशरूम (शौचालय) द्वार पर पहुंचें।';
  }
  if (hi.includes('Central Corridor Entrance Cross') || hi.includes('junction')) {
    return 'मुख्य प्रवेश से केंद्रीय गलियारे के चौराहे पर आगे बढ़ें।';
  }

  // Generic keyword replacements
  hi = hi
    .replace(/Follow corridor to/gi, 'गलियारे में आगे बढ़ते हुए')
    .replace(/proceed towards/gi, 'की ओर आगे बढ़ें')
    .replace(/Central Corridor/gi, 'केंद्रीय गलियारे')
    .replace(/West Corridor/gi, 'पश्चिमी गलियारे')
    .replace(/East Corridor/gi, 'पूर्वी गलियारे')
    .replace(/Rooms/gi, 'कमरे')
    .replace(/Room/gi, 'कमरा')
    .replace(/Door/gi, 'द्वार')
    .replace(/Entrance/gi, 'प्रवेश द्वार')
    .replace(/on Ground Floor/gi, 'भूतल पर')
    .replace(/meters|m\b/gi, 'मीटर')
    .replace(/waypoint/gi, 'मार्ग बिंदु');

  return hi;
}

export const KumbahHostelNavigator: React.FC<KumbahHostelNavigatorProps> = ({
  isOpen,
  onClose,
  building,
  initialRoomId,
  initialFloorId,
  wheelchairOnly,
  onToggleWheelchair,
  onOpenAdminEditor,
  onSwitchToCampusMap
}) => {
  // Current Active Floor (defaults to Ground Floor 'fl_kumba_0')
  const [currentFloorId, setCurrentFloorId] = useState<string>(() => {
    return initialFloorId || building.floors[0]?.id || 'fl_kumba_0';
  });

  // User's saved preferred room state
  const [savedRoomId, setSavedRoomId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SAVED_ROOM_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  // Default start point is 'entrance' (never assume user indoor location is known automatically)
  const [startPointId, setStartPointId] = useState<string>('entrance');

  // Destination room: use initialRoomId, or user's saved room. If none saved, default to '' to ask the user to select one!
  const [destRoomId, setDestRoomId] = useState<string>(() => {
    if (initialRoomId) return initialRoomId;
    try {
      const saved = localStorage.getItem(SAVED_ROOM_STORAGE_KEY);
      if (saved) return saved;
    } catch {}
    return ''; // Ask the user to select one!
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'plan' | '3d'>('plan');
  const [positioningMode, setPositioningMode] = useState<'map' | 'live'>('map');
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [qrNotification, setQrNotification] = useState<string | null>(null);
  const [customQrInput, setCustomQrInput] = useState<string>('');
  const [imageError, setImageError] = useState<boolean>(false);

  // Voice directions state
  const [voiceLang, setVoiceLang] = useState<'en' | 'hi'>(() => {
    try {
      return (localStorage.getItem(SAVED_LANG_STORAGE_KEY) as 'en' | 'hi') || 'en';
    } catch {
      return 'en';
    }
  });
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Deployment Status Modal
  const [showDeploymentModal, setShowDeploymentModal] = useState<boolean>(false);

  // 2D Pan and Zoom State
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sync user saved preferences with backend API on mount
  useEffect(() => {
    fetch(`${BACKEND_API_BASE}/api/mewar/preferences`)
      .then(res => res.json())
      .then(res => {
        if (res.success && res.preferences) {
          if (res.preferences.saved_kumbah_room_id && !savedRoomId) {
            setSavedRoomId(res.preferences.saved_kumbah_room_id);
            if (!destRoomId) {
              setDestRoomId(res.preferences.saved_kumbah_room_id);
            }
          }
          if (res.preferences.voice_language) {
            setVoiceLang(res.preferences.voice_language);
          }
        }
      })
      .catch(() => {
        // Backend offline; localStorage fallback already active
      });
  }, []);

  // Get current active floor object
  const currentFloor = useMemo(() => {
    return (
      building.floors.find(f => f.id === currentFloorId) ||
      building.floors[0]
    );
  }, [building, currentFloorId]);

  // Selected room object
  const selectedRoom = useMemo(() => {
    if (!currentFloor) return null;
    return currentFloor.rooms.find(r => r.id === destRoomId) || null;
  }, [currentFloor, destRoomId]);

  // Calculate Dijkstra Route
  const activeRoute: IndoorRouteResult = useMemo(() => {
    if (!destRoomId) {
      return {
        status: 'unverified',
        isVerified: false,
        message: 'No destination selected',
        buildingId: building.id,
        startFloorId: currentFloorId,
        destFloorId: currentFloorId,
        destRoom: null as any,
        totalIndoorDistanceMeters: 0,
        floorPaths: [],
        steps: [],
        isFullyAccessible: false,
        warnings: ['Select a room or facility to calculate indoor navigation route.']
      };
    }

    return calculateIndoorRoute(
      building,
      destRoomId,
      wheelchairOnly,
      startPointId
    );
  }, [building, destRoomId, wheelchairOnly, startPointId, currentFloorId]);

  // All rooms on the current floor for selection
  const allRoomsOnFloor = useMemo(() => {
    return currentFloor ? currentFloor.rooms : [];
  }, [currentFloor]);

  // Filtered rooms for search
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return allRoomsOnFloor;
    const q = searchQuery.toLowerCase().trim();
    return allRoomsOnFloor.filter(r =>
      r.roomNumber.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q)
    );
  }, [allRoomsOnFloor, searchQuery]);

  // Handle Pan Events for 2D Map
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleResetView = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // QR Checkpoint Resolver
  const resolveQrCode = (qrCode: string): { checkpointId: string; label: string } | null => {
    const code = qrCode.trim().toUpperCase();
    if (code === 'QR-KBH-ENT' || code.includes('ENTRANCE')) {
      return { checkpointId: 'entrance', label: 'Hostel Ground Floor Main Entrance' };
    }
    if (code === 'QR-KBH-WRW' || code.includes('WEST') || code.includes('WR-W')) {
      return { checkpointId: 'room_kumba_washroom_west', label: 'West Washroom (Left End)' };
    }
    if (code === 'QR-KBH-WRE' || code.includes('EAST') || code.includes('WR-E')) {
      return { checkpointId: 'room_kumba_washroom_east', label: 'East Washroom (Right End)' };
    }
    if (code === 'QR-KBH-JUN' || code.includes('JUNCTION')) {
      return { checkpointId: 'node_c_kumba_gf_junction', label: 'Central Corridor Cross Junction' };
    }

    // Match Room Number (e.g. QR-KBH-R04, QR-KBH-R12, or just "12")
    const match = code.match(/(\d+)/);
    if (match) {
      const roomNum = String(parseInt(match[1], 10));
      const foundRoom = allRoomsOnFloor.find(r => r.roomNumber === roomNum);
      if (foundRoom) {
        return { checkpointId: foundRoom.id, label: `Room ${foundRoom.roomNumber} Door Post` };
      }
    }
    return null;
  };

  // Simulate scanning a live QR checkpoint or BLE beacon
  const handleSimulateQrScan = (checkpointId: string, label: string) => {
    setStartPointId(checkpointId);
    setQrNotification(`✅ Physical QR Checkpoint Verified: "${label}". Position established.`);
    setTimeout(() => setQrNotification(null), 4000);
  };

  const handleApplyCustomQr = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customQrInput.trim()) return;
    const resolved = resolveQrCode(customQrInput);
    if (resolved) {
      handleSimulateQrScan(resolved.checkpointId, resolved.label);
      setCustomQrInput('');
    } else {
      setQrNotification(`⚠️ Unknown Checkpoint QR: "${customQrInput}". Available formats: QR-KBH-ENT, QR-KBH-R01 to R16, QR-KBH-WRW.`);
      setTimeout(() => setQrNotification(null), 4500);
    }
  };

  // Save Default Preferred Room Handler
  const handleToggleSaveDefault = (roomId: string) => {
    if (savedRoomId === roomId) {
      // Remove preference
      try {
        localStorage.removeItem(SAVED_ROOM_STORAGE_KEY);
      } catch {}
      setSavedRoomId(null);
      fetch(`${BACKEND_API_BASE}/api/mewar/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saved_kumbah_room_id: null })
      }).catch(() => {});
    } else {
      // Save preference
      try {
        localStorage.setItem(SAVED_ROOM_STORAGE_KEY, roomId);
      } catch {}
      setSavedRoomId(roomId);
      fetch(`${BACKEND_API_BASE}/api/mewar/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saved_kumbah_room_id: roomId })
      }).catch(() => {});
    }
  };

  // Save Language Preference
  const handleChangeVoiceLang = (lang: 'en' | 'hi') => {
    setVoiceLang(lang);
    try {
      localStorage.setItem(SAVED_LANG_STORAGE_KEY, lang);
    } catch {}
    fetch(`${BACKEND_API_BASE}/api/mewar/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voice_language: lang })
    }).catch(() => {});
  };

  // Voice Speech Synthesis Handler
  const handleSpeakDirections = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device/browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!activeRoute || activeRoute.status !== 'verified' || activeRoute.steps.length === 0) {
      return;
    }

    window.speechSynthesis.cancel();

    // Construct text according to selected language
    const phrases = activeRoute.steps.map(st => {
      if (voiceLang === 'hi') {
        return translateStepToHindi(st.instruction);
      }
      return st.instruction;
    });

    const fullSpeechText = phrases.join('. ');
    const utterance = new SpeechSynthesisUtterance(fullSpeechText);

    utterance.lang = voiceLang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    // Pick best available voice
    const voices = window.speechSynthesis.getVoices();
    if (voiceLang === 'hi') {
      const hindiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.includes('Hindi'));
      if (hindiVoice) utterance.voice = hindiVoice;
    } else {
      const engVoice = voices.find(v => v.lang.startsWith('en-IN') || v.lang.startsWith('en'));
      if (engVoice) utterance.voice = engVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Stop Speech on unmount or destination change
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [destRoomId]);

  if (!isOpen) return null;

  const currentFloorPath = activeRoute.floorPaths.find(fp => fp.floorId === currentFloor.id);

  return (
    <div
      className={`fixed z-50 transition-all duration-200 flex flex-col bg-slate-950/98 backdrop-blur-2xl text-slate-100 ${
        isFullScreen
          ? 'inset-0'
          : 'inset-2 sm:inset-4 md:inset-6 lg:inset-8 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden'
      }`}
    >
      {/* =================================================================== */}
      {/* 1. TOP HEADER & NAVIGATION BAR                                      */}
      {/* =================================================================== */}
      <header className="h-16 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 select-none">
        
        {/* Left Branding & Active Floor Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchToCampusMap || onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Return to Mewar Campus Map"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Campus Map</span>
          </button>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-cyan-500/20">
              KBH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-white tracking-wide">
                  Kumbah Hostel — Ground Floor
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-950 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                  Rooms 1–16
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-2">
                <span>Corridor Routing</span>
                <span>•</span>
                <span>Dual Washrooms</span>
                <span>•</span>
                <span className="text-cyan-400 font-bold">Bilingual Voice Guidance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right View & Tool Toggles */}
        <div className="flex items-center gap-2">
          
          {/* Floor Switcher if multiple floors */}
          {building.floors.length > 1 && (
            <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
              {building.floors.map(f => (
                <button
                  key={f.id}
                  onClick={() => setCurrentFloorId(f.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    currentFloor.id === f.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f.code || f.floorName}
                </button>
              ))}
            </div>
          )}

          {/* View Mode Toggle: 2D Plan View vs 3D Interactive View */}
          <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode('plan')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                viewMode === 'plan'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">2D Plan</span>
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                viewMode === '3d'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3D View</span>
            </button>
          </div>

          {/* System Capabilities & Deployment Modal Button */}
          <button
            onClick={() => setShowDeploymentModal(true)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 rounded-xl border border-slate-700 transition-colors"
            title="System Capabilities & Physical Deployment Status"
          >
            <Info className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Admin Floor Plan Editor Button */}
          {onOpenAdminEditor && (
            <button
              onClick={onOpenAdminEditor}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 rounded-xl border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              title="Calibrate Floor Dimensions & Node Network"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Admin Calibration</span>
            </button>
          )}

          {/* Wheelchair Accessible Toggle */}
          <button
            onClick={() => onToggleWheelchair(!wheelchairOnly)}
            className={`p-2 rounded-xl border transition-all ${
              wheelchairOnly
                ? 'bg-emerald-600 text-white border-emerald-400'
                : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
            }`}
            title="Toggle Step-Free Accessible Indoor Route"
          >
            <Accessibility className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullScreen(v => !v)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors hidden sm:block"
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-400 rounded-xl border border-slate-700 transition-colors"
            title="Close Indoor Navigator"
          >
            <X className="w-4 h-4" />
          </button>

        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. MAIN WORKSPACE CONTAINER (LEFT DRAWER + CENTER MAP)              */}
      {/* =================================================================== */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

        {/* ----------------------------------------------------------------- */}
        {/* LEFT PANEL: ROOM FINDER, DESTINATION & TURN GUIDANCE              */}
        {/* ----------------------------------------------------------------- */}
        <div className="w-full md:w-84 lg:w-96 bg-slate-900/95 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto max-h-[48vh] md:max-h-full">
          
          {/* Indoor Positioning Notice Banner */}
          <div className="p-3 bg-blue-950/40 border-b border-blue-900/50 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-300 leading-snug">
              <span className="font-bold text-cyan-300">Indoor Positioning Notice:</span> GPS satellite signals cannot penetrate indoor structures reliably. Select your starting checkpoint manually or scan a verified door QR tag.
            </div>
          </div>

          {/* Positioning Mode Switcher */}
          <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Starting Point Mode:
            </span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setPositioningMode('map')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  positioningMode === 'map'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📍 Map Picker
              </button>
              <button
                onClick={() => setPositioningMode('live')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  positioningMode === 'live'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📱 QR Checkpoint
              </button>
            </div>
          </div>

          {/* QR Checkpoint Scanner & Simulator in Live Mode */}
          {positioningMode === 'live' && (
            <div className="p-3 bg-cyan-950/30 border-b border-cyan-800/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-cyan-400" /> Door & Corridor QR Checkpoints
                </span>
                <span className="text-[10px] text-cyan-400 font-semibold">Verified Snapping</span>
              </div>

              {/* Custom QR Code Input */}
              <form onSubmit={handleApplyCustomQr} className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Enter or scan QR (e.g. QR-KBH-R12)..."
                  value={customQrInput}
                  onChange={e => setCustomQrInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-cyan-700/60 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-xl text-xs font-black shadow-sm"
                >
                  Apply
                </button>
              </form>

              {/* Quick Checkpoint Taps */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleSimulateQrScan('entrance', 'Main Entrance QR [QR-KBH-ENT]')}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-semibold text-slate-200 text-left border border-slate-700"
                >
                  🚪 Main Entrance
                </button>
                <button
                  onClick={() => handleSimulateQrScan('room_kumba_4', 'Room 4 Door Post [QR-KBH-R04]')}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-semibold text-slate-200 text-left border border-slate-700"
                >
                  🚪 Room 4 Door
                </button>
                <button
                  onClick={() => handleSimulateQrScan('room_kumba_8', 'Room 8 Corridor Post [QR-KBH-R08]')}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-semibold text-slate-200 text-left border border-slate-700"
                >
                  🚪 Room 8 Door
                </button>
                <button
                  onClick={() => handleSimulateQrScan('room_kumba_12', 'Room 12 Door Post [QR-KBH-R12]')}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-semibold text-slate-200 text-left border border-slate-700"
                >
                  🚪 Room 12 Door
                </button>
              </div>

              {qrNotification && (
                <div className="text-[11px] font-bold text-emerald-300 bg-emerald-950/90 p-2 rounded-xl border border-emerald-500/50 animate-in fade-in">
                  {qrNotification}
                </div>
              )}
            </div>
          )}

          {/* Origin Starting Point Dropdown */}
          <div className="p-3 border-b border-slate-800 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Start Location:
            </label>
            <select
              value={startPointId}
              onChange={e => setStartPointId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="entrance">⬇ Hostel Ground Floor Entrance</option>
              <option value="room_kumba_washroom_west">🚽 West Washroom (Left End)</option>
              <option value="room_kumba_washroom_east">🚽 East Washroom (Right End)</option>
              <optgroup label="Top Row Rooms (Odd)">
                {allRoomsOnFloor.filter(r => ['1','3','5','7','9','11','13','15'].includes(r.roomNumber)).map(r => (
                  <option key={r.id} value={r.id}>Door: Room {r.roomNumber}</option>
                ))}
              </optgroup>
              <optgroup label="Bottom Row Rooms (Even)">
                {allRoomsOnFloor.filter(r => ['2','4','6','8','10','12','14','16'].includes(r.roomNumber)).map(r => (
                  <option key={r.id} value={r.id}>Door: Room {r.roomNumber}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Destination Room Search & Dropdown */}
          <div className="p-3 border-b border-slate-800 space-y-2">
            <label className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" /> Destination Room / Facility:
              </span>
              <span className="text-[10px] text-cyan-400 font-extrabold">Rooms 1–16</span>
            </label>

            {/* Search Input Field */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Room 1–16 or Washroom..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Destination Dropdown */}
            <select
              value={destRoomId}
              onChange={e => setDestRoomId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="">-- Choose destination room or facility --</option>
              <option value="entrance">Hostel Ground Floor Entrance</option>
              <optgroup label="Ground Floor Rooms">
                {filteredRooms.map(r => (
                  <option key={r.id} value={r.id}>
                    Room {r.roomNumber} — {r.name} {savedRoomId === r.id ? '⭐ (Default)' : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Facilities">
                <option value="room_kumba_washroom_west">West Washroom (Left End)</option>
                <option value="room_kumba_washroom_east">East Washroom (Right End)</option>
              </optgroup>
            </select>
          </div>

          {/* Quick Room Selection Pills (Rooms 1–16 + WR + Ent) */}
          <div className="p-3 border-b border-slate-800 space-y-1.5">
            <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
              Quick Room Select:
            </div>
            {/* Top Row Odd Rooms */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] font-bold text-slate-400 shrink-0 w-8">Top:</span>
              {[1, 3, 5, 7, 9, 11, 13, 15].map(num => {
                const r = allRoomsOnFloor.find(room => room.roomNumber === String(num));
                const isSelected = selectedRoom?.roomNumber === String(num);
                const isSaved = savedRoomId === r?.id;
                return (
                  <button
                    key={num}
                    onClick={() => r && setDestRoomId(r.id)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold shrink-0 transition-all relative ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {num}
                    {isSaved && <span className="absolute -top-1 -right-1 text-[8px]">⭐</span>}
                  </button>
                );
              })}
            </div>
            {/* Bottom Row Even Rooms */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] font-bold text-slate-400 shrink-0 w-8">Btm:</span>
              {[2, 4, 6, 8, 10, 12, 14, 16].map(num => {
                const r = allRoomsOnFloor.find(room => room.roomNumber === String(num));
                const isSelected = selectedRoom?.roomNumber === String(num);
                const isSaved = savedRoomId === r?.id;
                return (
                  <button
                    key={num}
                    onClick={() => r && setDestRoomId(r.id)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold shrink-0 transition-all relative ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {num}
                    {isSaved && <span className="absolute -top-1 -right-1 text-[8px]">⭐</span>}
                  </button>
                );
              })}
            </div>
            {/* Washrooms & Entrance Chips */}
            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={() => setDestRoomId('room_kumba_washroom_west')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                  destRoomId === 'room_kumba_washroom_west'
                    ? 'bg-blue-600 text-white border-blue-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                🚽 West Washroom
              </button>
              <button
                onClick={() => setDestRoomId('room_kumba_washroom_east')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                  destRoomId === 'room_kumba_washroom_east'
                    ? 'bg-blue-600 text-white border-blue-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                🚽 East Washroom
              </button>
              <button
                onClick={() => setDestRoomId('entrance')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                  destRoomId === 'entrance'
                    ? 'bg-blue-600 text-white border-blue-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                🚪 Entrance
              </button>
            </div>
          </div>

          {/* Destination Card & Route Summary */}
          <div className="p-4 flex-1 space-y-3">
            {selectedRoom || destRoomId === 'entrance' ? (
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black text-sm">
                      📍
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">
                        {destRoomId === 'entrance' ? 'Hostel Main Entrance' : selectedRoom?.name}
                      </div>
                      <div className="text-[10px] text-cyan-400 font-bold">
                        Ground Floor • {destRoomId === 'entrance' ? 'North Portico' : `Room #${selectedRoom?.roomNumber}`}
                      </div>
                    </div>
                  </div>

                  {activeRoute.status === 'verified' && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified Route
                    </span>
                  )}
                </div>

                {/* Distance & Walking Time Stats */}
                {activeRoute.status === 'verified' && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-850">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                      <Footprints className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{activeRoute.totalIndoorDistanceMeters} meters</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>~{Math.max(10, Math.round(activeRoute.totalIndoorDistanceMeters * 1.4))} sec</span>
                    </div>
                  </div>
                )}

                {/* Voice Directions Player (English & Hindi) */}
                {activeRoute.status === 'verified' && activeRoute.steps.length > 0 && (
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-cyan-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-white flex items-center gap-1.5">
                        <Languages className="w-3.5 h-3.5 text-cyan-400" /> Voice Directions
                      </span>

                      {/* Language Toggle: English vs Hindi */}
                      <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                        <button
                          onClick={() => handleChangeVoiceLang('en')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                            voiceLang === 'en'
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          EN
                        </button>
                        <button
                          onClick={() => handleChangeVoiceLang('hi')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                            voiceLang === 'hi'
                              ? 'bg-cyan-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          हिन्दी
                        </button>
                      </div>
                    </div>

                    {/* Audio Playback Button */}
                    <button
                      onClick={handleSpeakDirections}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md ${
                        isSpeaking
                          ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950'
                      }`}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-4 h-4" />
                          <span>Stop Voice Directions (बोलना बंद करें)</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          <span>
                            {voiceLang === 'hi'
                              ? 'बोलकर सुनें (Play Hindi Guidance)'
                              : 'Play Voice Directions (English)'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Turn-by-Turn Guidance Steps */}
                {activeRoute.status === 'verified' && activeRoute.steps.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      Turn-by-Turn Corridor Guidance:
                    </div>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {activeRoute.steps.map((st, idx) => {
                        const displayText = voiceLang === 'hi' ? translateStepToHindi(st.instruction) : st.instruction;
                        return (
                          <div
                            key={idx}
                            className="flex items-start gap-2 p-1.5 bg-slate-900 rounded-lg text-[11px] text-slate-200 border border-slate-800"
                          >
                            <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5 border border-cyan-800">
                              {idx + 1}
                            </span>
                            <span className="leading-tight">{displayText}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Route Needs Verification Warning if Disconnected */}
                {activeRoute.status === 'unverified' && (
                  <div className="p-2.5 bg-amber-950/50 rounded-xl border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Route needs verification</div>
                      <div className="text-[11px] text-amber-300/80">
                        {activeRoute.message || 'No verified walkable corridor network connects this starting point to the destination room.'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Save as Default Destination Room Button */}
                {selectedRoom && (
                  <button
                    onClick={() => handleToggleSaveDefault(selectedRoom.id)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shadow-sm ${
                      savedRoomId === selectedRoom.id
                        ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                        : 'bg-slate-900 hover:bg-slate-850 border-slate-750 text-slate-300 hover:text-white'
                    }`}
                  >
                    {savedRoomId === selectedRoom.id ? (
                      <>
                        <span>⭐</span>
                        <span>Saved as Your Default Destination Room</span>
                      </>
                    ) : (
                      <>
                        <span>☆</span>
                        <span>Save Room {selectedRoom.roomNumber} as My Default Destination</span>
                      </>
                    )}
                  </button>
                )}

                {/* Action Buttons: Clear Route & Show Route */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleResetView()}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all text-center"
                  >
                    Center View
                  </button>
                  <button
                    onClick={() => {
                      setDestRoomId('');
                      setSearchQuery('');
                    }}
                    className="py-2 px-3 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Clear Route
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-950/90 rounded-2xl border border-dashed border-cyan-500/40 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto text-lg shadow-inner">
                  🎯
                </div>
                <div>
                  <div className="text-xs font-black text-white">Select Destination Room</div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    No default room is currently saved. Please select a room (Rooms 1–16) or facility above, or click on the floor map to display your navigation route.
                  </p>
                </div>
                <div className="text-[10px] text-cyan-300 font-semibold bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  Tip: You can click "Save as My Default Destination" once selected to automatically load it next time.
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ----------------------------------------------------------------- */}
        {/* CENTER VIEW: 2D FLOOR PLAN OR THREE.JS 3D VIEW                    */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center select-none">
          
          {/* Conditional Rendering: 2D Plan View vs 3D View */}
          {viewMode === '3d' ? (
            <KumbahHostel3DView
              floor={currentFloor}
              selectedRoom={selectedRoom}
              onSelectRoom={room => setDestRoomId(room.id)}
              activeRoute={activeRoute}
              startPointId={startPointId}
            />
          ) : (
            /* 2D Plan View using Reference Layout Image */
            <div
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`w-full h-full flex items-center justify-center overflow-hidden ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              <div
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out'
                }}
                className="relative w-[960px] h-[640px] max-w-full max-h-full bg-slate-900 rounded-2xl border-4 border-slate-800 shadow-2xl overflow-hidden shrink-0"
              >
                {/* 1. Kumbah Ground Floor Reference Image */}
                {imageError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/95 text-red-200 border-2 border-red-500/50 rounded-2xl m-4 z-20 shadow-2xl">
                    <AlertTriangle className="w-12 h-12 text-red-400 mb-3 animate-bounce" />
                    <h3 className="text-base font-extrabold text-white mb-1">
                      Floor Plan Image File Missing
                    </h3>
                    <p className="text-xs text-red-300 max-w-md leading-relaxed mb-4">
                      Could not load floor layout image from <code className="bg-red-950 px-2 py-0.5 rounded text-amber-200">public/maps/kumbah-ground-floor.png</code>.
                      Please verify that the floor plan image file is located at that path.
                    </p>
                    <button
                      onClick={() => setImageError(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors"
                    >
                      Retry Loading Image
                    </button>
                  </div>
                ) : (
                  <img
                    src={currentFloor.floorPlanImageUrl || '/maps/kumbah-ground-floor.png'}
                    alt="Kumbah Hostel Ground Floor Layout"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-95 select-none"
                    onError={() => setImageError(true)}
                  />
                )}

                {/* 2. SVG Interactive Overlay Layer (Corridors, Doors, Rooms) */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {/* Walkable Corridor Network Edges */}
                  <g opacity="0.75">
                    {currentFloor.corridorEdges.map(edge => {
                      const src = currentFloor.corridorNodes.find(n => n.id === edge.source);
                      const tgt = currentFloor.corridorNodes.find(n => n.id === edge.target);
                      if (!src || !tgt) return null;
                      return (
                        <line
                          key={edge.id}
                          x1={src.x}
                          y1={src.y}
                          x2={tgt.x}
                          y2={tgt.y}
                          stroke="#0284c7"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                        />
                      );
                    })}
                  </g>

                  {/* Active Verified Dijkstra Route Polyline */}
                  {currentFloorPath && currentFloorPath.coordinates.length >= 2 && (
                    <g>
                      {/* Glow Casing */}
                      <polyline
                        points={currentFloorPath.coordinates.map(pt => `${pt[0]},${pt[1]}`).join(' ')}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="5"
                        strokeOpacity="0.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Bright Neon Polyline */}
                      <polyline
                        points={currentFloorPath.coordinates.map(pt => `${pt[0]},${pt[1]}`).join(' ')}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="3.2"
                        strokeOpacity="0.95"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Animated Dashes */}
                      <polyline
                        points={currentFloorPath.coordinates.map(pt => `${pt[0]},${pt[1]}`).join(' ')}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1.4"
                        strokeDasharray="2, 2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  )}

                  {/* Corridor Spine Waypoint Dots */}
                  {currentFloor.corridorNodes.map(node => (
                    <circle
                      key={node.id}
                      cx={node.x}
                      cy={node.y}
                      r="1.2"
                      fill={node.type === 'entrance' ? '#10b981' : '#38bdf8'}
                      stroke="#ffffff"
                      strokeWidth="0.5"
                    />
                  ))}

                  {/* Clickable Room Hotspot Regions & Doors */}
                  {currentFloor.rooms.map(room => {
                    const isSelected = selectedRoom?.id === room.id;
                    const isSavedDefault = savedRoomId === room.id;
                    return (
                      <g
                        key={room.id}
                        onClick={e => {
                          e.stopPropagation();
                          setDestRoomId(room.id);
                        }}
                        className="cursor-pointer group"
                      >
                        {/* Interactive Click Hotspot Area */}
                        <rect
                          x={room.x - room.width / 2}
                          y={room.y - room.height / 2}
                          width={room.width}
                          height={room.height}
                          fill={isSelected ? '#0284c7' : '#38bdf8'}
                          fillOpacity={isSelected ? 0.32 : 0.0}
                          stroke={isSelected ? '#38bdf8' : 'transparent'}
                          strokeWidth={isSelected ? '1.8' : '0.8'}
                          rx="1.5"
                          className="transition-all hover:fill-opacity-15 hover:stroke-cyan-400/50"
                        />

                        {/* Selected Room Highlight Outline & Glow */}
                        {isSelected && (
                          <rect
                            x={room.x - room.width / 2 - 0.5}
                            y={room.y - room.height / 2 - 0.5}
                            width={room.width + 1}
                            height={room.height + 1}
                            fill="none"
                            stroke="#06b6d4"
                            strokeWidth="1.2"
                            strokeDasharray="2, 1"
                            rx="2"
                            className="animate-pulse"
                          />
                        )}

                        {/* Saved Default Star Indicator */}
                        {isSavedDefault && (
                          <g transform={`translate(${room.x - room.width / 2 + 1.2}, ${room.y - room.height / 2 + 2.4})`}>
                            <text x="0" y="0" fontSize="2.8" fill="#fbbf24" stroke="#0f172a" strokeWidth="0.4">
                              ⭐
                            </text>
                          </g>
                        )}

                        {/* Door Marker */}
                        {room.doorLocation && (
                          <g>
                            <circle
                              cx={room.doorLocation.x}
                              cy={room.doorLocation.y}
                              r={isSelected ? '2.0' : '1.2'}
                              fill={isSelected ? '#ef4444' : '#10b981'}
                              stroke="#ffffff"
                              strokeWidth="0.5"
                              className={isSelected ? 'animate-ping' : ''}
                            />
                            <circle
                              cx={room.doorLocation.x}
                              cy={room.doorLocation.y}
                              r={isSelected ? '1.6' : '1.0'}
                              fill={isSelected ? '#ef4444' : '#10b981'}
                              stroke="#ffffff"
                              strokeWidth="0.5"
                            />
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Main Entrance Marker Badge */}
                  {(() => {
                    const entNode = currentFloor.corridorNodes.find(n => n.type === 'entrance');
                    if (!entNode) return null;
                    return (
                      <g
                        onClick={() => setDestRoomId('entrance')}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={entNode.x}
                          cy={entNode.y}
                          r="2.4"
                          fill="#10b981"
                          stroke="#ffffff"
                          strokeWidth="0.8"
                        />
                        <text
                          x={entNode.x}
                          y={entNode.y - 3.5}
                          textAnchor="middle"
                          fill="#10b981"
                          fontSize="2.6"
                          fontWeight="900"
                          stroke="#090d16"
                          strokeWidth="0.8"
                          paintOrder="stroke"
                        >
                          ⬇ ENTRANCE
                        </text>
                      </g>
                    );
                  })()}

                  {/* Destination Marker Pulse Pin */}
                  {selectedRoom && selectedRoom.doorLocation && (
                    <g transform={`translate(${selectedRoom.doorLocation.x}, ${selectedRoom.doorLocation.y - 3.5})`}>
                      <circle cx="0" cy="0" r="2.2" fill="#ef4444" stroke="#ffffff" strokeWidth="0.6" />
                      <text x="0" y="0.8" textAnchor="middle" fill="#ffffff" fontSize="1.8" fontWeight="bold">
                        ★
                      </text>
                    </g>
                  )}
                </svg>
              </div>
            </div>
          )}

          {/* 2D Zoom & Pan Controls Floating in Corner */}
          {viewMode === 'plan' && (
            <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
              <button
                onClick={() => setZoomScale(s => Math.min(s + 0.3, 3.5))}
                className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl border border-slate-700 shadow-xl backdrop-blur transition-all"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4 text-cyan-400" />
              </button>
              <button
                onClick={() => setZoomScale(s => Math.max(s - 0.3, 0.6))}
                className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl border border-slate-700 shadow-xl backdrop-blur transition-all"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 text-cyan-400" />
              </button>
              <button
                onClick={handleResetView}
                className="p-2.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl border border-slate-700 shadow-xl backdrop-blur transition-all"
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4 text-blue-400" />
              </button>
            </div>
          )}

          {/* Reference Layout Disclaimer Badge */}
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 backdrop-blur pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Kumbah Ground Floor Reference Plan • Calibrated Corridor Graph</span>
          </div>

        </div>

      </div>

      {/* =================================================================== */}
      {/* 3. SYSTEM CAPABILITIES & DEPLOYMENT STATUS MODAL                     */}
      {/* =================================================================== */}
      {showDeploymentModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
                  ℹ️
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">System Capabilities & Deployment Status</h3>
                  <p className="text-[11px] text-slate-400">AccessPath Indoor Navigation Architecture</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeploymentModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Active Working Software Features */}
            <div className="space-y-2">
              <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Working Software Features (Active Now)
              </span>
              <ul className="text-xs text-slate-300 space-y-1.5 pl-5 list-disc">
                <li><strong className="text-white">High-Resolution Reference Floor Plan:</strong> Original 3D layout displayed directly with non-destructive overlays.</li>
                <li><strong className="text-white">Three.js Interactive 3D Room Model:</strong> 3D architectural rooms, floating placards, 3D route ribbon, and orbiting camera.</li>
                <li><strong className="text-white">Corridor-Based Dijkstra Navigation:</strong> Walkable corridor graph traversing doorways without wall crossings.</li>
                <li><strong className="text-white">Bilingual Voice Guidance:</strong> Real-time text-to-speech directions in English and Hindi.</li>
                <li><strong className="text-white">User Preference Persistence:</strong> Default saved destination room stored in browser and FastAPI backend.</li>
                <li><strong className="text-white">Admin Calibration Editor:</strong> Interactive editing of room coordinates, doors, and corridor networks.</li>
              </ul>
            </div>

            {/* Requires Physical Installation */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Requires Physical Installation / On-Site Deployment
              </span>
              <ul className="text-xs text-slate-300 space-y-1.5 pl-5 list-disc">
                <li><strong className="text-white">Printed QR Checkpoint Stickers:</strong> Real-world QR tags mounted on physical room doorframes and corridor checkpoints.</li>
                <li><strong className="text-white">Bluetooth Beacons (BLE) / UWB:</strong> Required if automatic continuous hands-free indoor tracking is desired without scanning checkpoints.</li>
              </ul>
            </div>

            {/* Measurement Calibration */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4" /> Measurement Calibration
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Coordinates and corridor segment lengths are provisional approximations calibrated against the isometric 3D floor plan. When official laser or CAD architectural blueprints are available, exact measurements can be updated instantly using the <strong>Admin Calibration</strong> editor.
              </p>
            </div>

            <button
              onClick={() => setShowDeploymentModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all"
            >
              Understood
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
