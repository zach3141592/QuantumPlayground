import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Edit3, Save, RotateCcw } from 'lucide-react'
import { Circuit, Gate } from '../types/circuit'

interface PropertiesPanelProps {
  selectedGate: Gate | null
  onGateUpdate: (gateId: string, updates: Partial<Gate>) => void
  circuit: Circuit
  onCircuitUpdate: (circuit: Circuit) => void
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedGate,
  onGateUpdate,
  circuit,
  onCircuitUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedCircuit, setEditedCircuit] = useState<Circuit>(circuit)

  const handleCircuitUpdate = () => {
    onCircuitUpdate(editedCircuit)
    setIsEditing(false)
  }

  const handleParameterChange = (parameter: string, value: number) => {
    if (!selectedGate) return
    
    onGateUpdate(selectedGate.id, {
      parameters: {
        ...selectedGate.parameters,
        [parameter]: value
      }
    })
  }

  const getGateDescription = (gateType: string) => {
    const descriptions: Record<string, string> = {
      'H': 'Hadamard gate creates superposition states',
      'X': 'Pauli-X gate (quantum NOT) flips the qubit state',
      'Y': 'Pauli-Y gate performs Y-axis rotation',
      'Z': 'Pauli-Z gate performs Z-axis rotation',
      'CNOT': 'Controlled NOT gate with control and target qubits',
      'SWAP': 'SWAP gate exchanges two qubit states',
      'RX': 'Rotation around X-axis by specified angle',
      'RY': 'Rotation around Y-axis by specified angle',
      'RZ': 'Rotation around Z-axis by specified angle',
      'PHASE': 'Phase shift gate',
      'MEASURE': 'Measurement gate collapses the quantum state'
    }
    return descriptions[gateType] || 'Quantum gate'
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white mb-4">Properties</h2>

      {/* Circuit Properties */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Circuit Settings</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-400 hover:text-blue-300"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={editedCircuit.name}
                onChange={(e) => setEditedCircuit({...editedCircuit, name: e.target.value})}
                className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1">Number of Qubits</label>
              <input
                type="number"
                min="1"
                max="10"
                value={editedCircuit.qubits}
                onChange={(e) => setEditedCircuit({...editedCircuit, qubits: parseInt(e.target.value)})}
                className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCircuitUpdate}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
              >
                <Save className="w-4 h-4 inline mr-1" />
                Save
              </button>
              <button
                onClick={() => {
                  setEditedCircuit(circuit)
                  setIsEditing(false)
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm"
              >
                <RotateCcw className="w-4 h-4 inline mr-1" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Name:</span>
              <span className="text-white">{circuit.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Qubits:</span>
              <span className="text-white">{circuit.qubits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Gates:</span>
              <span className="text-white">{circuit.gates.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected Gate Properties */}
      {selectedGate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-700 rounded-lg p-4"
        >
          <h3 className="text-sm font-medium text-white mb-3">Gate Properties</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-300 mb-1">Type</label>
              <div className="text-white font-mono bg-gray-600 px-3 py-2 rounded">
                {selectedGate.type}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1">Qubit</label>
              <div className="text-white font-mono bg-gray-600 px-3 py-2 rounded">
                {selectedGate.qubit}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1">Time Step</label>
              <div className="text-white font-mono bg-gray-600 px-3 py-2 rounded">
                {selectedGate.time}
              </div>
            </div>

            {/* Gate-specific parameters */}
            {['RX', 'RY', 'RZ', 'PHASE'].includes(selectedGate.type) && (
              <div>
                <label className="block text-xs text-gray-300 mb-1">Angle (radians)</label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedGate.parameters.angle || 0}
                  onChange={(e) => handleParameterChange('angle', parseFloat(e.target.value))}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm"
                />
              </div>
            )}

            {selectedGate.type === 'CNOT' && (
              <div>
                <label className="block text-xs text-gray-300 mb-1">Control Qubit</label>
                <input
                  type="number"
                  min="0"
                  max={circuit.qubits - 1}
                  value={selectedGate.controlQubit || 0}
                  onChange={(e) => onGateUpdate(selectedGate.id, { controlQubit: parseInt(e.target.value) })}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm"
                />
              </div>
            )}

            <div className="mt-4 p-3 bg-gray-600 rounded">
              <p className="text-xs text-gray-300">
                {getGateDescription(selectedGate.type)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Circuit Statistics */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-white mb-3">Circuit Statistics</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Total Gates:</span>
            <span className="text-white">{circuit.gates.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Circuit Depth:</span>
            <span className="text-white">
              {circuit.gates.length > 0 
                ? Math.max(...circuit.gates.map(g => g.time)) + 1 
                : 0
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Gate Types:</span>
            <span className="text-white">
              {new Set(circuit.gates.map(g => g.type)).size}
            </span>
          </div>
        </div>
      </div>

      {/* No Selection Message */}
      {!selectedGate && (
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-300">
            Select a gate to view and edit its properties
          </p>
        </div>
      )}
    </div>
  )
}

export default PropertiesPanel 