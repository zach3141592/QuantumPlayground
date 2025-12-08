import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Zap, Target, RotateCcw, ArrowRightLeft, Info, Edit3, Save, X } from 'lucide-react'
import { Circuit, Gate, GateType } from '../types/circuit'

interface PropertiesPanelProps {
  selectedGate: Gate | null
  onGateUpdate: (gateId: string, updates: Partial<Gate>) => void
  circuit: Circuit
  onCircuitUpdate: (circuit: Circuit) => void
}

export default function PropertiesPanel({
  selectedGate,
  onGateUpdate,
  circuit,
  onCircuitUpdate
}: PropertiesPanelProps) {
  const [editingCircuit, setEditingCircuit] = useState(false)
  const [circuitName, setCircuitName] = useState(circuit.name)
  const [circuitQubits, setCircuitQubits] = useState(circuit.qubits)

  const getGateIcon = (gateType: GateType) => {
    const icons = {
      H: 'H',
      X: 'X',
      Y: 'Y',
      Z: 'Z',
      CNOT: '+',
      SWAP: 'S',
      RX: 'Rx',
      RY: 'Ry',
      RZ: 'Rz',
      PHASE: 'P',
      MEASURE: 'M'
    }
    return icons[gateType] || '?'
  }

  const getGateClass = (gateType: GateType) => {
    return `gate-${gateType} bg-neutral-800`
  }

  const getGateDescription = (gateType: GateType) => {
    const descriptions = {
      H: 'Hadamard gate - creates superposition states',
      X: 'Pauli-X gate - performs bit flip operation',
      Y: 'Pauli-Y gate - performs bit and phase flip',
      Z: 'Pauli-Z gate - performs phase flip operation',
      CNOT: 'Controlled-NOT gate - two-qubit entangling operation',
      SWAP: 'SWAP gate - exchanges states between two qubits',
      RX: 'X-axis rotation gate - parameterized rotation around X axis',
      RY: 'Y-axis rotation gate - parameterized rotation around Y axis',
      RZ: 'Z-axis rotation gate - parameterized rotation around Z axis',
      PHASE: 'Phase gate - applies a phase shift',
      MEASURE: 'Measurement gate - collapses quantum state to classical bit'
    }
    return descriptions[gateType] || 'Quantum gate operation'
  }

  const handleCircuitSave = () => {
    const updatedCircuit = {
      ...circuit,
      name: circuitName,
      qubits: circuitQubits
    }
    onCircuitUpdate(updatedCircuit)
    setEditingCircuit(false)
  }

  const handleCircuitCancel = () => {
    setCircuitName(circuit.name)
    setCircuitQubits(circuit.qubits)
    setEditingCircuit(false)
  }

  return (
    <div className="h-full flex flex-col bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      {/* Circuit Properties */}
      <div className="border-b border-neutral-800 bg-neutral-900">
        <div className="p-3 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Circuit Properties</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditingCircuit(!editingCircuit)}
              className="p-1.5 text-neutral-400 hover:text-white rounded transition-colors"
              title={editingCircuit ? 'Cancel editing' : 'Edit circuit'}
            >
              {editingCircuit ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            </motion.button>
          </div>
        </div>
        
        <div className="p-4 bg-black">
          {editingCircuit ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  Circuit Name
                </label>
                <input
                  type="text"
                  value={circuitName}
                  onChange={(e) => setCircuitName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  Number of Qubits
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={circuitQubits}
                  onChange={(e) => setCircuitQubits(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="flex space-x-2 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCircuitSave}
                  className="btn-primary flex-1 text-xs py-1.5"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  <span>Save</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCircuitCancel}
                  className="btn-secondary flex-1 text-xs py-1.5"
                >
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  <span>Cancel</span>
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-neutral-900 border border-neutral-800 rounded">
                <div>
                  <div className="text-[10px] uppercase font-medium text-neutral-500">Name</div>
                  <div className="text-sm text-white font-medium">{circuit.name}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded">
                  <div className="text-[10px] uppercase font-medium text-neutral-500">Qubits</div>
                  <div className="text-sm text-white font-medium">{circuit.qubits}</div>
                </div>
                
                <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded">
                  <div className="text-[10px] uppercase font-medium text-neutral-500">Gates</div>
                  <div className="text-sm text-white font-medium">{circuit.gates.length}</div>
                </div>
              </div>
              
              <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded">
                <div className="text-[10px] uppercase font-medium text-neutral-500">Depth</div>
                <div className="text-sm text-white font-medium">
                  {circuit.gates.length > 0 
                    ? Math.max(...circuit.gates.map(g => g.time)) + 1 
                    : 0}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Gate Properties */}
      {selectedGate && (
        <div className="flex-1 bg-neutral-900 border-t border-neutral-800">
          <div className="p-3 border-b border-neutral-800">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${getGateClass(selectedGate.type)} quantum-gate rounded-md flex items-center justify-center text-white font-bold`}>
                {getGateIcon(selectedGate.type)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{selectedGate.type} Gate</h3>
                <p className="text-xs text-neutral-500">Selected gate properties</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-black space-y-4 h-full overflow-y-auto">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded">
                  <div className="text-[10px] uppercase font-medium text-neutral-500">Type</div>
                  <div className="text-sm text-white font-medium">{selectedGate.type}</div>
                </div>
                
                <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded">
                  <div className="text-[10px] uppercase font-medium text-neutral-500">Qubit</div>
                  <div className="text-sm text-white font-medium">q{selectedGate.qubit}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded">
                  <div className="text-[10px] uppercase font-medium text-neutral-500">Time Step</div>
                  <div className="text-sm text-white font-medium">t{selectedGate.time}</div>
                </div>
                
                <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded">
                  <div className="text-[10px] uppercase font-medium text-neutral-500">ID</div>
                  <div className="text-xs text-neutral-400 font-mono truncate">{selectedGate.id.slice(-6)}</div>
                </div>
              </div>
            </div>
            
            <div className="border border-neutral-800 rounded overflow-hidden">
              <div className="p-2 bg-neutral-900 border-b border-neutral-800">
                <h4 className="text-xs font-semibold text-white flex items-center">
                  <Info className="w-3.5 h-3.5 mr-2 text-neutral-500" />
                  Description
                </h4>
              </div>
              <div className="p-3 bg-black">
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {getGateDescription(selectedGate.type)}
                </p>
              </div>
            </div>
            
            {/* Parameter controls for rotation gates */}
            {(selectedGate.type === 'RX' || selectedGate.type === 'RY' || selectedGate.type === 'RZ') && (
              <div className="border border-neutral-800 rounded overflow-hidden">
                <div className="p-2 bg-neutral-900 border-b border-neutral-800">
                  <h4 className="text-xs font-semibold text-white">Parameters</h4>
                </div>
                <div className="p-3 bg-black">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                        Angle (θ)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={selectedGate.parameters.angle || 0}
                        onChange={(e) => onGateUpdate(selectedGate.id, {
                          parameters: { ...selectedGate.parameters, angle: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Circuit Statistics */}
      <div className="border-t border-neutral-800 bg-neutral-900">
        <div className="p-3 border-b border-neutral-800">
          <h3 className="text-xs font-semibold text-white flex items-center uppercase tracking-wide">
            <Target className="w-3.5 h-3.5 mr-2 text-neutral-500" />
            Circuit Statistics
          </h3>
        </div>
        <div className="p-3 bg-black space-y-2">
          <div className="flex items-center justify-between p-2 rounded border border-neutral-800/50 hover:border-neutral-700 transition-colors">
            <span className="text-xs text-neutral-400">Total Gates</span>
            <span className="text-xs text-white font-medium">{circuit.gates.length}</span>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded border border-neutral-800/50 hover:border-neutral-700 transition-colors">
            <span className="text-xs text-neutral-400">Circuit Depth</span>
            <span className="text-xs text-white font-medium">
              {circuit.gates.length > 0 ? Math.max(...circuit.gates.map(g => g.time)) + 1 : 0}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded border border-neutral-800/50 hover:border-neutral-700 transition-colors">
            <span className="text-xs text-neutral-400">Single Qubit</span>
            <span className="text-xs text-white font-medium">
              {circuit.gates.filter(g => !['CNOT', 'SWAP'].includes(g.type)).length}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded border border-neutral-800/50 hover:border-neutral-700 transition-colors">
            <span className="text-xs text-neutral-400">Multi Qubit</span>
            <span className="text-xs text-white font-medium">
              {circuit.gates.filter(g => ['CNOT', 'SWAP'].includes(g.type)).length}
            </span>
          </div>
        </div>
      </div>

      {/* No Gate Selected - Only show if not selected to fill space */}
      {!selectedGate && (
        <div className="flex-1 bg-black flex items-center justify-center p-6 border-t border-neutral-800">
          <div className="text-center">
            <div className="text-neutral-500 mb-2 text-sm">Select a gate on the canvas</div>
            <div className="text-xs text-neutral-600">
              Click on any gate to view and edit its properties
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
