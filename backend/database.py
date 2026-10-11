"""
Campus Database and State Manager
Maintains current state of buildings, nodes, edges, elevators, and allows runtime status toggling & resetting.
"""

from typing import Dict, List, Optional
import datetime
import json
import os
from .models import Building, CampusNode, CampusEdge, Elevator
from .sample_data import get_initial_buildings, get_initial_nodes, get_initial_edges, get_initial_elevators

class CampusDatabase:
    def __init__(self):
        self.buildings: Dict[str, Building] = {}
        self.nodes: Dict[str, CampusNode] = {}
        self.edges: Dict[str, CampusEdge] = {}
        self.elevators: Dict[str, Elevator] = {}
        self.reset_to_default()

    def reset_to_default(self):
        """Resets the campus network to initial default state."""
        self.buildings = {b.id: b for b in get_initial_buildings()}
        self.nodes = {n.id: n for n in get_initial_nodes()}
        self.edges = {e.id: e for e in get_initial_edges()}
        self.elevators = {el.id: el for el in get_initial_elevators()}

    def get_all_buildings(self) -> List[Building]:
        return list(self.buildings.values())

    def get_building(self, building_id: str) -> Optional[Building]:
        return self.buildings.get(building_id)

    def get_all_nodes(self) -> List[CampusNode]:
        return list(self.nodes.values())

    def get_node(self, node_id: str) -> Optional[CampusNode]:
        return self.nodes.get(node_id)

    def get_all_edges(self) -> List[CampusEdge]:
        return list(self.edges.values())

    def get_edge(self, edge_id: str) -> Optional[CampusEdge]:
        return self.edges.get(edge_id)

    def get_all_elevators(self) -> List[Elevator]:
        return list(self.elevators.values())

    def get_elevator(self, elevator_id: str) -> Optional[Elevator]:
        return self.elevators.get(elevator_id)

    def update_elevator_status(self, elevator_id: str, status: str, reason: Optional[str] = None) -> Optional[Elevator]:
        if elevator_id not in self.elevators:
            return None
        elevator = self.elevators[elevator_id]
        elevator.status = status
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %I:%M %p")
        elevator.last_updated = now_str
        if reason:
            elevator.notes = f"{reason} (Updated: {now_str})"
        return elevator

    def update_edge_status(self, edge_id: str, status: str, reason: Optional[str] = None) -> Optional[CampusEdge]:
        if edge_id not in self.edges:
            return None
        edge = self.edges[edge_id]
        edge.status = status
        if reason:
            edge.description = f"{edge.description} [{status.upper()}: {reason}]"
        return edge

    def add_or_update_building(self, building: Building) -> Building:
        self.buildings[building.id] = building
        return building

    def add_or_update_edge(self, edge: CampusEdge) -> CampusEdge:
        self.edges[edge.id] = edge
        return edge

# Singleton instance
db = CampusDatabase()
