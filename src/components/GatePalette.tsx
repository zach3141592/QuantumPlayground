import React from 'react'
import { motion } from 'framer-motion'
import { GateType } from '../types/circuit'

interface GatePaletteProps {
  onGateSelect: (gateType: GateType) => void
}

const gateDefinitions = [
  { type: 'H' as GateType, name: 'Hadamard', description: 'Creates superposition', color: 'from-blue-500 to-blue-600' },
  { type: 'X' as GateType, name: 'Pauli-X', description: 'Quantum NOT gate', color: 'from-red-500 to-red-600' },
  { type: 'Y' as GateType, name: 'Pauli-Y', description: 'Y rotation', color: 'from-green-500 to-green-600' },
  { type: 'Z' as GateType, name: 'Pauli-Z', description: 'Z rotation', color: 'from-purple-500 to-purple-600' },
  { type: 'CNOT' as GateType, name: 'CNOT', description: 'Controlled NOT', color: 'from-yellow-500 to-yellow-600' },
  { type: 'SWAP' as GateType, name: 'SWAP', description: 'Swap qubits', color: 'from-pink-500 to-pink-600' },
  { type: 'RX' as GateType, name: 'RX', description: 'X-axis rotation', color: 'from-indigo-500 to-indigo-600' },
  { type: 'RY' as GateType, name: 'RY', description: 'Y-axis rotation', color: 'from-teal-500 to-teal-600' },
  { type: 'RZ' as GateType, name: 'RZ', description: 'Z-axis rotation', color: 'from-orange-500 to-orange-600' },
  { type: 'PHASE' as GateType, name: 'Phase', description: 'Phase shift', color: 'from-cyan-500 to-cyan-600' },
  { type: 'MEASURE' as GateType, name: 'Measure', description: 'Measure qubit', color: 'from-gray-500 to-gray-600' },
]

const GatePalette: React.FC<GatePaletteProps> = ({ onGateSelect }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white mb-4">Quantum Gates</h2>
      
      <div className="grid grid-cols-2 gap-3">
        {gateDefinitions.map((gate) => (
          <motion.div
            key={gate.type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onGateSelect(gate.type)}
            className={`bg-gradient-to-br ${gate.color} rounded-lg p-3 cursor-pointer shadow-lg border border-white/10 hover:border-white/20 transition-all duration-200`}
          >
            <div className="text-center">
              <div className="text-lg font-bold text-white mb-1">{gate.type}</div>
              <div className="text-xs text-white/80 font-medium">{gate.name}</div>
              <div className="text-xs text-white/60 mt-1">{gate.description}</div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-sm font-medium text-white mb-2">Instructions</h3>
        <p className="text-xs text-gray-300">
          Click on a gate to select it, then click on the circuit canvas to place it.
          Drag gates to move them around the circuit.
        </p>
      </div>
    </div>
  )
}

export default GatePalette 