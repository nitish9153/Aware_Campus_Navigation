"""
AccessPath - Accessibility-Aware Campus Navigation Backend
FastAPI server providing routing, graph topology, and dynamic elevator/obstacle simulation APIs.
"""

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import json
from typing import Dict, Any, List

from .models import (
    RoutePreference,
    RouteResponse,
    ElevatorStatusUpdate,
    EdgeStatusUpdate,
    Elevator,
    CampusEdge
)
from .database import db
from .graph import CampusRoutingEngine

app = FastAPI(
    title="AccessPath API",
    description="Accessibility-Aware Campus Navigation REST API (Oakridge University Demo Campus)",
    version="1.0.0"
)

# Enable CORS for flexible local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

routing_engine = CampusRoutingEngine(db)

@app.get("/api/campus")
def get_campus_network():
    """
    Returns full campus topology including buildings, nodes, edges, elevators,
    and metadata for visualization.
    """
    return {
        "success": True,
        "disclaimer": "Sample Fictional Dataset for Accessibility Navigation Simulation",
        "campus_name": "Oakridge Science & Arts University Campus",
        "center": [37.7762, -122.4168],
        "default_zoom": 17,
        "buildings": db.get_all_buildings(),
        "nodes": db.get_all_nodes(),
        "edges": db.get_all_edges(),
        "elevators": db.get_all_elevators()
    }

class RouteRequest(RoutePreference):
    start_node: str
    destination_node: str

@app.post("/api/route", response_model=RouteResponse)
def calculate_route(request: RouteRequest):
    """
    Calculates the shortest eligible route after filtering inaccessible edges,
    broken elevators, and stairs according to user accessibility preferences.
    """
    pref = RoutePreference(
        avoid_stairs=request.avoid_stairs,
        step_free_only=request.step_free_only,
        prefer_ramps=request.prefer_ramps,
        max_slope_grade=request.max_slope_grade,
        avoid_unavailable_elevators=request.avoid_unavailable_elevators,
        tactile_paving_priority=request.tactile_paving_priority,
        allow_unverified_accessible=request.allow_unverified_accessible
    )
    result = routing_engine.calculate_route(
        start_node_id=request.start_node,
        dest_node_id=request.destination_node,
        pref=pref
    )
    return result

@app.get("/api/elevators", response_model=List[Elevator])
def list_elevators():
    """Returns real-time status of all campus elevators."""
    return db.get_all_elevators()

@app.post("/api/elevators/{elevator_id}/status")
def update_elevator_status(elevator_id: str, update: ElevatorStatusUpdate):
    """
    Updates operational status of an elevator (operational, out_of_service, maintenance).
    Invalidates any route that relies on this elevator.
    """
    elev = db.update_elevator_status(elevator_id, update.status, update.reason)
    if not elev:
        raise HTTPException(status_code=404, detail=f"Elevator {elevator_id} not found")
    
    # Identify affected edges
    affected_edges = [
        e.id for e in db.get_all_edges()
        if e.elevator_dependent and e.elevator_id == elevator_id
    ]

    return {
        "success": True,
        "elevator": elev,
        "affected_edges": affected_edges,
        "message": f"Elevator {elevator_id} status updated to {update.status}"
    }

@app.get("/api/edges", response_model=List[CampusEdge])
def list_edges():
    """Returns all campus path segments."""
    return db.get_all_edges()

@app.post("/api/edges/{edge_id}/status")
def update_edge_status(edge_id: str, update: EdgeStatusUpdate):
    """
    Updates the status of a path segment (open, blocked, maintenance).
    Useful for simulating construction closures or temporary hazards.
    """
    edge = db.update_edge_status(edge_id, update.status, update.reason)
    if not edge:
        raise HTTPException(status_code=404, detail=f"Edge {edge_id} not found")
    return {
        "success": True,
        "edge": edge,
        "message": f"Edge {edge_id} status updated to {update.status}"
    }

@app.post("/api/reset-demo")
def reset_demo_data():
    """Resets all campus buildings, nodes, edges, and elevators to default demo state."""
    db.reset_to_default()
    return {
        "success": True,
        "message": "Campus demo network successfully reset to default state."
    }

# ============================================================================
# Mewar University Indoor Floor & Room Management Endpoints
# ============================================================================
MEWAR_INDOOR_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "mewar_indoor.json")

@app.get("/api/mewar/indoor")
def get_mewar_indoor_data():
    """
    Returns the persistent indoor building, floor, room, and corridor network data
    for Mewar University campus.
    """
    if os.path.exists(MEWAR_INDOOR_FILE):
        try:
            with open(MEWAR_INDOOR_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                buildings = data.get("buildings", data)
                return {"success": True, "buildings": buildings}
        except Exception as e:
            return {"success": False, "error": str(e), "buildings": []}
    return {"success": True, "buildings": [], "notice": "No custom indoor data saved on server yet"}

@app.post("/api/mewar/indoor")
def save_mewar_indoor_data(payload: Dict[str, Any] = Body(...)):
    """
    Persists updated indoor building, floor, room, and corridor network data to server.
    """
    try:
        os.makedirs(os.path.dirname(MEWAR_INDOOR_FILE), exist_ok=True)
        buildings = payload.get("buildings", payload) if isinstance(payload, dict) else payload
        with open(MEWAR_INDOOR_FILE, "w", encoding="utf-8") as f:
            json.dump({"buildings": buildings}, f, indent=2)
        count = len(buildings) if isinstance(buildings, list) else 0
        return {
            "success": True,
            "message": f"Successfully persisted indoor data for {count} buildings.",
            "buildings_count": count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save indoor data: {str(e)}")

@app.post("/api/mewar/indoor/reset")
def reset_mewar_indoor_data():
    """
    Resets the persistent indoor floor and room data file on the server.
    """
    if os.path.exists(MEWAR_INDOOR_FILE):
        try:
            os.remove(MEWAR_INDOOR_FILE)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to reset indoor data: {str(e)}")
    return {"success": True, "message": "Mewar indoor data file reset."}

# Mount static frontend directory
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")
if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

    @app.get("/")
    def serve_index():
        return FileResponse(os.path.join(frontend_dir, "index.html"))
