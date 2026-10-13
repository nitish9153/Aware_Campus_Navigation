import math
import heapq

nodes = {
    'node_ent_sanga': {'name': 'Sanga Hostel Entrance', 'pos': [1441, 420]},
    'node_ent_kumba': {'name': 'Kumba Hostel Entrance', 'pos': [1276, 442]},
    'node_ent_hospital': {'name': 'Hospital Entrance', 'pos': [1406, 245]},
    'node_ent_girls': {'name': 'Girls Hostel Entrance', 'pos': [1346, 150]},
    'node_gate_1': {'name': 'Gate No. 1', 'pos': [1226, 135]},
    'node_ent_mewar': {'name': 'Mewar University Main Building Entrance', 'pos': [1106, 270]},
    'node_ent_gandhi': {'name': 'Gandhi Museum Entrance', 'pos': [926, 380]},
    'node_gate_2': {'name': 'Gate No. 2', 'pos': [821, 320]},
    'node_ent_mess': {'name': 'Mess Entrance', 'pos': [866, 620]},
    'node_ent_law': {'name': 'Law Block Entrance', 'pos': [791, 750]},
    'node_ent_fb': {'name': 'Football Ground Pavilion', 'pos': [707, 488]},
    'node_ent_cricket': {'name': 'Cricket Ground Pavilion', 'pos': [416, 580]},
    'node_ent_gym': {'name': 'Gym Entrance', 'pos': [454, 796]},

    'node_hwy_n': {'name': 'West Highway North Apex', 'pos': [1436, 60]},
    'node_hwy_g1': {'name': 'West Highway at Gate 1', 'pos': [1226, 70]},
    'node_hwy_mid': {'name': 'West Highway Mid Junction', 'pos': [1016, 140]},
    'node_hwy_g2': {'name': 'West Highway at Gate 2', 'pos': [821, 200]},
    'node_hwy_fb': {'name': 'West Highway beside Football', 'pos': [676, 260]},
    'node_hwy_cricket': {'name': 'West Highway beside Cricket', 'pos': [416, 360]},
    'node_hwy_s': {'name': 'West Highway South Apex', 'pos': [186, 440]},

    'node_rd_g1_avenue': {'name': 'Gate 1 Campus Boulevard', 'pos': [1226, 180]},
    'node_rd_girls_approach': {'name': 'Girls Hostel Approach Road', 'pos': [1306, 150]},
    'node_rd_hosp_junc': {'name': 'Hospital North-West Junction', 'pos': [1396, 245]},
    'node_rd_north_avenue_mid': {'name': 'North Avenue East of Hospital', 'pos': [1396, 340]},
    'node_rd_sanga_approach': {'name': 'Sanga Hostel Approach Road', 'pos': [1396, 420]},
    'node_rd_kumba_approach': {'name': 'Kumba Hostel Approach Road', 'pos': [1276, 380]},
    'node_rd_north_south_spine': {'name': 'North-South Academic Spine (North)', 'pos': [1176, 380]},

    'node_rd_univ_west_drive': {'name': 'University West Concourse', 'pos': [1096, 350]},
    'node_rd_g2_concourse': {'name': 'Gate 2 Inbound Concourse', 'pos': [876, 350]},
    'node_rd_museum_approach': {'name': 'Gandhi Museum Concourse', 'pos': [926, 350]},
    'node_rd_central_crossroads': {'name': 'Central Campus Crossroads', 'pos': [876, 460]},
    'node_rd_mess_approach': {'name': 'Avenue at Mess Entrance', 'pos': [866, 550]},
    'node_rd_law_approach': {'name': 'Law Block Approach Walkway', 'pos': [826, 680]},

    'node_rd_fb_north': {'name': 'Football Ground North Perimeter', 'pos': [796, 460]},
    'node_rd_fb_west': {'name': 'Football Ground West Perimeter', 'pos': [707, 400]},
    'node_rd_fb_east': {'name': 'Football Ground East Perimeter', 'pos': [707, 580]},
    'node_rd_fb_south': {'name': 'Football Ground South Perimeter', 'pos': [616, 500]},
    'node_rd_cricket_north': {'name': 'Cricket Ground North Perimeter', 'pos': [476, 540]},
    'node_rd_cricket_west': {'name': 'Cricket Ground West Perimeter', 'pos': [416, 460]},
    'node_rd_cricket_east': {'name': 'Cricket Ground East Perimeter', 'pos': [416, 700]},
    'node_rd_gym_approach': {'name': 'Gymnasium Approach Walkway', 'pos': [454, 730]}
}

edges = [
    ('node_hwy_n', 'node_hwy_g1', 'West Highway North to Gate 1'),
    ('node_hwy_g1', 'node_hwy_mid', 'West Highway past Gate 1'),
    ('node_hwy_mid', 'node_hwy_g2', 'West Highway approaching Gate 2'),
    ('node_hwy_g2', 'node_hwy_fb', 'West Highway beside Football Field'),
    ('node_hwy_fb', 'node_hwy_cricket', 'West Highway beside Cricket Stadium'),
    ('node_hwy_cricket', 'node_hwy_s', 'West Highway Southern stretch'),

    ('node_hwy_g1', 'node_gate_1', 'Turn into Gate No. 1'),
    ('node_gate_1', 'node_rd_g1_avenue', 'Gate 1 Entrance Portal'),
    ('node_rd_g1_avenue', 'node_rd_girls_approach', 'Boulevard towards Girls Hostel'),
    ('node_rd_girls_approach', 'node_ent_girls', 'Girls Hostel Entrance Walkway'),
    ('node_rd_girls_approach', 'node_rd_hosp_junc', 'Paved Road to Hospital'),
    ('node_rd_hosp_junc', 'node_ent_hospital', 'Hospital Entrance Drive'),
    ('node_rd_hosp_junc', 'node_rd_north_avenue_mid', 'Avenue between Hospital and Hostels'),
    ('node_rd_north_avenue_mid', 'node_rd_sanga_approach', 'Road to Sanga Hostel'),
    ('node_rd_sanga_approach', 'node_ent_sanga', 'Sanga Hostel Entrance Walkway'),
    ('node_rd_sanga_approach', 'node_rd_kumba_approach', 'Connecting Road between Hostels'),
    ('node_rd_kumba_approach', 'node_ent_kumba', 'Kumba Hostel Entrance Walkway'),
    ('node_rd_kumba_approach', 'node_rd_north_south_spine', 'Road heading south towards University'),

    ('node_rd_north_south_spine', 'node_rd_univ_west_drive', 'Spine Avenue along University facade'),
    ('node_rd_univ_west_drive', 'node_ent_mewar', 'Mewar University Main Entrance Ramp'),
    ('node_rd_univ_west_drive', 'node_rd_museum_approach', 'Boulevard towards Gandhi Museum'),
    ('node_rd_museum_approach', 'node_ent_gandhi', 'Gandhi Museum Entrance Walkway'),
    ('node_rd_museum_approach', 'node_rd_g2_concourse', 'Avenue towards Gate 2'),
    ('node_gate_2', 'node_rd_g2_concourse', 'Gate No. 2 Entry Portal'),
    ('node_hwy_g2', 'node_gate_2', 'Turn from Highway into Gate 2'),
    ('node_rd_g2_concourse', 'node_rd_central_crossroads', 'Boulevard towards Central Crossroads'),
    ('node_rd_central_crossroads', 'node_rd_mess_approach', 'Avenue towards Mess and Law Block'),
    ('node_rd_mess_approach', 'node_ent_mess', 'Mess Main Entrance Walkway'),
    ('node_rd_mess_approach', 'node_rd_law_approach', 'Paved Avenue to Law Block'),
    ('node_rd_law_approach', 'node_ent_law', 'Law Block Entrance Ramp'),

    ('node_rd_central_crossroads', 'node_rd_fb_north', 'Road towards Football Ground'),
    ('node_rd_fb_north', 'node_rd_fb_west', 'Football Ground West Promenade'),
    ('node_rd_fb_north', 'node_rd_fb_east', 'Football Ground East Promenade'),
    ('node_rd_fb_west', 'node_ent_fb', 'Football Ground West Gate'),
    ('node_rd_fb_west', 'node_rd_fb_south', 'Football Ground South-West Perimeter'),
    ('node_rd_fb_east', 'node_rd_fb_south', 'Football Ground South-East Perimeter'),
    ('node_rd_fb_south', 'node_rd_cricket_north', 'Connecting Avenue towards Cricket Ground'),
    ('node_rd_cricket_north', 'node_ent_cricket', 'Cricket Ground Pavilion Entrance'),
    ('node_rd_cricket_north', 'node_rd_cricket_west', 'Cricket Ground West Perimeter'),
    ('node_rd_cricket_north', 'node_rd_cricket_east', 'Cricket Ground East Perimeter'),
    ('node_rd_cricket_west', 'node_hwy_cricket', 'Exit from Cricket Ground to West Highway'),
    ('node_rd_cricket_east', 'node_rd_gym_approach', 'Avenue heading to Gymnasium'),
    ('node_rd_gym_approach', 'node_ent_gym', 'Gym Entrance Ramp')
]

adj = {k: [] for k in nodes}
for s, t, desc in edges:
    d = math.hypot(nodes[s]['pos'][0] - nodes[t]['pos'][0], nodes[s]['pos'][1] - nodes[t]['pos'][1]) * 0.45
    d = max(5, round(d))
    adj[s].append((t, d, desc))
    adj[t].append((s, d, desc))

def route(start, dest):
    pq = [(0, start, [start])]
    visited = set()
    while pq:
        dist, curr, path = heapq.heappop(pq)
        if curr == dest:
            return dist, path
        if curr in visited:
            continue
        visited.add(curr)
        for nxt, weight, _ in adj[curr]:
            if nxt not in visited:
                heapq.heappush(pq, (dist + weight, nxt, path + [nxt]))
    return None, []

test_pairs = [
    ('node_ent_sanga', 'node_ent_mess', '1. Sanga Hostel -> Mess'),
    ('node_gate_1', 'node_ent_law', '2. Gate No. 1 -> Law Block'),
    ('node_ent_girls', 'node_ent_hospital', '3. Girls Hostel -> Hospital'),
    ('node_ent_mewar', 'node_ent_cricket', '4. Main Building -> Cricket Ground'),
    ('node_ent_kumba', 'node_ent_gym', '5. Kumba Hostel -> Gym'),
    ('node_gate_2', 'node_ent_fb', '6. Gate No. 2 -> Football Ground'),
    ('node_ent_law', 'node_ent_gym', '7. Law Block -> Gym')
]

for s, d, label in test_pairs:
    dist, path = route(s, d)
    path_str = " -> ".join(path)
    print(f'{label}: dist={dist}m, nodes={len(path)}: {path_str}')
