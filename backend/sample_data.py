"""
Oakridge Science & Arts University Campus - Sample Dataset
DISCLAIMER: This is a fictional campus dataset created strictly for accessibility simulation and demonstration.
"""

from typing import List, Dict, Any
from .models import Building, CampusNode, CampusEdge, Elevator

def get_initial_buildings() -> List[Building]:
    return [
        Building(
            id="B1",
            name="Main Gate & Visitor Welcome Center",
            code="GATE",
            category="Administration & Welcome",
            description="Main campus entrance with security kiosk, accessible visitor parking, and automated check-in.",
            lat=37.7745,
            lng=-122.4190,
            main_node_id="N_GATE",
            accessible_node_id="N_GATE",
            floors=1,
            has_accessible_restroom=True,
            has_automatic_doors=True,
            has_braille_signage=True,
            facilities=["Visitor Information", "Accessible Parking (4 bays)", "Emergency Call Box"]
        ),
        Building(
            id="B2",
            name="University Library & Learning Commons",
            code="LIB",
            category="Academic / Library",
            description="Two-story learning commons with silent study halls, assistive tech lab, and multi-level skybridge.",
            lat=37.7762,
            lng=-122.4178,
            main_node_id="N_LIB_MAIN",
            accessible_node_id="N_LIB_ACC",
            floors=2,
            has_accessible_restroom=True,
            has_automatic_doors=True,
            has_braille_signage=True,
            facilities=["Assistive Tech Stations", "Elevator E1", "Accessible Restrooms (L1 & L2)", "Hearing Loop System"]
        ),
        Building(
            id="B3",
            name="Science & Engineering Complex",
            code="ENG",
            category="STEM Laboratories",
            description="Modern research labs, maker classrooms, and high-ceiling engineering workshops with wide corridors.",
            lat=37.7778,
            lng=-122.4162,
            main_node_id="N_ENG_MAIN",
            accessible_node_id="N_ENG_RAMP",
            floors=2,
            has_accessible_restroom=True,
            has_automatic_doors=True,
            has_braille_signage=True,
            facilities=["Accessible Fume Hoods", "Level Threshold Entrances", "Automatic Push-Plates"]
        ),
        Building(
            id="B4",
            name="Student Life & Dining Commons",
            code="STU",
            category="Student Services & Dining",
            description="Central dining marketplace, student club offices, accessibility support desk, and lounge.",
            lat=37.7758,
            lng=-122.4152,
            main_node_id="N_STUDENT_CTR",
            accessible_node_id="N_STUDENT_CTR",
            floors=1,
            has_accessible_restroom=True,
            has_automatic_doors=True,
            has_braille_signage=True,
            facilities=["Wheelchair-height Tray Stations", "Gender-Neutral Accessible Restrooms", "Quiet Sensory Room"]
        ),
        Building(
            id="B5",
            name="Innovation Hub & Computer Labs",
            code="HUB",
            category="Tech & Innovation",
            description="High-tech workspace perched on an elevated scenic terrace. Accessible via Terrace Glass Lift (E2) or south perimeter switchback ramp.",
            lat=37.7775,
            lng=-122.4140,
            main_node_id="N_INNOV_UPPER",
            accessible_node_id="N_INNOV_UPPER",
            floors=2,
            has_accessible_restroom=True,
            has_automatic_doors=True,
            has_braille_signage=True,
            facilities=["Elevator E2 (Terrace Lift)", "Ergonomic Adjustable Desks", "Screen Magnifier Stations"]
        ),
        Building(
            id="B6",
            name="Health & Wellness Pavilion",
            code="HLTH",
            category="Health & Clinic",
            description="Campus health center, counseling suites, physiotherapy clinic, and pharmacy with zero-threshold access.",
            lat=37.7748,
            lng=-122.4165,
            main_node_id="N_HEALTH",
            accessible_node_id="N_HEALTH",
            floors=1,
            has_accessible_restroom=True,
            has_automatic_doors=True,
            has_braille_signage=True,
            facilities=["Automated Sliding Doors", "Medical Wheelchair Loan Service", "Low Examination Couches"]
        ),
        Building(
            id="B7",
            name="Faculty & Administration Pavilion",
            code="ADM",
            category="Administration",
            description="Registrar, financial aid, dean's offices, and accessible conference amphitheater.",
            lat=37.7788,
            lng=-122.4180,
            main_node_id="N_ADMIN",
            accessible_node_id="N_ADMIN",
            floors=2,
            has_accessible_restroom=True,
            has_automatic_doors=True,
            has_braille_signage=True,
            facilities=["Accessible Counter Heights", "Braille Directories", "Dual Handrail Corridors"]
        ),
        Building(
            id="B8",
            name="Campus Quad & Central Amphitheater",
            code="QUAD",
            category="Outdoors / Gathering",
            description="Lush green lawn with tiered stone amphitheater seating, surrounded by smooth brick-paved perimeter paths.",
            lat=37.7766,
            lng=-122.4166,
            main_node_id="N_QUAD_CENTER",
            accessible_node_id="N_QUAD_RAMP_PATH",
            floors=1,
            has_accessible_restroom=False,
            has_automatic_doors=False,
            has_braille_signage=False,
            facilities=["Wheelchair Seating Cutouts", "Shaded Rest Gazebos", "Emergency Call Pillar"]
        ),
        Building(
            id="B9",
            name="Accessible Transit Hub & Shuttle Stop",
            code="BUS",
            category="Transportation",
            description="Direct link to city low-floor electric buses and accessible campus paratransit shuttles.",
            lat=37.7740,
            lng=-122.4176,
            main_node_id="N_TRANSIT",
            accessible_node_id="N_TRANSIT",
            floors=1,
            has_accessible_restroom=True,
            has_automatic_doors=True,
            has_braille_signage=True,
            facilities=["Audio Bus Arrival Alerts", "Tactile Ground Guidance Lines", "Level Platform Boarding"]
        ),
        Building(
            id="B10",
            name="Arts & Performance Hall",
            code="ARTS",
            category="Fine Arts & Theater",
            description="Fine arts auditorium, music practice rooms, and gallery space.",
            lat=37.7752,
            lng=-122.4138,
            main_node_id="N_ARTS",
            accessible_node_id="N_ARTS",
            floors=1,
            has_accessible_restroom=True,
            has_automatic_doors=True,
            has_braille_signage=True,
            facilities=["Integrated Wheelchair Theater Bays", "Assistive Listening Receivers"]
        ),
    ]

def get_initial_elevators() -> List[Elevator]:
    return [
        Elevator(
            id="E1",
            name="Library West Elevator (Ground to Level 2 Skybridge)",
            building_id="B2",
            building_name="University Library",
            status="operational",
            last_updated="2026-10-11 09:00 AM",
            operating_hours="07:00 - 23:00",
            voice_announcement=True,
            braille_buttons=True,
            door_clearance_cm=105,
            weight_capacity_kg=1250,
            notes="Primary accessible connection between Library ground floor and Level 2 Quad Skybridge."
        ),
        Elevator(
            id="E2",
            name="Terrace Glass Lift (Courtyard to Upper Terrace)",
            building_id="B5",
            building_name="Innovation Hub",
            status="operational",
            last_updated="2026-10-11 08:30 AM",
            operating_hours="24/7",
            voice_announcement=True,
            braille_buttons=True,
            door_clearance_cm=110,
            weight_capacity_kg=1000,
            notes="Vertical transit lift connecting lower courtyard directly to Innovation Hub upper terrace."
        ),
    ]

def get_initial_nodes() -> List[CampusNode]:
    return [
        # Gate & South Entry
        CampusNode(id="N_GATE", name="Main Gate & Visitor Check-In", building_id="B1", node_type="entrance", lat=37.7745, lng=-122.4190, level=1, description="Level entry with push-button automatic gate"),
        CampusNode(id="N_GATE_JUNCTION", name="South Promenade Plaza", building_id=None, node_type="junction", lat=37.7749, lng=-122.4184, level=1, has_tactile_paving=True, description="Spacious flat junction paved with smooth concrete"),
        CampusNode(id="N_TRANSIT", name="Accessible Transit Hub Platform", building_id="B9", node_type="transit", lat=37.7740, lng=-122.4176, level=1, has_tactile_paving=True, description="Level boarding zone with yellow tactile warning tiles"),
        CampusNode(id="N_HEALTH", name="Health Pavilion Main Entry", building_id="B6", node_type="entrance", lat=37.7748, lng=-122.4165, level=1, has_tactile_paving=True, description="Automatic sliding door entrance with zero step threshold"),

        # Central Quad & Library West Hub
        CampusNode(id="N_WEST_CORRIDOR", name="Library West Gateway", building_id=None, node_type="junction", lat=37.7756, lng=-122.4182, level=1, description="Wide paved concourse outside Library west facade"),
        CampusNode(id="N_LIB_MAIN", name="Library Grand Steps Entrance", building_id="B2", node_type="entrance", lat=37.7760, lng=-122.4179, level=1, description="Main east entrance with 18 granite steps"),
        CampusNode(id="N_LIB_ACC", name="Library Accessible West Entry", building_id="B2", node_type="entrance", lat=37.7761, lng=-122.4182, level=1, has_tactile_paving=True, description="Level automated entry directly into Assistive Tech Lobby"),
        CampusNode(id="N_LIB_ELEV_L1", name="Library Elevator E1 (Level 1)", building_id="B2", node_type="elevator_landing", lat=37.7762, lng=-122.4179, level=1, is_indoor=True, description="Ground floor elevator vestibule"),
        CampusNode(id="N_LIB_ELEV_L2", name="Library Elevator E1 (Level 2 Skybridge)", building_id="B2", node_type="elevator_landing", lat=37.7762, lng=-122.4176, level=2, is_indoor=True, description="Level 2 elevator lobby leading to North Quad Skybridge"),
        CampusNode(id="N_LIB_RAMP_MID", name="Library Outdoor Switchback Ramp", building_id="B2", node_type="ramp_point", lat=37.7765, lng=-122.4180, level=1, description="Gentle 4.2% switchback ramp connecting ground to Skybridge level with dual handrails"),

        # Central Quad Areas
        CampusNode(id="N_QUAD_SOUTH", name="Quad South Crossroads", building_id=None, node_type="junction", lat=37.7758, lng=-122.4169, level=1, description="Paved junction south of central lawn"),
        CampusNode(id="N_QUAD_CENTER", name="Central Amphitheater Base", building_id="B8", node_type="plaza", lat=37.7766, lng=-122.4166, level=1, description="Central amphitheater bowl with lawn and stone tiers"),
        CampusNode(id="N_QUAD_STAIRS", name="Quad North Tiered Steps", building_id="B8", node_type="junction", lat=37.7770, lng=-122.4165, level=1, description="Direct stone stairs (14 steps) leading to Science Plaza"),
        CampusNode(id="N_QUAD_RAMP_PATH", name="Quad East Accessible Boardwalk", building_id="B8", node_type="ramp_point", lat=37.7767, lng=-122.4159, level=1, description="Step-free wooden and concrete perimeter boardwalk around amphitheater"),

        # Student Life & Dining / Arts Hub
        CampusNode(id="N_STUDENT_CTR", name="Student Life & Dining Entry", building_id="B4", node_type="entrance", lat=37.7758, lng=-122.4152, level=1, description="Automatic sliding door entrance to dining hall"),
        CampusNode(id="N_ARTS", name="Arts & Performance Hall Entry", building_id="B10", node_type="entrance", lat=37.7752, lng=-122.4138, level=1, description="Wide level glass entryway to gallery and auditorium"),
        CampusNode(id="N_EAST_WALKWAY", name="East Campus Green Path", building_id=None, node_type="junction", lat=37.7763, lng=-122.4146, level=1, description="Scenic flat pedestrian walkway"),

        # North Science & Innovation Hub
        CampusNode(id="N_ENG_MAIN", name="Science & Eng North Entry", building_id="B3", node_type="entrance", lat=37.7778, lng=-122.4162, level=1, description="Paved concourse entrance with push pad"),
        CampusNode(id="N_ENG_RAMP", name="Science West Accessible Ramp Entry", building_id="B3", node_type="entrance", lat=37.7776, lng=-122.4168, level=1, has_tactile_paving=True, description="Dedicated ramp entry with handrails and 3.8% slope"),
        CampusNode(id="N_ADMIN", name="Admin Pavilion Main Foyer", building_id="B7", node_type="entrance", lat=37.7788, lng=-122.4180, level=1, description="Level grand foyer entrance"),
        CampusNode(id="N_NORTH_CROSS", name="North Concourse Junction", building_id=None, node_type="junction", lat=37.7780, lng=-122.4174, level=1, description="Open paved plaza linking Admin, Engineering, and Library Skybridge"),

        # Innovation Hub multi-level nodes
        CampusNode(id="N_INNOV_LOWER", name="Innovation Lower Courtyard", building_id="B5", node_type="junction", lat=37.7772, lng=-122.4145, level=1, description="Lower courtyard plaza at base of Innovation hill"),
        CampusNode(id="N_INNOV_ELEV_L1", name="Innovation Glass Lift E2 (Lower)", building_id="B5", node_type="elevator_landing", lat=37.7773, lng=-122.4143, level=1, description="Elevator E2 ground landing"),
        CampusNode(id="N_INNOV_ELEV_L2", name="Innovation Glass Lift E2 (Upper)", building_id="B5", node_type="elevator_landing", lat=37.7774, lng=-122.4141, level=2, description="Elevator E2 upper landing"),
        CampusNode(id="N_INNOV_STAIRS", name="Innovation Hill Monumental Stairs", building_id="B5", node_type="junction", lat=37.7773, lng=-122.4142, level=1, description="Steep outdoor architectural staircase with 28 steps"),
        CampusNode(id="N_INNOV_UPPER", name="Innovation Hub Upper Entry", building_id="B5", node_type="entrance", lat=37.7775, lng=-122.4140, level=2, has_tactile_paving=True, description="Terrace entrance with automatic double doors"),
        CampusNode(id="N_INNOV_RAMP_BYPASS", name="Innovation South Switchback Ramp", building_id="B5", node_type="ramp_point", lat=37.7768, lng=-122.4142, level=1, description="ADA-compliant switchback ramp (4.8% slope, rests every 9m) climbing to upper terrace"),

        # Special test nodes for unreachable & isolated scenarios
        CampusNode(id="N_ISOLATED_OBSERVATORY", name="Mountain Observatory (Test Isolated Node)", building_id=None, node_type="junction", lat=37.7810, lng=-122.4120, level=1, description="Isolated summit node with no connecting pathways (for testing unreachable routes)"),
        CampusNode(id="N_HISTORIC_BELL_TOWER", name="Historic Bell Tower Lookout (Stairs Only)", building_id=None, node_type="junction", lat=37.7770, lng=-122.4190, level=2, description="Historic tower reachable only via 45 narrow spiraling stone steps")
    ]

def get_initial_edges() -> List[CampusEdge]:
    return [
        # Gate to South Nodes
        CampusEdge(
            id="E_GATE_TO_PLAZA",
            source="N_GATE",
            target="N_GATE_JUNCTION",
            distance_m=65.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=1.2,
            verified_accessible=True,
            surface_type="smooth_concrete",
            description="Flat wide main promenade from Gate to South Plaza"
        ),
        CampusEdge(
            id="E_PLAZA_TO_TRANSIT",
            source="N_GATE_JUNCTION",
            target="N_TRANSIT",
            distance_m=110.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=1.0,
            verified_accessible=True,
            tactile_paving=True,
            surface_type="tactile_paving",
            description="Guidance paving path to Accessible Shuttle Hub"
        ),
        CampusEdge(
            id="E_PLAZA_TO_HEALTH",
            source="N_GATE_JUNCTION",
            target="N_HEALTH",
            distance_m=160.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=1.5,
            verified_accessible=True,
            surface_type="smooth_concrete",
            description="Smooth asphalt and concrete path to Health & Wellness Pavilion"
        ),
        CampusEdge(
            id="E_TRANSIT_TO_HEALTH",
            source="N_TRANSIT",
            target="N_HEALTH",
            distance_m=125.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=1.1,
            verified_accessible=True,
            surface_type="smooth_concrete",
            description="Direct level walkway linking Shuttle Stop and Health Clinic"
        ),
        CampusEdge(
            id="E_PLAZA_TO_WEST_CORRIDOR",
            source="N_GATE_JUNCTION",
            target="N_WEST_CORRIDOR",
            distance_m=85.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=2.0,
            verified_accessible=True,
            surface_type="smooth_concrete",
            description="Gentle walkway towards Library west promenade"
        ),

        # Library area connections
        CampusEdge(
            id="E_WEST_TO_LIB_ACC",
            source="N_WEST_CORRIDOR",
            target="N_LIB_ACC",
            distance_m=45.0,
            stairs=False,
            stair_count=0,
            ramp_available=True,
            slope_grade=2.5,
            verified_accessible=True,
            tactile_paving=True,
            surface_type="smooth_concrete",
            has_handrails=True,
            description="Accessible level approach with automatic door pad to Library West"
        ),
        CampusEdge(
            id="E_WEST_TO_LIB_MAIN_STAIRS",
            source="N_WEST_CORRIDOR",
            target="N_LIB_MAIN",
            distance_m=40.0,
            stairs=True,
            stair_count=18,
            ramp_available=False,
            slope_grade=0.0,
            verified_accessible=False,
            surface_type="stone_pavers",
            description="Grand architectural flight of 18 stone steps to Library Main Entrance"
        ),
        CampusEdge(
            id="E_LIB_ACC_TO_ELEV_L1",
            source="N_LIB_ACC",
            target="N_LIB_ELEV_L1",
            distance_m=25.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=0.5,
            verified_accessible=True,
            surface_type="smooth_concrete",
            description="Indoor lobby corridor with wide turning radius to Elevator E1"
        ),
        CampusEdge(
            id="E_LIB_MAIN_TO_ELEV_L1",
            source="N_LIB_MAIN",
            target="N_LIB_ELEV_L1",
            distance_m=20.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=0.0,
            verified_accessible=True,
            surface_type="smooth_concrete",
            description="Interior passage from main lobby to Elevator E1"
        ),
        # Elevator E1 vertical edge
        CampusEdge(
            id="E_ELEVATOR_E1_L1_L2",
            source="N_LIB_ELEV_L1",
            target="N_LIB_ELEV_L2",
            distance_m=15.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=0.0,
            elevator_dependent=True,
            elevator_id="E1",
            status="open",
            verified_accessible=True,
            surface_type="smooth_concrete",
            description="Library West Elevator E1 vertical ride (Level 1 to Level 2 Skybridge)"
        ),
        # Outdoor switchback ramp alternative to E1
        CampusEdge(
            id="E_LIB_ACC_TO_RAMP_MID",
            source="N_LIB_ACC",
            target="N_LIB_RAMP_MID",
            distance_m=50.0,
            stairs=False,
            stair_count=0,
            ramp_available=True,
            slope_grade=4.0,
            verified_accessible=True,
            has_handrails=True,
            surface_type="smooth_concrete",
            description="Outdoor accessible ramp first segment (4% slope, handrails both sides)"
        ),
        CampusEdge(
            id="E_RAMP_MID_TO_ELEV_L2",
            source="N_LIB_RAMP_MID",
            target="N_LIB_ELEV_L2",
            distance_m=55.0,
            stairs=False,
            stair_count=0,
            ramp_available=True,
            slope_grade=4.2,
            verified_accessible=True,
            has_handrails=True,
            surface_type="smooth_concrete",
            description="Outdoor accessible ramp second segment connecting to Skybridge entrance"
        ),
        CampusEdge(
            id="E_LIB_ELEV_L2_TO_NORTH_CROSS",
            source="N_LIB_ELEV_L2",
            target="N_NORTH_CROSS",
            distance_m=90.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=1.5,
            verified_accessible=True,
            surface_type="smooth_concrete",
            description="Level skybridge connector from Library Level 2 to North Concourse"
        ),

        # South / Quad Crossroads
        CampusEdge(
            id="E_HEALTH_TO_QUAD_SOUTH",
            source="N_HEALTH",
            target="N_QUAD_SOUTH",
            distance_m=110.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=1.8,
            verified_accessible=True,
            surface_type="smooth_concrete",
            description="Shaded pathway leading from Health Pavilion to Quad South"
        ),
        CampusEdge(
            id="E_WEST_TO_QUAD_SOUTH",
            source="N_WEST_CORRIDOR",
            target="N_QUAD_SOUTH",
            distance_m=120.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=1.5,
            verified_accessible=True,
            surface_type="paved_asphalt",
            description="Smooth asphalt pathway skirting the south end of the quad"
        ),
        CampusEdge(
            id="E_QUAD_SOUTH_TO_STUDENT",
            source="N_QUAD_SOUTH",
            target="N_STUDENT_CTR",
            distance_m=130.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=1.0,
            verified_accessible=True,
            surface_type="smooth_concrete",
            description="Wide pedestrian mall to Student Life & Dining Commons"
        ),
        CampusEdge(
            id="E_STUDENT_TO_ARTS",
            source="N_STUDENT_CTR",
            target="N_ARTS",
            distance_m=135.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=1.2,
            verified_accessible=True,
            surface_type="smooth_concrete",
            description="Tree-lined pedestrian promenade connecting Dining Hall and Arts Hall"
        ),
        CampusEdge(
            id="E_STUDENT_TO_EAST_WALKWAY",
            source="N_STUDENT_CTR",
            target="N_EAST_WALKWAY",
            distance_m=75.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=1.8,
            verified_accessible=True,
            surface_type="smooth_concrete",
            description="East walkway entrance from Student Life Center"
        ),
        CampusEdge(
            id="E_EAST_WALKWAY_TO_INNOV_LOWER",
            source="N_EAST_WALKWAY",
            target="N_INNOV_LOWER",
            distance_m=105.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=2.2,
            verified_accessible=True,
            surface_type="smooth_concrete",
            description="Smooth connector path leading to Innovation Lower Courtyard"
        ),

        # Central Quad paths: direct path with stairs vs accessible perimeter boardwalk
        CampusEdge(
            id="E_QUAD_SOUTH_TO_QUAD_CENTER",
            source="N_QUAD_SOUTH",
            target="N_QUAD_CENTER",
            distance_m=85.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=2.0,
            verified_accessible=True,
            surface_type="paved_asphalt",
            description="Gentle slope pathway into the Quad central lawn"
        ),
        CampusEdge(
            id="E_QUAD_CENTER_TO_QUAD_STAIRS",
            source="N_QUAD_CENTER",
            target="N_QUAD_STAIRS",
            distance_m=45.0,
            stairs=True,
            stair_count=14,
            ramp_available=False,
            slope_grade=0.0,
            verified_accessible=False,
            surface_type="stone_pavers",
            description="Amphitheater north stone flight (14 steps) up towards Science Complex"
        ),
        CampusEdge(
            id="E_QUAD_STAIRS_TO_ENG_MAIN",
            source="N_QUAD_STAIRS",
            target="N_ENG_MAIN",
            distance_m=75.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=1.5,
            verified_accessible=True,
            surface_type="smooth_concrete",
            description="Short paved walk from top of stairs to Engineering Main entrance"
        ),
        CampusEdge(
            id="E_QUAD_SOUTH_TO_BOARDWALK",
            source="N_QUAD_SOUTH",
            target="N_QUAD_RAMP_PATH",
            distance_m=110.0,
            stairs=False,
            stair_count=0,
            ramp_available=True,
            slope_grade=3.5,
            verified_accessible=True,
            has_handrails=True,
            surface_type="smooth_concrete",
            description="East perimeter ramp path bypassing amphitheater stairs (3.5% slope)"
        ),
        CampusEdge(
            id="E_BOARDWALK_TO_ENG_MAIN",
            source="N_QUAD_RAMP_PATH",
            target="N_ENG_MAIN",
            distance_m=120.0,
            stairs=False,
            stair_count=0,
            ramp_available=True,
            slope_grade=3.2,
            verified_accessible=True,
            surface_type="smooth_concrete",
            description="Gentle sloped concourse connecting boardwalk to Engineering Main"
        ),
        CampusEdge(
            id="E_BOARDWALK_TO_INNOV_LOWER",
            source="N_QUAD_RAMP_PATH",
            target="N_INNOV_LOWER",
            distance_m=95.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=2.0,
            verified_accessible=True,
            surface_type="smooth_concrete",
            description="Cross-quad path between east boardwalk and Innovation Courtyard"
        ),

        # Engineering Complex Connections
        CampusEdge(
            id="E_ENG_MAIN_TO_ENG_RAMP",
            source="N_ENG_MAIN",
            target="N_ENG_RAMP",
            distance_m=50.0,
            stairs=False,
            stair_count=0,
            ramp_available=True,
            slope_grade=3.0,
            verified_accessible=True,
            has_handrails=True,
            surface_type="smooth_concrete",
            description="Level terrace path to Engineering Accessible Ramp Entrance"
        ),
        CampusEdge(
            id="E_ENG_RAMP_TO_NORTH_CROSS",
            source="N_ENG_RAMP",
            target="N_NORTH_CROSS",
            distance_m=70.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=1.8,
            verified_accessible=True,
            surface_type="smooth_concrete",
            description="Concourse connecting Engineering Ramp to North Crossroads"
        ),
        CampusEdge(
            id="E_NORTH_CROSS_TO_ADMIN",
            source="N_NORTH_CROSS",
            target="N_ADMIN",
            distance_m=95.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=1.5,
            verified_accessible=True,
            surface_type="smooth_concrete",
            description="Direct wide avenue leading to Administration Pavilion"
        ),

        # Innovation Hub Multi-Level Navigation:
        # Route Option A: Monumental Stairs (28 steps, short distance 30m)
        CampusEdge(
            id="E_INNOV_LOWER_TO_STAIRS",
            source="N_INNOV_LOWER",
            target="N_INNOV_STAIRS",
            distance_m=20.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=0.0,
            verified_accessible=True,
            surface_type="smooth_concrete",
            description="Approach to Innovation Hill stairs"
        ),
        CampusEdge(
            id="E_INNOV_STAIRS_TO_UPPER",
            source="N_INNOV_STAIRS",
            target="N_INNOV_UPPER",
            distance_m=35.0,
            stairs=True,
            stair_count=28,
            ramp_available=False,
            slope_grade=0.0,
            verified_accessible=False,
            surface_type="stone_pavers",
            description="Monumental outdoor architectural staircase (28 steps) climbing to Innovation Terrace"
        ),

        # Route Option B: Elevator E2 (Courtyard lift, distance 15m)
        CampusEdge(
            id="E_INNOV_LOWER_TO_ELEV_L1",
            source="N_INNOV_LOWER",
            target="N_INNOV_ELEV_L1",
            distance_m=18.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=0.5,
            verified_accessible=True,
            tactile_paving=True,
            surface_type="tactile_paving",
            description="Tactile path leading to Elevator E2 lower entrance"
        ),
        CampusEdge(
            id="E_ELEVATOR_E2_L1_L2",
            source="N_INNOV_ELEV_L1",
            target="N_INNOV_ELEV_L2",
            distance_m=12.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=0.0,
            elevator_dependent=True,
            elevator_id="E2",
            status="open",
            verified_accessible=True,
            surface_type="smooth_concrete",
            description="Elevator E2 glass vertical lift (Lower Courtyard to Upper Terrace)"
        ),
        CampusEdge(
            id="E_INNOV_ELEV_L2_TO_UPPER",
            source="N_INNOV_ELEV_L2",
            target="N_INNOV_UPPER",
            distance_m=15.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=0.5,
            verified_accessible=True,
            surface_type="smooth_concrete",
            description="Upper landing level connector directly into Innovation Hub"
        ),

        # Route Option C: Accessible Switchback Ramp (Zero steps, 140m bypass)
        CampusEdge(
            id="E_INNOV_LOWER_TO_RAMP_BYPASS",
            source="N_INNOV_LOWER",
            target="N_INNOV_RAMP_BYPASS",
            distance_m=60.0,
            stairs=False,
            stair_count=0,
            ramp_available=True,
            slope_grade=3.8,
            verified_accessible=True,
            has_handrails=True,
            surface_type="smooth_concrete",
            description="South approach leading to accessible terrace switchback ramp"
        ),
        CampusEdge(
            id="E_INNOV_RAMP_BYPASS_TO_UPPER",
            source="N_INNOV_RAMP_BYPASS",
            target="N_INNOV_UPPER",
            distance_m=80.0,
            stairs=False,
            stair_count=0,
            ramp_available=True,
            slope_grade=4.5,
            verified_accessible=True,
            has_handrails=True,
            surface_type="smooth_concrete",
            description="Climbing switchback ramp with rests and continuous dual handrails to Upper Terrace"
        ),

        # Direct connector between Innovation Hub upper terrace and Engineering complex
        CampusEdge(
            id="E_INNOV_UPPER_TO_ENG_MAIN",
            source="N_INNOV_UPPER",
            target="N_ENG_MAIN",
            distance_m=160.0,
            stairs=False,
            stair_count=0,
            ramp_available=False,
            slope_grade=2.1,
            verified_accessible=True,
            surface_type="smooth_concrete",
            description="Level high-line skyway connecting Innovation Hub to Science & Engineering Complex"
        ),

        # Bell Tower (Only reachable via stairs, for testing "No verified accessible route exists")
        CampusEdge(
            id="E_WEST_TO_BELL_TOWER",
            source="N_WEST_CORRIDOR",
            target="N_HISTORIC_BELL_TOWER",
            distance_m=90.0,
            stairs=True,
            stair_count=45,
            ramp_available=False,
            slope_grade=15.0,
            verified_accessible=False,
            surface_type="stone_pavers",
            description="Historic winding spiral stone stairway (45 steep steps) up to the Bell Tower lookout"
        )
    ]
