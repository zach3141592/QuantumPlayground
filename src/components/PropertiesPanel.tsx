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
      CNOT: '⊕',
      SWAP: '⇄',
      RX: 'Rx',
      RY: 'Ry',
      RZ: 'Rz',
      PHASE: 'θ',
      MEASURE: 'M'
    }
    return icons[gateType] || '?'
  }

  const getGateColor = (gateType: GateType) => {
    const colors = {
      H: 'bg-blue-500',
      X: 'bg-red-500',
      Y: 'bg-green-500',
      Z: 'bg-purple-500',
      CNOT: 'bg-amber-500',
      SWAP: 'bg-pink-500',
      RX: 'bg-indigo-500',
      RY: 'bg-teal-500',
      RZ: 'bg-orange-500',
      PHASE: 'bg-cyan-500',
      MEASURE: 'bg-slate-500'
    }
    return colors[gateType] || 'bg-slate-500'
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
    <div className="h-full flex flex-col">
      {/* Circuit Properties */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">Circuit Properties</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditingCircuit(!editingCircuit)}
              className="btn-secondary p-2"
              title={editingCircuit ? 'Cancel editing' : 'Edit circuit'}
            >
              {editingCircuit ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
        
        <div className="panel-body space-y-4">
          {editingCircuit ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Circuit Name
                </label>
                <input
                  type="text"
                  value={circuitName}
                  onChange={(e) => setCircuitName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Number of Qubits
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={circuitQubits}
                  onChange={(e) => setCircuitQubits(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCircuitSave}
                  className="btn-success flex-1 flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCircuitCancel}
                  className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-slate-300">Name</div>
                  <div className="text-slate-100">{circuit.name}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-slate-300">Qubits</div>
                  <div className="text-slate-100">{circuit.qubits}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-slate-300">Gates</div>
                  <div className="text-slate-100">{circuit.gates.length}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-slate-300">Depth</div>
                  <div className="text-slate-100">
                    {circuit.gates.length > 0 
                      ? Math.max(...circuit.gates.map(g => g.time)) + 1 
                      : 0}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Gate Properties */}
      {selectedGate && (
        <div className="panel">
          <div className="panel-header">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${getGateColor(selectedGate.type)} rounded-lg flex items-center justify-center text-white font-bold`}>
                {getGateIcon(selectedGate.type)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">{selectedGate.type} Gate</h3>
                <p className="text-sm text-slate-400">Selected gate properties</p>
              </div>
            </div>
          </div>
          
          <div className="panel-body space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-slate-300">Type</div>
                  <div className="text-slate-100">{selectedGate.type}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-slate-300">Qubit</div>
                  <div className="text-slate-100">q{selectedGate.qubit}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-slate-300">Time Step</div>
                  <div className="text-slate-100">t{selectedGate.time}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-slate-300">Gate ID</div>
                  <div className="text-slate-100 font-mono text-xs">{selectedGate.id}</div>
                </div>
              </div>
            </div>
            
            <div className="panel">
              <div className="panel-header">
                <h4 className="text-sm font-semibold text-slate-100 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Description
                </h4>
              </div>
              <div className="panel-body">
                <p className="text-sm text-slate-300">
                  {getGateDescription(selectedGate.type)}
                </p>
              </div>
            </div>
            
            {/* Parameter controls for rotation gates */}
            {(selectedGate.type === 'RX' || selectedGate.type === 'RY' || selectedGate.type === 'RZ') && (
              <div className="panel">
                <div className="panel-header">
                  <h4 className="text-sm font-semibold text-slate-100">Parameters</h4>
                </div>
                <div className="panel-body">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Angle (θ)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={selectedGate.parameters.angle || 0}
                        onChange={(e) => onGateUpdate(selectedGate.id, {
                          parameters: { ...selectedGate.parameters, angle: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      <div className="panel">
        <div className="panel-header">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Circuit Statistics
          </h3>
        </div>
        <div className="panel-body">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
              <span className="text-sm text-slate-300">Total Gates</span>
              <span className="text-slate-100 font-medium">{circuit.gates.length}</span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
              <span className="text-sm text-slate-300">Circuit Depth</span>
              <span className="text-slate-100 font-medium">
                {circuit.gates.length > 0 ? Math.max(...circuit.gates.map(g => g.time)) + 1 : 0}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
              <span className="text-sm text-slate-300">Single Qubit</span>
              <span className="text-slate-100 font-medium">
                {circuit.gates.filter(g => !['CNOT', 'SWAP'].includes(g.type)).length}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
              <span className="text-sm text-slate-300">Multi Qubit</span>
              <span className="text-slate-100 font-medium">
                {circuit.gates.filter(g => ['CNOT', 'SWAP'].includes(g.type)).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* No Gate Selected */}
      {!selectedGate && (
        <div className="panel">
          <div className="panel-header">
            <h3 className="text-sm font-semibold text-slate-100">No Gate Selected</h3>
          </div>
          <div className="panel-body">
            <div className="text-center py-8">
              <div className="text-slate-400 mb-2">Select a gate on the canvas</div>
              <div className="text-xs text-slate-500">
                Click on any gate to view and edit its properties
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 