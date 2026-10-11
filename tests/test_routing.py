"""
Unit and Integration Tests for AccessPath Routing Engine & API
Verifies stair avoidance, elevator failure recovery, blocked path rerouting,
unreachable destinations, and accessibility warnings.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import db
from backend.graph import CampusRoutingEngine
from backend.models import RoutePreference

@pytest.fixture(autouse=True)
def reset_db_before_each():
    """Ensure every test starts with clean demo state."""
    db.reset_to_default()

def test_stair_avoidance():
    """
    Test that users requesting step-free routes avoid the monumental stairs
    and use accessible ramps or lifts instead.
    """
    engine = CampusRoutingEngine(db)

    # Route from Gate to Engineering Main
    # Path Option 1 (Shortest direct): South -> Quad Center -> Quad Stairs (14 steps) -> Eng Main
    # Path Option 2 (Step-Free): South -> Quad Boardwalk Ramp (0 steps) -> Eng Main

    # 1. Without step-free preference (unconstrained)
    unconstrained_pref = RoutePreference(
        avoid_stairs=False,
        step_free_only=False,
        prefer_ramps=False
    )
    direct_route = engine.calculate_route("N_GATE", "N_ENG_MAIN", unconstrained_pref)
    assert direct_route.success is True
    # Direct route traverses quad stairs
    assert direct_route.total_stair_count > 0

    # 2. With strict step_free_only = True
    accessible_pref = RoutePreference(
        avoid_stairs=True,
        step_free_only=True,
        prefer_ramps=True
    )
    step_free_route = engine.calculate_route("N_GATE", "N_ENG_MAIN", accessible_pref)
    assert step_free_route.success is True
    assert step_free_route.is_step_free is True
    assert step_free_route.total_stair_count == 0
    # Quad stairs should NOT be in the path edges
    edge_ids = [e.id for e in step_free_route.path_edges]
    assert "E_QUAD_CENTER_TO_QUAD_STAIRS" not in edge_ids

    # 3. Test Quad South to Eng Main specifically: compares stairs vs boardwalk ramp directly
    quad_direct = engine.calculate_route("N_QUAD_SOUTH", "N_ENG_MAIN", unconstrained_pref)
    assert quad_direct.total_stair_count == 14
    assert "E_QUAD_CENTER_TO_QUAD_STAIRS" in [e.id for e in quad_direct.path_edges]

    quad_accessible = engine.calculate_route("N_QUAD_SOUTH", "N_ENG_MAIN", accessible_pref)
    assert quad_accessible.is_step_free is True
    assert quad_accessible.total_stair_count == 0
    quad_edge_ids = [e.id for e in quad_accessible.path_edges]
    assert "E_QUAD_CENTER_TO_QUAD_STAIRS" not in quad_edge_ids
    assert "E_QUAD_SOUTH_TO_BOARDWALK" in quad_edge_ids and "E_BOARDWALK_TO_ENG_MAIN" in quad_edge_ids

def test_elevator_failure_rerouting():
    """
    Test that when an elevator breaks down, any route relying on it
    is invalidated and an alternative route (e.g. switchback ramp) is taken.
    """
    engine = CampusRoutingEngine(db)

    # Route from Innovation Lower Courtyard to Innovation Upper Terrace
    # Normally, Elevator E2 is 30m total (Level 1 to Level 2)
    # The stairs are 35m (28 steps)
    # The outdoor switchback ramp is 140m (0 steps)
    pref = RoutePreference(step_free_only=True, avoid_unavailable_elevators=True)

    # Initial state: E2 is operational
    route_normal = engine.calculate_route("N_INNOV_LOWER", "N_INNOV_UPPER", pref)
    assert route_normal.success is True
    assert route_normal.is_step_free is True
    assert "E2" in route_normal.elevators_used
    assert route_normal.total_distance_m < 60.0

    # Simulate elevator E2 failure
    db.update_elevator_status("E2", "out_of_service", "Motor maintenance breakdown")
    assert db.get_elevator("E2").status == "out_of_service"

    # Recalculate route with E2 out of service
    route_detour = engine.calculate_route("N_INNOV_LOWER", "N_INNOV_UPPER", pref)
    assert route_detour.success is True
    assert route_detour.is_step_free is True
    # Should NOT use E2 anymore
    assert "E2" not in route_detour.elevators_used
    # Should use the switchback ramp bypass instead
    edge_ids = [e.id for e in route_detour.path_edges]
    assert "E_INNOV_RAMP_BYPASS_TO_UPPER" in edge_ids
    # Distance should be longer because of the bypass ramp
    assert route_detour.total_distance_m > route_normal.total_distance_m

def test_blocked_path_avoidance():
    """
    Test that when an edge is blocked (e.g. simulated construction),
    routing avoids it.
    """
    engine = CampusRoutingEngine(db)

    # Block the main gate promenade
    db.update_edge_status("E_GATE_TO_PLAZA", "blocked", "Pavement resurfacing")

    pref = RoutePreference()
    route = engine.calculate_route("N_GATE", "N_HEALTH", pref)

    # Since E_GATE_TO_PLAZA is the only exit from N_GATE in our graph, route should report no path
    assert route.success is False
    assert route.status_code == "NO_ROUTE"

def test_unreachable_destination():
    """
    Test routing to an isolated location with no pathways.
    """
    engine = CampusRoutingEngine(db)
    pref = RoutePreference()

    route = engine.calculate_route("N_GATE", "N_ISOLATED_OBSERVATORY", pref)
    assert route.success is False
    assert route.status_code == "NO_ROUTE"
    assert "No pathway could be found" in route.message

def test_no_verified_accessible_route_warning():
    """
    Test routing to a location with only stairs (Bell Tower),
    verifying appropriate status code and warnings.
    """
    engine = CampusRoutingEngine(db)
    pref = RoutePreference(step_free_only=True)

    route = engine.calculate_route("N_GATE", "N_HISTORIC_BELL_TOWER", pref)
    # The system should fall back to showing the physical route with strong warnings
    assert route.success is True
    assert route.status_code == "PARTIAL_ACCESSIBLE"
    assert route.is_step_free is False
    assert route.total_stair_count > 0
    assert any("step-free path unavailable" in w.lower() for w in route.warnings)

def test_api_endpoints():
    """
    Test FastAPI endpoints for campus topology, route calculation,
    and elevator status updates.
    """
    client = TestClient(app)

    # 1. Campus data
    resp = client.get("/api/campus")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert len(data["buildings"]) >= 10
    assert len(data["nodes"]) >= 20
    assert len(data["edges"]) >= 20

    # 2. Calculate route endpoint
    req_body = {
        "start_node": "N_GATE",
        "destination_node": "N_HEALTH",
        "avoid_stairs": True,
        "step_free_only": True,
        "prefer_ramps": True,
        "max_slope_grade": 8.0,
        "avoid_unavailable_elevators": True,
        "tactile_paving_priority": False,
        "allow_unverified_accessible": True
    }
    resp = client.post("/api/route", json=req_body)
    assert resp.status_code == 200
    route_data = resp.json()
    assert route_data["success"] is True
    assert route_data["is_step_free"] is True
    assert len(route_data["steps"]) >= 1

    # 3. Elevator status update endpoint
    elev_update = {
        "status": "out_of_service",
        "reason": "Test breakdown simulation"
    }
    resp = client.post("/api/elevators/E1/status", json=elev_update)
    assert resp.status_code == 200
    elev_data = resp.json()
    assert elev_data["success"] is True
    assert elev_data["elevator"]["status"] == "out_of_service"
    assert "E_ELEVATOR_E1_L1_L2" in elev_data["affected_edges"]

    # 4. Reset demo endpoint
    resp = client.post("/api/reset-demo")
    assert resp.status_code == 200
    elev_list = client.get("/api/elevators").json()
    e1 = next(e for e in elev_list if e["id"] == "E1")
    assert e1["status"] == "operational"
