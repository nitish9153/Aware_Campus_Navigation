import React, { useState } from 'react';
import {
  X,
  Plus,
  Link,
  Trash2,
  RotateCcw,
  Save,
  Download,
  Layers,
  MapPin,
  Move
} from 'lucide-react';
import {
  type SatellitePathNode,
  type SatellitePathEdge,
  calculateEdgeDistanceMeters
} from '../data/mewarSatelliteData';

interface AdminNetworkDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: SatellitePathNode[];
  edges: SatellitePathEdge[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onUpdateNode: (updated: SatellitePathNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onAddEdge: (edge: SatellitePathEdge) => void;
  onDeleteEdge: (edgeId: string) => void;
  onToggleEdgeAccessibility: (edgeId: string) => void;
  onResetNetwork: () => void;
  onSaveNetwork: () => void;
  isAddNodeMode: boolean;
  onToggleAddNodeMode: (active: boolean) => void;
  isConnectMode: boolean;
  onToggleConnectMode: (active: boolean) => void;
  onImportNetwork: (nodes: SatellitePathNode[], edges: SatellitePathEdge[]) => void;
}

export const AdminNetworkDrawer: React.FC<AdminNetworkDrawerProps> = ({
  isOpen,
  onClose,
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onUpdateNode,
  onDeleteNode,
  onAddEdge,
  onDeleteEdge,
  onToggleEdgeAccessibility,
  onResetNetwork,
  onSaveNetwork,
  isAddNodeMode,
  onToggleAddNodeMode,
  isConnectMode,
  onToggleConnectMode,
  onImportNetwork
}) => {
  const [showJsonModal, setShowJsonModal] = useState<boolean>(false);
  const [jsonText, setJsonText] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // New edge form state
  const [targetConnectNodeId, setTargetConnectNodeId] = useState<string>('');
  const [newEdgeDescription, setNewEdgeDescription] = useState<string>('Paved campus road');
  const [newEdgeAccessible, setNewEdgeAccessible] = useState<boolean>(true);

  if (!isOpen) return null;

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;
  const connectedEdges = selectedNode
    ? edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
    : [];

  const handleCreateEdge = () => {
    if (!selectedNode || !targetConnectNodeId || selectedNode.id === targetConnectNodeId) return;
    const targetNode = nodes.find(n => n.id === targetConnectNodeId);
    if (!targetNode) return;

    // Check if edge already exists
    const exists = edges.some(
      e =>
        (e.source === selectedNode.id && e.target === targetConnectNodeId) ||
        (e.source === targetConnectNodeId && e.target === selectedNode.id)
    );
    if (exists) {
      alert('An edge already exists between these two nodes.');
      return;
    }

    const distMeters = calculateEdgeDistanceMeters(selectedNode.position, targetNode.position);
    const newEdge: SatellitePathEdge = {
      id: `e_${selectedNode.id}_${targetConnectNodeId}_${Date.now().toString().slice(-4)}`,
      source: selectedNode.id,
      target: targetConnectNodeId,
      distanceMeters: distMeters,
      isAccessible: newEdgeAccessible,
      description: newEdgeDescription.trim() || 'Verified pedestrian walkway'
    };

    onAddEdge(newEdge);
    onToggleConnectMode(false);
    setTargetConnectNodeId('');
  };

  const handleOpenJsonExport = () => {
    setJsonText(JSON.stringify({ nodes, edges }, null, 2));
    setJsonError(null);
    setShowJsonModal(true);
  };

  const handleApplyJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
        onImportNetwork(parsed.nodes, parsed.edges);
        setShowJsonModal(false);
        setJsonError(null);
      } else {
        setJsonError('Invalid format: JSON must contain "nodes" and "edges" arrays.');
      }
    } catch (e: any) {
      setJsonError(`JSON Syntax Error: ${e.message}`);
    }
  };

  return (
    <div className="absolute top-20 right-4 z-30 w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-auto animate-in fade-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs">
            🛠️
          </div>
          <div>
            <div className="text-xs font-black tracking-wide flex items-center gap-1.5">
              <span>Admin Road Network Editor</span>
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] px-1.5 py-0.2 rounded font-bold">
                ACTIVE
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              {nodes.length} Road Nodes • {edges.length} Path Connections
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Close Admin Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 max-h-[calc(100vh-220px)] overflow-y-auto space-y-4">
        
        {/* Instructions Banner */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" /> Map Network Editing Instructions
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            All road intersections, corners, and building entrances are shown as clickable dots. Drag any dot to align with visible roads. Click to inspect or connect.
          </p>
        </div>

        {/* Primary Tool Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* Add Node Mode Button */}
          <button
            onClick={() => {
              onToggleAddNodeMode(!isAddNodeMode);
              if (isConnectMode) onToggleConnectMode(false);
            }}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
              isAddNodeMode
                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-amber-500/30 ring-2 ring-amber-400'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddNodeMode ? 'Click Map to Place...' : 'Add Road Node'}</span>
          </button>

          {/* Connect Mode Button */}
          <button
            disabled={!selectedNode}
            onClick={() => {
              onToggleConnectMode(!isConnectMode);
              if (isAddNodeMode) onToggleAddNodeMode(false);
            }}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
              isConnectMode
                ? 'bg-cyan-500 text-slate-950 border-cyan-600 ring-2 ring-cyan-400'
                : !selectedNode
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
            title={!selectedNode ? 'Select a node on map first to connect' : 'Connect to another node'}
          >
            <Link className="w-3.5 h-3.5" />
            <span>{isConnectMode ? 'Connecting Mode ON' : 'Connect Selected'}</span>
          </button>
        </div>

        {/* Selected Node Inspector */}
        {selectedNode ? (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-black text-slate-900">Selected Node</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedNode.id}
                </span>
                <button
                  onClick={() => onSelectNode(null)}
                  className="text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200"
                  title="Deselect Node"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Edit Node Name */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Node Name / Label
              </label>
              <input
                type="text"
                value={selectedNode.name}
                onChange={e => onUpdateNode({ ...selectedNode, name: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Coordinates display & Draggable notice */}
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono bg-white p-2 rounded-lg border border-slate-200">
              <div>
                Lat: <span className="font-bold text-slate-900">{selectedNode.position[0]}</span>, Lng: <span className="font-bold text-slate-900">{selectedNode.position[1]}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-blue-600 font-sans font-bold">
                <Move className="w-3 h-3" /> Draggable on Map
              </div>
            </div>

            {/* Building Entrance Toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!selectedNode.isEntrance}
                  onChange={e => onUpdateNode({ ...selectedNode, isEntrance: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Designated Building Entrance</span>
              </label>

              {/* Delete Node Button */}
              <button
                onClick={() => {
                  if (confirm(`Delete node "${selectedNode.name}" and all its connections?`)) {
                    onDeleteNode(selectedNode.id);
                  }
                }}
                className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                title="Delete Node"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>

            {/* Connect Form when Connect Mode is active */}
            {isConnectMode && (
              <div className="mt-3 p-3 bg-cyan-50 border border-cyan-200 rounded-xl space-y-2">
                <div className="text-xs font-bold text-cyan-900 flex items-center gap-1.5">
                  <Link className="w-3 h-3 text-cyan-600" /> Connect to Destination Node:
                </div>
                
                <select
                  value={targetConnectNodeId}
                  onChange={e => setTargetConnectNodeId(e.target.value)}
                  className="w-full bg-white border border-cyan-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 font-medium focus:outline-none"
                >
                  <option value="">Select target node from list or click on map...</option>
                  {nodes
                    .filter(n => n.id !== selectedNode.id)
                    .map(n => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.id})
                      </option>
                    ))}
                </select>

                <input
                  type="text"
                  placeholder="Edge description (e.g. Walkway to Library)"
                  value={newEdgeDescription}
                  onChange={e => setNewEdgeDescription(e.target.value)}
                  className="w-full bg-white border border-cyan-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
                />

                <div className="flex items-center justify-between pt-1">
                  <label className="text-[11px] text-slate-700 flex items-center gap-1.5 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEdgeAccessible}
                      onChange={e => setNewEdgeAccessible(e.target.checked)}
                      className="rounded text-cyan-600 w-3.5 h-3.5"
                    />
                    <span>Step-Free Accessible</span>
                  </label>

                  <button
                    disabled={!targetConnectNodeId}
                    onClick={handleCreateEdge}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      targetConnectNodeId
                        ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Add Connection
                  </button>
                </div>
              </div>
            )}

            {/* Connected Edges List */}
            <div className="pt-2">
              <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Connected Road Edges ({connectedEdges.length})</span>
                <span className="text-[10px] text-slate-400">Click to toggle / delete</span>
              </div>

              {connectedEdges.length === 0 ? (
                <div className="text-[11px] text-slate-400 italic py-1">
                  No road connections yet. Click "Connect Selected" to add one.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {connectedEdges.map(edge => {
                    const otherNodeId = edge.source === selectedNode.id ? edge.target : edge.source;
                    const otherNode = nodes.find(n => n.id === otherNodeId);
                    return (
                      <div
                        key={edge.id}
                        className="p-2 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs gap-2"
                      >
                        <div className="flex-1 truncate">
                          <div className="font-semibold text-slate-800 truncate">
                            {otherNode?.name || otherNodeId}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{edge.distanceMeters}m</span>
                            <button
                              onClick={() => onToggleEdgeAccessibility(edge.id)}
                              className={`px-1 rounded text-[9px] font-bold ${
                                edge.isAccessible
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                              title="Click to toggle wheelchair accessibility"
                            >
                              {edge.isAccessible ? '♿ Step-Free' : '⚠️ Steps/Incline'}
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (confirm('Delete this path connection?')) {
                              onDeleteEdge(edge.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Delete Edge"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 space-y-1">
            <MapPin className="w-5 h-5 mx-auto text-slate-400" />
            <div className="font-semibold text-slate-700">No Node Selected</div>
            <p className="text-[11px] text-slate-400">
              Click any node on the satellite map to edit its position, label, or road connections.
            </p>
          </div>
        )}

        {/* Action Controls: Save, Reset, Import/Export */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={onSaveNetwork}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Network</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Reset network to default verified campus road graph? Custom edits will be lost.')) {
                  onResetNetwork();
                }
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
              title="Reset to default verified network"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <button
            onClick={handleOpenJsonExport}
            className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export / Import Network JSON</span>
          </button>
        </div>

      </div>

      {/* JSON Export/Import Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 space-y-3 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Campus Road Network JSON</span>
              </h3>
              <button
                onClick={() => setShowJsonModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Copy this JSON to backup, or paste valid JSON below and click "Apply JSON" to import.
            </p>

            <textarea
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
              rows={12}
              className="w-full font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />

            {jsonError && (
              <div className="text-xs text-red-600 font-semibold bg-red-50 p-2 rounded-lg">
                {jsonError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(jsonText);
                  alert('Network JSON copied to clipboard!');
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={handleApplyJsonImport}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
              >
                Apply JSON
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
