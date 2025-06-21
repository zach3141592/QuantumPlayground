import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Move, Grid, Zap } from 'lucide-react'
import { Circuit, Gate, GateType } from '../types/circuit'

interface CircuitCanvasProps {
  circuit: Circuit
  onGateAdd: (gateType: GateType, qubit: number, time: number) => void
  onGateRemove: (gateId: string) => void
  onGateMove: (gateId: string, newQubit: number, newTime: number) => void
  onGateSelect: (gate: Gate | null) => void
  selectedGate: Gate | null
  selectedGateType: GateType | null
  onGateTypeSelect: (gateType: GateType | null) => void
}

export default function CircuitCanvas({
  circuit,
  onGateAdd,
  onGateRemove,
  onGateMove,
  onGateSelect,
  selectedGate,
  selectedGateType,
  onGateTypeSelect
}: CircuitCanvasProps) {
  const [draggedGate, setDraggedGate] = useState<Gate | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hoveredCell, setHoveredCell] = useState<{ qubit: number; time: number } | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!selectedGateType || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const time = Math.floor(x / 100)
    const qubit = Math.floor(y / 80)

    if (qubit >= 0 && qubit < circuit.qubits && time >= 0) {
      // Check if there's already a gate at this position
      const existingGate = circuit.gates.find(g => g.qubit === qubit && g.time === time)
      if (!existingGate) {
        onGateAdd(selectedGateType, qubit, time)
        onGateTypeSelect(null)
      }
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const time = Math.floor(x / 100)
    const qubit = Math.floor(y / 80)

    if (qubit >= 0 && qubit < circuit.qubits && time >= 0) {
      setHoveredCell({ qubit, time })
    } else {
      setHoveredCell(null)
    }
  }

  const handleGateMouseDown = (e: React.MouseEvent, gate: Gate) => {
    e.stopPropagation()
    setDraggedGate(gate)
    
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedGate || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - dragOffset.x
    const y = e.clientY - rect.top - dragOffset.y

    const newTime = Math.max(0, Math.floor(x / 100))
    const newQubit = Math.max(0, Math.min(circuit.qubits - 1, Math.floor(y / 80)))

    onGateMove(draggedGate.id, newQubit, newTime)
  }

  const handleMouseUp = () => {
    setDraggedGate(null)
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

  const getGateAtPosition = (qubit: number, time: number) => {
    return circuit.gates.find(g => g.qubit === qubit && g.time === time)
  }

  const isPositionOccupied = (qubit: number, time: number) => {
    return getGateAtPosition(qubit, time) !== undefined
  }

  return (
    <div className="h-full flex flex-col">
      <div className="panel-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Circuit Canvas</h2>
            <p className="text-sm text-slate-400 mt-1">
              {selectedGateType ? `Selected: ${selectedGateType} gate - Click to place` : 'Click gates from the palette to add them'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg transition-colors ${
                showGrid ? 'bg-slate-600 text-slate-100' : 'bg-slate-700 text-slate-400'
              }`}
              title="Toggle grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            <div className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
              {circuit.gates.length} gates • {circuit.qubits} qubits
            </div>
          </div>
        </div>
      </div>
      
      <div className="panel-body flex-1 relative overflow-hidden">
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredCell(null)}
          className="w-full h-full bg-slate-800 rounded-lg border-2 border-dashed border-slate-600 relative overflow-auto cursor-crosshair"
        >
          {/* Grid Background */}
          {showGrid && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '100px 80px'
              }}
            />
          )}

          {/* Qubit Labels */}
          <div className="absolute left-0 top-0 w-16 h-full bg-slate-700/50 border-r border-slate-600 z-10">
            {Array.from({ length: circuit.qubits }).map((_, qubit) => (
              <div
                key={qubit}
                className="flex items-center justify-center h-20 text-sm font-mono text-slate-300 border-b border-slate-600"
              >
                q{qubit}
              </div>
            ))}
          </div>

          {/* Time Labels */}
          <div className="absolute left-16 top-0 w-full h-8 bg-slate-700/50 border-b border-slate-600 z-10">
            {Array.from({ length: 20 }).map((_, time) => (
              <div
                key={time}
                className="absolute top-0 w-20 h-8 flex items-center justify-center text-xs font-mono text-slate-400"
                style={{ left: `${time * 100}px` }}
              >
                {time}
              </div>
            ))}
          </div>

          {/* Qubit Lines */}
          {Array.from({ length: circuit.qubits }).map((_, qubit) => (
            <div
              key={qubit}
              className="absolute left-16 right-0 quantum-wire"
              style={{ top: `${qubit * 80 + 40}px` }}
            />
          ))}

          {/* Hover Preview */}
          {hoveredCell && selectedGateType && !isPositionOccupied(hoveredCell.qubit, hoveredCell.time) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.3, scale: 1 }}
              className={`absolute ${getGateColor(selectedGateType)} rounded-lg p-3 shadow-lg border-2 border-dashed border-white/50 pointer-events-none z-20`}
              style={{
                left: `${hoveredCell.time * 100 + 26}px`,
                top: `${hoveredCell.qubit * 80 + 20}px`,
                width: '80px',
                height: '40px'
              }}
            >
              <div className="text-white font-bold text-center opacity-50">
                {getGateIcon(selectedGateType)}
              </div>
            </motion.div>
          )}

          {/* Gates */}
          <AnimatePresence>
            {circuit.gates.map((gate) => (
              <motion.div
                key={gate.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                className={`absolute ${getGateColor(gate.type)} rounded-lg p-3 shadow-lg border-2 border-white/20 cursor-move group transition-all duration-200 z-30 ${
                  selectedGate?.id === gate.id ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-800' : ''
                }`}
                style={{
                  left: `${gate.time * 100 + 26}px`,
                  top: `${gate.qubit * 80 + 20}px`,
                  width: '80px',
                  height: '40px'
                }}
                onMouseDown={(e) => handleGateMouseDown(e, gate)}
                onClick={(e) => {
                  e.stopPropagation()
                  onGateSelect(gate)
                }}
              >
                <div className="flex items-center justify-center h-full relative">
                  <div className="text-white font-bold text-center">
                    {getGateIcon(gate.type)}
                  </div>
                  
                  {/* Delete button - always visible but more prominent on hover */}
                  <motion.button
                    initial={{ opacity: 0.3, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg transition-all duration-200 z-40 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      onGateRemove(gate.id)
                      if (selectedGate?.id === gate.id) {
                        onGateSelect(null)
                      }
                    }}
                    title="Delete gate (or press Delete key when selected)"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                  
                  {/* Move indicator */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-slate-400"
                  >
                    <Move className="w-3 h-3" />
                  </motion.div>

                  {/* Gate info on hover */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-50"
                  >
                    {gate.type} on q{gate.qubit} at t{gate.time}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Instructions overlay */}
          {circuit.gates.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-slate-400 max-w-md mx-auto">
                <div className="text-4xl mb-4">⚛️</div>
                <div className="text-lg font-medium mb-2">Empty Circuit</div>
                <div className="text-sm mb-4">
                  Select a gate from the palette and click on the grid to start building your quantum circuit
                </div>
                <div className="text-xs text-slate-500 space-y-1 bg-slate-800/50 p-3 rounded-lg">
                  <div>• Click gates from the left panel to select them</div>
                  <div>• Click on the grid to place gates</div>
                  <div>• Drag gates to move them around</div>
                  <div>• Hover over gates to see delete options</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 