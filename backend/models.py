from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Building(BaseModel):
    id: str
    name: str
    code: str
    category: str
    description: str
    lat: float
    lng: float
    main_node_id: str
    accessible_node_id: str
    floors: int = 1
    has_accessible_restroom: bool = True
    has_automatic_doors: bool = True
    has_braille_signage: bool = True
    facilities: List[str] = []

class CampusNode(BaseModel):
    id: str
    name: str
    building_id: Optional[str] = None
    node_type: str  # "entrance", "junction", "elevator_landing", "ramp_point", "transit", "plaza"
    lat: float
    lng: float
    level: int = 1
    is_indoor: bool = False
    has_tactile_paving: bool = False
    description: str = ""

class CampusEdge(BaseModel):
    id: str
    source: str
    target: str
    distance_m: float
    stairs: bool = False
    stair_count: int = 0
    ramp_available: bool = False
    slope_grade: float = 0.0  # Percentage grade (e.g., 2.0 = 2%, 8.0 = 8%)
    elevator_dependent: bool = False
    elevator_id: Optional[str] = None
    status: str = "open"  # "open", "blocked", "maintenance"
    direction: str = "bidirectional"  # "bidirectional", "forward"
    verified_accessible: bool = True
    surface_type: str = "smooth_concrete"  # "smooth_concrete", "paved_asphalt", "tactile_paving", "stone_pavers"
    tactile_paving: bool = False
    has_handrails: bool = False
    description: str = ""

class Elevator(BaseModel):
    id: str
    name: str
    building_id: str
    building_name: str
    status: str = "operational"  # "operational", "out_of_service", "maintenance"
    last_updated: str
    operating_hours: str = "24/7"
    voice_announcement: bool = True
    braille_buttons: bool = True
    door_clearance_cm: int = 95
    weight_capacity_kg: int = 1000
    notes: str = ""

class RoutePreference(BaseModel):
    avoid_stairs: bool = True
    step_free_only: bool = True
    prefer_ramps: bool = True
    max_slope_grade: float = 8.0  # Max acceptable slope % (ADA recommends <= 8.33% / 1:12)
    avoid_unavailable_elevators: bool = True
    tactile_paving_priority: bool = False
    allow_unverified_accessible: bool = True

class RouteStep(BaseModel):
    step_number: int
    from_node_id: str
    from_node_name: str
    to_node_id: str
    to_node_name: str
    instruction: str
    distance_m: float
    edge_id: str
    stairs: bool
    stair_count: int
    ramp: bool
    slope_grade: float
    elevator_used: Optional[str] = None
    surface: str
    warnings: List[str] = []

class RouteResponse(BaseModel):
    success: bool
    status_code: str = "OK"  # "OK", "NO_ROUTE", "PARTIAL_ACCESSIBLE", "BLOCKED_ORIGIN_OR_DEST"
    message: str = ""
    start_node: str
    destination_node: str
    total_distance_m: float = 0.0
    estimated_walking_min: float = 0.0
    estimated_wheelchair_min: float = 0.0
    is_step_free: bool = True
    is_verified_accessible: bool = True
    total_stair_count: int = 0
    ramps_used: int = 0
    elevators_used: List[str] = []
    nodes: List[Dict[str, Any]] = []
    path_node_ids: List[str] = []
    path_edges: List[CampusEdge] = []
    coordinates: List[List[float]] = []  # Leaflet [lat, lng] pairs
    steps: List[RouteStep] = []
    warnings: List[str] = []
    has_alternative_calculated: bool = False
    alternative_summary: Optional[str] = None
    fastest_distance_m: Optional[float] = None
    fastest_stair_count: Optional[int] = None

class ElevatorStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(operational|out_of_service|maintenance)$")
    reason: Optional[str] = None

class EdgeStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(open|blocked|maintenance)$")
    reason: Optional[str] = None
