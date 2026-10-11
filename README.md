# AccessPath — Accessibility-Aware Campus Navigation

> **Inclusive campus mobility routing engine designed for students, wheelchair users, people with mobility limitations, and campus visitors.**

AccessPath solves physical campus navigation challenges by factoring in **stairs, certified ramps, slope thresholds, tactile paving, and real-time elevator availability**. Powered by an adaptive Dijkstra routing graph and interactive OpenStreetMap/Leaflet visualization.

---

## 🚀 Key Features

1. **Accessibility-Centric Dijkstra Routing**:
   - Strictly filters stairs, steep inclines (>8%), and out-of-service elevators when `Step-free routes only` is enabled.
   - Weighted cost evaluation penalizes obstacles and awards bonuses to certified accessible ramps.
   - Clearly flags verified ADA routes vs unverified paths with explicit cautionary warnings.
2. **Dynamic Elevator Resilience & Automatic Rerouting**:
   - Real-time elevator health monitoring.
   - When an elevator goes out of service, any active route relying on it is invalidated and an alternative step-free detour (e.g. switchback ramps or perimeter paths) is automatically recalculated.
3. **Interactive Campus Map**:
   - Built on **Leaflet** and OpenStreetMap CartoDB tiles.
   - Color-coded pathways: step-free paved paths (green), certified ramps (teal), stairs (dashed crimson), and active calculated routes (royal blue/emerald).
   - Custom markers for building entrances, elevators, and shuttle stops.
4. **Rich Turn-by-Turn Navigation**:
   - Turn-by-turn instruction list with distance, surface type, slope grade, and obstacle warnings.
   - Estimated travel times for both manual/power wheelchairs and walking paces.
   - Side-by-side comparison with the standard direct route (highlighting steps avoided).
5. **Interactive Fault Simulation Sandbox**:
   - One-click simulations for elevator breakdowns (e.g. Terrace Glass Lift E2).
   - Walkway construction and obstacle closure toggles.
6. **Administrative Management Dashboard**:
   - Facilities dashboard for managing elevator operational statuses.
   - Campus path network inspector with instant toggle controls.
   - One-click "Reset Demo" button to restore default demo conditions.
7. **Accessibility-First Design (WCAG AA/AAA)**:
   - High Contrast mode toggle.
   - ARIA live region announcements (`aria-live="polite"`).
   - Semantic HTML5, accessible skip links, and full keyboard navigation.

---

## 🏗️ Project Architecture

```
Aware Campus Navigation/
├── backend/
│   ├── main.py            # FastAPI server & REST API endpoints
│   ├── models.py          # Pydantic data schemas (Buildings, Nodes, Edges, Preferences)
│   ├── graph.py           # Dijkstra routing engine with multi-criteria accessibility
│   ├── database.py        # In-memory & state manager with runtime toggles
│   └── sample_data.py     # Fictional Oakridge University campus dataset
├── frontend/
│   ├── index.html         # Accessible single-page application structure
│   ├── css/
│   │   └── styles.css     # Accessible design system, CSS variables, high contrast mode
│   └── js/
│       ├── api.js         # Asynchronous backend REST client
│       ├── map.js         # Leaflet map controller & layer manager
│       └── app.js         # Application state, route handling, and simulation controller
├── tests/
│   └── test_routing.py    # Automated pytest suite (6 test cases)
└── README.md              # Project documentation and guide
```

---

## 🛠️ Quick Start & Setup

### Prerequisites
- **Python 3.10+** (Tested on Python 3.11)
- Modern web browser (Chrome, Edge, Firefox, Safari)

### 1. Install Dependencies
```bash
pip install fastapi uvicorn pydantic pytest httpx
```

### 2. Run the Automated Test Suite
To verify stair avoidance, elevator failure rerouting, blocked paths, and API endpoints:
```bash
python -m pytest tests/ -v
```
All 6 tests verify:
- `test_stair_avoidance`: Ensures step-free preference avoids stairs and takes accessible ramps.
- `test_elevator_failure_rerouting`: Verifies rerouting via bypass ramps when elevators break down.
- `test_blocked_path_avoidance`: Tests routing around construction closures.
- `test_unreachable_destination`: Verifies graceful error messages for disconnected nodes.
- `test_no_verified_accessible_route_warning`: Flags routes where only stairs exist with proper warnings.
- `test_api_endpoints`: Verifies all FastAPI endpoints.

### 3. Start the Application Server
Run the FastAPI backend with Uvicorn:
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### 4. Open AccessPath in Browser
Navigate to:
```
http://127.0.0.1:8000
```
*(FastAPI serves both the REST API endpoints and static frontend files directly at this address).*

---

## 📡 API Reference Summary

| Endpoint | Method | Description |
|---|---|---|
| `/api/campus` | `GET` | Retrieves full campus network (buildings, nodes, edges, elevators) |
| `/api/route` | `POST` | Calculates shortest accessible route respecting user preferences |
| `/api/elevators` | `GET` | Lists real-time statuses of all campus elevators |
| `/api/elevators/{id}/status` | `POST` | Updates elevator status (`operational`, `out_of_service`, `maintenance`) |
| `/api/edges` | `GET` | Lists all campus path segments |
| `/api/edges/{id}/status` | `POST` | Updates path status (`open`, `blocked`, `maintenance`) |
| `/api/reset-demo` | `POST` | Resets campus network to default demo state |

---

## 🎓 Demo Campus Dataset Disclaimer

The **Oakridge Science & Arts University Campus** dataset included in this prototype is **fictional sample data** designed explicitly for demonstration and simulation purposes. Real-world implementations should integrate institutional GIS data, audited ADA accessibility surveys, and live IoT elevator telemetry.
