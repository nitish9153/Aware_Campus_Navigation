/**
 * OpenStreetMap & Campus Walking Routing Service
 * Decoupled from map-rendering components.
 * 
 * Supports:
 * 1. OSRM Foot Routing (public or custom endpoint)
 * 2. Verified Campus Walkway Network (Dijkstra graph for internal campus paths, ramps, and doors)
 * 3. Graceful fallback on network errors or unmapped segments
 * 4. Explicit error handling: Never draws straight lines through buildings when no route exists
 */

import {
  type GeoLocation,
  GEO_PATH_NODES,
  type GeoPathNode
} from '../data/mewarGeoData';
import { calculateGeoRoute, type GeoRouteResult } from '../utils/dijkstraGeo';

export interface RoutingStep {
  stepNumber: number;
  instruction: string;
  distanceMeters: number;
  distanceText: string;
  isAccessible: boolean;
}

export interface RoutingResult {
  success: boolean;
  coordinates: [number, number][]; // [lat, lng][] along valid paths
  distanceMeters: number;
  distanceText: string;
  durationMinutes: number;
  durationText: string;
  steps: RoutingStep[];
  source: 'osrm' | 'verified_walkways';
  sourceLabel: string;
  isStepFree: boolean;
  notice?: string;
  errorMessage?: string;
}

const DEFAULT_OSRM_ENDPOINT = (import.meta as any).env?.VITE_OSRM_ROUTING_URL || 'https://router.project-osrm.org';

/**
 * Format meters to human readable string (e.g. "320 m" or "1.2 km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format minutes to human readable string (e.g. "4 min")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 1) return '< 1 min';
  return `${Math.round(minutes)} min`;
}

/**
 * Find the closest campus walkway node to a given lat/lng
 */
function findClosestCampusNode(lat: number, lng: number): GeoPathNode | null {
  if (!GEO_PATH_NODES || GEO_PATH_NODES.length === 0) return null;

  let closest: GeoPathNode | null = null;
  let minDistanceSq = Infinity;

  for (const node of GEO_PATH_NODES) {
    const dLat = node.lat - lat;
    const dLng = node.lng - lng;
    const distSq = (dLat * dLat) + (dLng * dLng);
    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      closest = node;
    }
  }

  return closest;
}

/**
 * Query public OSRM foot routing endpoint with a timeout
 */
async function queryOsrmFootRoute(
  startLat: number,
  startLng: number,
  destLat: number,
  destLng: number,
  timeoutMs = 4000
): Promise<RoutingResult | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${DEFAULT_OSRM_ENDPOINT}/route/v1/foot/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      return null;
    }

    const route = data.routes[0];
    const rawCoords = route.geometry?.coordinates as [number, number][]; // [lng, lat]
    if (!rawCoords || rawCoords.length < 2) {
      return null;
    }

    // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
    const leafletCoords: [number, number][] = rawCoords.map(([lng, lat]) => [lat, lng]);

    const distanceMeters = Math.round(route.distance || 0);
    const durationMinutes = Math.max(1, Math.round((route.duration || (distanceMeters / 1.3)) / 60));

    // Parse OSRM steps
    const steps: RoutingStep[] = [];
    if (route.legs && route.legs[0]?.steps) {
      route.legs[0].steps.forEach((s: any, idx: number) => {
        const stepDist = Math.round(s.distance || 0);
        if (stepDist > 0 || idx === 0) {
          const maneuverType = s.maneuver?.type || 'continue';
          const modifier = s.maneuver?.modifier ? ` ${s.maneuver.modifier}` : '';
          const name = s.name ? ` onto ${s.name}` : '';
          const instruction = s.maneuver?.instruction || `${maneuverType}${modifier}${name}`;

          steps.push({
            stepNumber: idx + 1,
            instruction: instruction.charAt(0).toUpperCase() + instruction.slice(1),
            distanceMeters: stepDist,
            distanceText: formatDistance(stepDist),
            isAccessible: true
          });
        }
      });
    }

    if (steps.length === 0) {
      steps.push({
        stepNumber: 1,
        instruction: 'Follow public pedestrian path to destination',
        distanceMeters,
        distanceText: formatDistance(distanceMeters),
        isAccessible: true
      });
    }

    return {
      success: true,
      coordinates: leafletCoords,
      distanceMeters,
      distanceText: formatDistance(distanceMeters),
      durationMinutes,
      durationText: formatDuration(durationMinutes),
      steps,
      source: 'osrm',
      sourceLabel: 'OpenStreetMap (OSRM)',
      isStepFree: false,
      notice: 'Walking route calculated via OpenStreetMap foot-routing service.'
    };
  } catch (_e) {
    clearTimeout(timeoutId);
    return null; // Gracefully fallback to verified campus network
  }
}

/**
 * Calculate walking route using Verified Campus Walkway Network (Dijkstra)
 */
function queryVerifiedCampusRoute(
  start: GeoLocation,
  dest: GeoLocation,
  wheelchairOnly: boolean
): RoutingResult {
  const startNodeId = start.entranceNodeId || findClosestCampusNode(start.lat, start.lng)?.id;
  const destNodeId = dest.entranceNodeId || findClosestCampusNode(dest.lat, dest.lng)?.id;

  if (!startNodeId || !destNodeId) {
    return {
      success: false,
      coordinates: [],
      distanceMeters: 0,
      distanceText: '0 m',
      durationMinutes: 0,
      durationText: '0 min',
      steps: [],
      source: 'verified_walkways',
      sourceLabel: 'Verified Campus Walkway Network',
      isStepFree: wheelchairOnly,
      errorMessage: 'Could not locate campus entrance nodes for one or both locations.'
    };
  }

  const dijkstraResult: GeoRouteResult | null = calculateGeoRoute(
    startNodeId,
    destNodeId,
    wheelchairOnly
  );

  if (!dijkstraResult || dijkstraResult.coordinates.length === 0) {
    return {
      success: false,
      coordinates: [],
      distanceMeters: 0,
      distanceText: '0 m',
      durationMinutes: 0,
      durationText: '0 min',
      steps: [],
      source: 'verified_walkways',
      sourceLabel: 'Verified Campus Walkway Network',
      isStepFree: wheelchairOnly,
      errorMessage: wheelchairOnly
        ? 'No certified step-free route found without steps or obstacles. Toggle "Step-Free" off to view routes with stairs.'
        : 'No valid pedestrian walking route found between these points on verified campus paths.'
    };
  }

  const steps: RoutingStep[] = dijkstraResult.steps.map(s => ({
    stepNumber: s.stepNumber,
    instruction: s.instruction,
    distanceMeters: s.distanceMeters,
    distanceText: formatDistance(s.distanceMeters),
    isAccessible: s.isAccessible
  }));

  const durationMin = wheelchairOnly
    ? dijkstraResult.estimatedWheelchairMin
    : dijkstraResult.estimatedWalkingMin;

  return {
    success: true,
    coordinates: dijkstraResult.coordinates,
    distanceMeters: dijkstraResult.totalDistanceMeters,
    distanceText: formatDistance(dijkstraResult.totalDistanceMeters),
    durationMinutes: durationMin,
    durationText: formatDuration(durationMin),
    steps,
    source: 'verified_walkways',
    sourceLabel: 'Verified Campus Walkway Network',
    isStepFree: dijkstraResult.isFullyAccessible,
    notice: wheelchairOnly
      ? 'Verified step-free path with certified ramps and zero stairs.'
      : 'Verified campus pedestrian walkway route.'
  };
}

/**
 * Main routing dispatcher:
 * - When wheelchairOnly is true: prioritize verified campus step-free graph (with certified ramps & slope checks).
 * - For general pedestrian routing: try OSRM first; if unavailable/no route, fallback to verified campus walkways.
 * - If no route can be found by either, returns clear error and empty coordinates (never a straight line!).
 */
export async function calculatePedestrianRoute(params: {
  start: GeoLocation;
  dest: GeoLocation;
  wheelchairOnly: boolean;
}): Promise<RoutingResult> {
  const { start, dest, wheelchairOnly } = params;

  // Handle same origin and destination
  if (start.id === dest.id) {
    return {
      success: true,
      coordinates: [[start.lat, start.lng]],
      distanceMeters: 0,
      distanceText: '0 m',
      durationMinutes: 0,
      durationText: '0 min',
      steps: [{
        stepNumber: 1,
        instruction: `You are already at ${dest.name}.`,
        distanceMeters: 0,
        distanceText: '0 m',
        isAccessible: true
      }],
      source: 'verified_walkways',
      sourceLabel: 'Campus Location',
      isStepFree: true
    };
  }

  // If step-free accessible navigation is requested, use the verified campus accessibility graph
  if (wheelchairOnly) {
    return queryVerifiedCampusRoute(start, dest, true);
  }

  // First try verified internal campus walkways (fast, calibrated to Mewar quad & hostels)
  const campusRoute = queryVerifiedCampusRoute(start, dest, false);
  if (campusRoute.success && campusRoute.coordinates.length > 1) {
    return campusRoute;
  }

  // Fallback to OSRM public foot router
  const osrmRoute = await queryOsrmFootRoute(start.lat, start.lng, dest.lat, dest.lng);
  if (osrmRoute && osrmRoute.success && osrmRoute.coordinates.length > 1) {
    return osrmRoute;
  }

  // If both failed, return a clear, helpful failure message instead of a straight line through buildings
  return {
    success: false,
    coordinates: [],
    distanceMeters: 0,
    distanceText: '0 m',
    durationMinutes: 0,
    durationText: '0 min',
    steps: [],
    source: 'verified_walkways',
    sourceLabel: 'Pedestrian Router',
    isStepFree: false,
    errorMessage: 'No valid pedestrian walking route found between these locations without passing through restricted or unmapped areas. Please select a neighboring campus landmark or main entrance.'
  };
}
