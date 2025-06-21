import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Move } from 'lucide-react'
import { Circuit, Gate, GateType } from '../types/circuit'

interface CircuitCanvasProps {
  circuit: Circuit
  onGateAdd: (gateType: GateType, qubit: number, time: number) => void
  onGateRemove: (gateId: string) => void
  onGateSelect: (gate: Gate | null) => void
  selectedGate: Gate | null
  selectedGateType: GateType | null
  onGateTypeSelect: (gateType: GateType | null) => void
}

const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  circuit,
  onGateAdd,
  onGateRemove,
  onGateSelect,
  selectedGate,
  selectedGateType,
  onGateTypeSelect
}) => {
  const [dragInfo, setDragInfo] = useState<{ gate: Gate; startX: number; startY: number } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!selectedGateType || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Convert pixel coordinates to grid coordinates
    const gridSize = 80
    const time = Math.floor(x / gridSize)
    const qubit = Math.floor(y / gridSize)

    if (qubit >= 0 && qubit < circuit.qubits && time >= 0) {
      onGateAdd(selectedGateType, qubit, time)
      onGateTypeSelect(null) // Clear selection after placing
    }
  }

  const handleGateClick = (gate: Gate) => {
    onGateSelect(gate)
  }

  const handleGateDragStart = (e: React.MouseEvent, gate: Gate) => {
    setDragInfo({ gate, startX: e.clientX, startY: e.clientY })
  }

  const handleGateDragEnd = () => {
    setDragInfo(null)
  }

  const getGateColor = (gateType: GateType) => {
    const colors: Record<GateType, string> = {
      'H': 'bg-blue-500',
      'X': 'bg-red-500',
      'Y': 'bg-green-500',
      'Z': 'bg-purple-500',
      'CNOT': 'bg-yellow-500',
      'SWAP': 'bg-pink-500',
      'RX': 'bg-indigo-500',
      'RY': 'bg-teal-500',
      'RZ': 'bg-orange-500',
      'PHASE': 'bg-cyan-500',
      'MEASURE': 'bg-gray-500'
    }
    return colors[gateType]
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-2">Circuit: {circuit.name}</h2>
        <div className="flex items-center space-x-4 text-sm text-gray-300">
          <span>Qubits: {circuit.qubits}</span>
          <span>Gates: {circuit.gates.length}</span>
          {selectedGateType && (
            <span className="text-blue-400">Selected: {selectedGateType}</span>
          )}
        </div>
      </div>

      <div 
        ref={canvasRef}
        className="flex-1 bg-gray-800 rounded-lg border-2 border-gray-600 circuit-grid relative overflow-auto"
        onClick={handleCanvasClick}
      >
        {/* Qubit lines */}
        {Array.from({ length: circuit.qubits }).map((_, qubit) => (
          <div
            key={qubit}
            className="absolute left-0 right-0 h-1 bg-gray-600"
            style={{ top: `${qubit * 80 + 40}px` }}
          />
        ))}

        {/* Time markers */}
        {Array.from({ length: 20 }).map((_, time) => (
          <div
            key={time}
            className="absolute top-0 bottom-0 w-1 bg-gray-600"
            style={{ left: `${time * 80 + 40}px` }}
          />
        ))}

        {/* Gates */}
        {circuit.gates.map((gate) => (
          <motion.div
            key={gate.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute ${getGateColor(gate.type)} rounded-lg p-2 cursor-pointer shadow-lg border-2 ${
              selectedGate?.id === gate.id ? 'border-white' : 'border-transparent'
            }`}
            style={{
              left: `${gate.time * 80 + 20}px`,
              top: `${gate.qubit * 80 + 20}px`,
              width: '40px',
              height: '40px'
            }}
            onClick={() => handleGateClick(gate)}
            onMouseDown={(e) => handleGateDragStart(e, gate)}
            onMouseUp={handleGateDragEnd}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="flex items-center justify-center h-full">
              <span className="text-white font-bold text-sm">{gate.type}</span>
            </div>
            
            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onGateRemove(gate.id)
              }}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3 h-3 text-white" />
            </button>
          </motion.div>
        ))}

        {/* Grid labels */}
        <div className="absolute left-0 top-0 w-16 h-full bg-gray-700/50">
          {Array.from({ length: circuit.qubits }).map((_, qubit) => (
            <div
              key={qubit}
              className="absolute text-xs text-gray-400 font-mono"
              style={{ top: `${qubit * 80 + 30}px` }}
            >
              q{qubit}
            </div>
          ))}
        </div>

        <div className="absolute left-0 top-0 w-full h-8 bg-gray-700/50">
          {Array.from({ length: 20 }).map((_, time) => (
            <div
              key={time}
              className="absolute text-xs text-gray-400 font-mono"
              style={{ left: `${time * 80 + 30}px` }}
            >
              {time}
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-300">
          {selectedGateType 
            ? `Click on the grid to place a ${selectedGateType} gate`
            : 'Select a gate from the palette to add it to the circuit'
          }
        </p>
      </div>
    </div>
  )
}

export default CircuitCanvas 