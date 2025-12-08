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

  const getGateClass = (gateType: GateType) => {
    return `gate-${gateType} quantum-gate bg-neutral-800`
  }

  const getGateIcon = (gateType: GateType) => {
    const icons = {
      H: 'H',
      X: 'X',
      Y: 'Y',
      Z: 'Z',
      CNOT: '+', // Changed from ⊕
      SWAP: 'S', // Changed from ⇄ to S for simplicity or could use an icon
      RX: 'Rx',
      RY: 'Ry',
      RZ: 'Rz',
      PHASE: 'P', // Changed from θ
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
    <div className="h-full flex flex-col bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800">
      <div className="panel-header bg-neutral-900 border-neutral-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Circuit Canvas</h2>
            <p className="text-xs text-neutral-500 mt-1">
              {selectedGateType ? `Selected: ${selectedGateType} - Click to place` : 'Select gates from palette'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 rounded-md transition-colors ${
                showGrid ? 'bg-neutral-800 text-white' : 'bg-transparent text-neutral-600 hover:text-neutral-400'
              }`}
              title="Toggle grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            <div className="text-xs text-neutral-500 bg-neutral-800 px-2 py-1 rounded border border-neutral-700">
              {circuit.gates.length} gates • {circuit.qubits} qubits
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 relative overflow-hidden bg-black">
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredCell(null)}
          className="w-full h-full relative overflow-auto cursor-crosshair"
        >
          {/* Grid Background */}
          {showGrid && (
            <div 
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(#333 1px, transparent 1px),
                  linear-gradient(90deg, #333 1px, transparent 1px)
                `,
                backgroundSize: '100px 80px'
              }}
            />
          )}

          {/* Qubit Labels */}
          <div className="absolute left-0 top-0 w-12 h-full bg-neutral-900/90 border-r border-neutral-800 z-10">
            {Array.from({ length: circuit.qubits }).map((_, qubit) => (
              <div
                key={qubit}
                className="flex items-center justify-center h-20 text-xs font-mono text-neutral-500 border-b border-neutral-800/50"
              >
                q{qubit}
              </div>
            ))}
          </div>

          {/* Time Labels */}
          <div className="absolute left-12 top-0 w-full h-6 bg-neutral-900/90 border-b border-neutral-800 z-10">
            {Array.from({ length: 20 }).map((_, time) => (
              <div
                key={time}
                className="absolute top-0 w-20 h-6 flex items-center justify-center text-[10px] font-mono text-neutral-600"
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
              className="absolute left-12 right-0 quantum-wire"
              style={{ top: `${qubit * 80 + 40}px` }}
            />
          ))}

          {/* Hover Preview */}
          {hoveredCell && selectedGateType && !isPositionOccupied(hoveredCell.qubit, hoveredCell.time) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.5, scale: 1 }}
              className={`absolute border border-blue-500/50 bg-blue-500/10 rounded p-3 pointer-events-none z-20 flex items-center justify-center`}
              style={{
                left: `${hoveredCell.time * 100 + 26}px`,
                top: `${hoveredCell.qubit * 80 + 20}px`,
                width: '80px',
                height: '40px'
              }}
            >
              <div className="text-blue-400 font-bold text-center text-sm">
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
                className={`absolute ${getGateClass(gate.type)} rounded p-3 cursor-move group transition-all duration-200 z-30 flex items-center justify-center ${
                  selectedGate?.id === gate.id ? 'ring-1 ring-blue-500 border-blue-500' : ''
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
                <div className="flex items-center justify-center h-full relative w-full">
                  <div className="text-white font-mono font-bold text-center text-sm">
                    {getGateIcon(gate.type)}
                  </div>
                  
                  {/* Delete button */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="absolute -top-3 -right-3 bg-red-900 text-red-200 border border-red-700 rounded-full w-5 h-5 flex items-center justify-center shadow-sm z-40 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      onGateRemove(gate.id)
                      if (selectedGate?.id === gate.id) {
                        onGateSelect(null)
                      }
                    }}
                    title="Delete gate"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                  
                  {/* Gate info on hover */}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-neutral-800 border border-neutral-700 text-neutral-300 text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none hidden group-hover:block"
                  >
                    {gate.type} (q{gate.qubit}, t{gate.time})
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Instructions overlay */}
          {circuit.gates.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-neutral-600 max-w-sm mx-auto p-8 border border-neutral-800/50 rounded-xl bg-neutral-900/30 backdrop-blur-sm">
                <Zap className="w-12 h-12 mx-auto mb-4 text-neutral-700" />
                <div className="text-base font-medium mb-2 text-neutral-400">Start Building</div>
                <div className="text-xs text-neutral-500">
                  Select a gate from the palette and click on the grid to place it.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
