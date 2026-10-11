"""
Routing Graph and Dijkstra Algorithm with Accessibility Multi-Criteria Optimization
"""

from typing import Dict, List, Tuple, Optional, Set
import heapq
import math
from .models import CampusNode, CampusEdge, RoutePreference, RouteStep, RouteResponse
from .database import CampusDatabase

class CampusRoutingEngine:
    def __init__(self, db: CampusDatabase):
        self.db = db

    def _build_adjacency_list(self) -> Dict[str, List[Tuple[str, CampusEdge, bool]]]:
        """
        Builds adjacency list:
        node_id -> list of (neighbor_node_id, edge, is_forward)
        """
        adj: Dict[str, List[Tuple[str, CampusEdge, bool]]] = {}
        for node_id in self.db.nodes:
            adj[node_id] = []

        for edge in self.db.edges.values():
            src = edge.source
            tgt = edge.target

            if src not in adj:
                adj[src] = []
            if tgt not in adj:
                adj[tgt] = []

            # Forward direction
            adj[src].append((tgt, edge, True))

            # Reverse direction if bidirectional
            if edge.direction == "bidirectional":
                adj[tgt].append((src, edge, False))

        return adj

    def calculate_route(
        self,
        start_node_id: str,
        dest_node_id: str,
        pref: RoutePreference
    ) -> RouteResponse:
        """
        Calculates the best route from start_node_id to dest_node_id respecting preferences.
        """
        # Validate nodes exist
        start_node = self.db.get_node(start_node_id)
        dest_node = self.db.get_node(dest_node_id)

        if not start_node or not dest_node:
            return RouteResponse(
                success=False,
                status_code="INVALID_NODES",
                message="Start or destination location does not exist in the campus database.",
                start_node=start_node_id,
                destination_node=dest_node_id
            )

        if start_node_id == dest_node_id:
            return RouteResponse(
                success=True,
                status_code="SAME_LOCATION",
                message="You are already at your destination.",
                start_node=start_node_id,
                destination_node=dest_node_id,
                total_distance_m=0.0,
                nodes=[start_node.model_dump()],
                path_node_ids=[start_node_id],
                coordinates=[[start_node.lat, start_node.lng]]
            )

        adj = self._build_adjacency_list()

        # Step 1: Run Dijkstra with strict preference filters
        strict_result = self._dijkstra(
            start_node_id,
            dest_node_id,
            adj,
            pref,
            allow_relaxed=False
        )

        # Also calculate the unconstrained fastest route for comparison
        unconstrained_pref = RoutePreference(
            avoid_stairs=False,
            step_free_only=False,
            prefer_ramps=False,
            avoid_unavailable_elevators=False,
            allow_unverified_accessible=True
        )
        fastest_result = self._dijkstra(
            start_node_id,
            dest_node_id,
            adj,
            unconstrained_pref,
            allow_relaxed=True
        )

        fastest_distance = fastest_result["total_distance"] if fastest_result else None
        fastest_stairs = fastest_result["total_stairs"] if fastest_result else None

        # Check if strict route succeeded
        if strict_result:
            return self._build_response(
                start_node,
                dest_node,
                strict_result,
                pref,
                is_relaxed_fallback=False,
                fastest_distance=fastest_distance,
                fastest_stairs=fastest_stairs
            )

        # If strict search failed (e.g. step_free_only was requested but route has stairs, or elevator is down):
        # Run relaxed search to see if any physical route exists
        relaxed_pref = RoutePreference(
            avoid_stairs=False,
            step_free_only=False,
            prefer_ramps=pref.prefer_ramps,
            avoid_unavailable_elevators=pref.avoid_unavailable_elevators,
            allow_unverified_accessible=True
        )
        relaxed_result = self._dijkstra(
            start_node_id,
            dest_node_id,
            adj,
            relaxed_pref,
            allow_relaxed=True
        )

        if relaxed_result:
            # We found a path, but it violates the strict accessibility constraints
            return self._build_response(
                start_node,
                dest_node,
                relaxed_result,
                pref,
                is_relaxed_fallback=True,
                fastest_distance=fastest_distance,
                fastest_stairs=fastest_stairs
            )

        # No route found at all (e.g., isolated building, completely blocked paths)
        return RouteResponse(
            success=False,
            status_code="NO_ROUTE",
            message="No pathway could be found connecting these locations. Paths may be blocked or disconnected.",
            start_node=start_node_id,
            destination_node=dest_node_id
        )

    def _dijkstra(
        self,
        start_id: str,
        dest_id: str,
        adj: Dict[str, List[Tuple[str, CampusEdge, bool]]],
        pref: RoutePreference,
        allow_relaxed: bool
    ) -> Optional[Dict]:
        """
        Dijkstra shortest path algorithm with multi-criteria accessibility cost weighting.
        """
        # Priority queue entries: (cost, current_node_id, path_edges)
        pq: List[Tuple[float, str, List[CampusEdge]]] = [(0.0, start_id, [])]
        best_cost: Dict[str, float] = {start_id: 0.0}

        while pq:
            curr_cost, curr_node, path = heapq.heappop(pq)

            if curr_cost > best_cost.get(curr_node, float('inf')):
                continue

            if curr_node == dest_id:
                # Reconstruct stats
                total_dist = sum(e.distance_m for e in path)
                total_stairs = sum(e.stair_count for e in path)
                ramps_count = sum(1 for e in path if e.ramp_available)
                elevators = [e.elevator_id for e in path if e.elevator_dependent and e.elevator_id]
                node_ids = [start_id]
                for edge in path:
                    # Next node is either edge.target or edge.source depending on direction
                    last_node = node_ids[-1]
                    next_node = edge.target if edge.source == last_node else edge.source
                    node_ids.append(next_node)

                return {
                    "cost": curr_cost,
                    "total_distance": round(total_dist, 1),
                    "total_stairs": total_stairs,
                    "ramps_count": ramps_count,
                    "elevators": elevators,
                    "edges": path,
                    "node_ids": node_ids
                }

            for neighbor, edge, is_forward in adj.get(curr_node, []):
                # 1. Blocked or Maintenance check
                if edge.status != "open":
                    continue

                # 2. Elevator dependency and status check
                if edge.elevator_dependent and edge.elevator_id:
                    elevator = self.db.get_elevator(edge.elevator_id)
                    if elevator and elevator.status != "operational":
                        # Elevator is out of service or under maintenance
                        if pref.avoid_unavailable_elevators:
                            continue

                # 3. Stairs and Step-Free constraints
                if not allow_relaxed:
                    if pref.step_free_only and (edge.stairs or edge.stair_count > 0):
                        continue
                    if not pref.allow_unverified_accessible and not edge.verified_accessible:
                        continue
                    if edge.slope_grade > pref.max_slope_grade and not edge.elevator_dependent:
                        continue

                # Cost Calculation
                edge_cost = edge.distance_m

                # Add penalty for stairs if avoid_stairs is active (when stairs are permitted)
                if pref.avoid_stairs and edge.stairs:
                    edge_cost += (edge.stair_count * 25.0) + 200.0

                # Ramp preference discount
                if pref.prefer_ramps and edge.ramp_available:
                    edge_cost *= 0.88  # 12% route weight bonus for ramps

                # Tactile paving preference bonus
                if pref.tactile_paving_priority and edge.tactile_paving:
                    edge_cost *= 0.85

                # Moderate penalty for steep inclines
                if edge.slope_grade > 4.5 and not edge.elevator_dependent:
                    edge_cost += (edge.distance_m * (edge.slope_grade / 100.0) * 1.5)

                new_cost = curr_cost + edge_cost

                if new_cost < best_cost.get(neighbor, float('inf')):
                    best_cost[neighbor] = new_cost
                    new_path = list(path)
                    new_path.append(edge)
                    heapq.heappush(pq, (new_cost, neighbor, new_path))

        return None

    def _build_response(
        self,
        start_node: CampusNode,
        dest_node: CampusNode,
        dijkstra_res: Dict,
        pref: RoutePreference,
        is_relaxed_fallback: bool,
        fastest_distance: Optional[float],
        fastest_stairs: Optional[int]
    ) -> RouteResponse:
        path_edges: List[CampusEdge] = dijkstra_res["edges"]
        node_ids: List[str] = dijkstra_res["node_ids"]
        total_distance = dijkstra_res["total_distance"]
        total_stairs = dijkstra_res["total_stairs"]
        ramps_count = dijkstra_res["ramps_count"]
        elevators = dijkstra_res["elevators"]

        # Calculate estimated speeds
        # Average walking: 1.2 m/s -> 72 m/min
        # Wheelchair / cautious mobility: 0.9 m/s -> 54 m/min
        walk_min = round(total_distance / 72.0, 1)
        wheelchair_min = round(total_distance / 54.0, 1)
        if walk_min < 1.0:
            walk_min = 1.0
        if wheelchair_min < 1.0:
            wheelchair_min = 1.0

        # Construct node objects and leaflet coordinates
        nodes_data = []
        coordinates = []
        for nid in node_ids:
            n = self.db.get_node(nid)
            if n:
                nodes_data.append(n.model_dump())
                coordinates.append([n.lat, n.lng])

        # Generate step-by-step turn instructions & warnings
        steps: List[RouteStep] = []
        warnings: List[str] = []

        is_step_free = (total_stairs == 0)
        is_verified_accessible = all(e.verified_accessible for e in path_edges)

        if is_relaxed_fallback:
            if pref.step_free_only and total_stairs > 0:
                warnings.append(
                    f"⚠️ Strict step-free path unavailable! Alternative route contains {total_stairs} steps."
                )
            if not is_verified_accessible:
                warnings.append(
                    "⚠️ Notice: This calculated route contains segments not yet audited for accessibility compliance."
                )

        # Inspect elevator dependencies in path
        for elev_id in elevators:
            el = self.db.get_elevator(elev_id)
            if el:
                if el.status == "operational":
                    warnings.append(f"ℹ️ Uses Elevator {el.name} (Operating normally).")
                else:
                    warnings.append(f"⚠️ Warning: Elevator {el.name} is currently {el.status}!")

        for idx, edge in enumerate(path_edges):
            u_id = node_ids[idx]
            v_id = node_ids[idx + 1]
            u_node = self.db.get_node(u_id)
            v_node = self.db.get_node(v_id)

            u_name = u_node.name if u_node else u_id
            v_name = v_node.name if v_node else v_id

            step_warnings = []
            if edge.stairs:
                instruction = f"Ascend/descend stairs ({edge.stair_count} steps) along {edge.description} to {v_name}."
                step_warnings.append(f"Stairs present: {edge.stair_count} steps.")
            elif edge.elevator_dependent:
                instruction = f"Take Elevator ({edge.elevator_id}) to {v_name}."
            elif edge.ramp_available:
                instruction = f"Follow accessible ramp ({edge.slope_grade}% grade) along {edge.description} to {v_name}."
            else:
                instruction = f"Proceed along {edge.description} to {v_name} ({round(edge.distance_m)}m)."

            if edge.slope_grade >= 5.0 and not edge.elevator_dependent:
                step_warnings.append(f"Steep slope: {edge.slope_grade}%.")

            if not edge.verified_accessible:
                step_warnings.append("Unverified accessibility segment.")

            steps.append(
                RouteStep(
                    step_number=idx + 1,
                    from_node_id=u_id,
                    from_node_name=u_name,
                    to_node_id=v_id,
                    to_node_name=v_name,
                    instruction=instruction,
                    distance_m=round(edge.distance_m, 1),
                    edge_id=edge.id,
                    stairs=edge.stairs,
                    stair_count=edge.stair_count,
                    ramp=edge.ramp_available,
                    slope_grade=edge.slope_grade,
                    elevator_used=edge.elevator_id if edge.elevator_dependent else None,
                    surface=edge.surface_type,
                    warnings=step_warnings
                )
            )

        status_code = "PARTIAL_ACCESSIBLE" if is_relaxed_fallback else "OK"
        message = (
            "Accessible route calculated successfully."
            if not is_relaxed_fallback
            else "Notice: No strictly step-free route found. Showing the lowest-barrier alternative."
        )

        # Alternative summary
        alt_summary = None
        if fastest_distance is not None and abs(fastest_distance - total_distance) > 5.0:
            diff = round(total_distance - fastest_distance, 1)
            alt_summary = (
                f"Accessible route is {diff}m longer than direct route, but avoids {fastest_stairs or 0} stairs."
            )

        return RouteResponse(
            success=True,
            status_code=status_code,
            message=message,
            start_node=start_node.id,
            destination_node=dest_node.id,
            total_distance_m=total_distance,
            estimated_walking_min=walk_min,
            estimated_wheelchair_min=wheelchair_min,
            is_step_free=is_step_free,
            is_verified_accessible=is_verified_accessible,
            total_stair_count=total_stairs,
            ramps_used=ramps_count,
            elevators_used=elevators,
            nodes=nodes_data,
            path_node_ids=node_ids,
            path_edges=path_edges,
            coordinates=coordinates,
            steps=steps,
            warnings=warnings,
            has_alternative_calculated=(alt_summary is not None),
            alternative_summary=alt_summary,
            fastest_distance_m=fastest_distance,
            fastest_stair_count=fastest_stairs
        )
