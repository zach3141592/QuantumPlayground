import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Zap, X, RotateCcw, ArrowRight, ArrowDown, ArrowUp, ArrowLeft, ArrowRightLeft, Target, Gauge, Settings } from 'lucide-react'
import { GateType } from '../types/circuit'

interface GatePaletteProps {
  onGateSelect: (gateType: GateType) => void
}

interface GateCategory {
  name: string
  icon: React.ReactNode
  gates: GateType[]
  description: string
}

export default function GatePalette({ onGateSelect }: GatePaletteProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Basic Gates']))

  const gateCategories: GateCategory[] = [
    {
      name: 'Basic Gates',
      icon: <Zap className="w-4 h-4" />,
      gates: ['H', 'X', 'Y', 'Z'],
      description: 'Fundamental quantum gates'
    },
    {
      name: 'Multi-Qubit Gates',
      icon: <ArrowRightLeft className="w-4 h-4" />,
      gates: ['CNOT', 'SWAP'],
      description: 'Gates that operate on multiple qubits'
    },
    {
      name: 'Rotation Gates',
      icon: <RotateCcw className="w-4 h-4" />,
      gates: ['RX', 'RY', 'RZ'],
      description: 'Parameterized rotation gates'
    },
    {
      name: 'Measurement',
      icon: <Target className="w-4 h-4" />,
      gates: ['MEASURE'],
      description: 'Measurement and phase gates'
    }
  ]

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
      H: 'bg-blue-500 hover:bg-blue-600',
      X: 'bg-red-500 hover:bg-red-600',
      Y: 'bg-green-500 hover:bg-green-600',
      Z: 'bg-purple-500 hover:bg-purple-600',
      CNOT: 'bg-amber-500 hover:bg-amber-600',
      SWAP: 'bg-pink-500 hover:bg-pink-600',
      RX: 'bg-indigo-500 hover:bg-indigo-600',
      RY: 'bg-teal-500 hover:bg-teal-600',
      RZ: 'bg-orange-500 hover:bg-orange-600',
      PHASE: 'bg-cyan-500 hover:bg-cyan-600',
      MEASURE: 'bg-slate-500 hover:bg-slate-600'
    }
    return colors[gateType] || 'bg-slate-500 hover:bg-slate-600'
  }

  const getGateDescription = (gateType: GateType) => {
    const descriptions = {
      H: 'Hadamard gate - creates superposition',
      X: 'Pauli-X gate - bit flip',
      Y: 'Pauli-Y gate - bit and phase flip',
      Z: 'Pauli-Z gate - phase flip',
      CNOT: 'Controlled-NOT gate - two-qubit operation',
      SWAP: 'SWAP gate - exchanges qubit states',
      RX: 'X-axis rotation gate',
      RY: 'Y-axis rotation gate',
      RZ: 'Z-axis rotation gate',
      PHASE: 'Phase gate',
      MEASURE: 'Measurement gate'
    }
    return descriptions[gateType] || 'Quantum gate'
  }

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName)
    } else {
      newExpanded.add(categoryName)
    }
    setExpandedCategories(newExpanded)
  }

  const filteredCategories = gateCategories.map(category => ({
    ...category,
    gates: category.gates.filter(gate => 
      gate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getGateDescription(gate).toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.gates.length > 0)

  return (
    <div className="h-full flex flex-col">
      <div className="panel-header">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-100">Gate Palette</h2>
          <div className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
            {gateCategories.reduce((total, cat) => total + cat.gates.length, 0)} gates
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search gates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="panel-body flex-1 overflow-y-auto">
        <div className="space-y-4">
          {filteredCategories.map((category) => (
            <div key={category.name} className="panel">
              <div 
                className="panel-header cursor-pointer"
                onClick={() => toggleCategory(category.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="text-slate-400">
                      {category.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-100">{category.name}</h3>
                    <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                      {category.gates.length}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedCategories.has(category.name) ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-slate-400"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
                <p className="text-xs text-slate-400 mt-1">{category.description}</p>
              </div>
              
              <motion.div
                initial={false}
                animate={{ 
                  height: expandedCategories.has(category.name) ? 'auto' : 0,
                  opacity: expandedCategories.has(category.name) ? 1 : 0
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="panel-body pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    {category.gates.map((gateType) => (
                      <motion.button
                        key={gateType}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onGateSelect(gateType)}
                        className={`${getGateColor(gateType)} rounded-lg p-3 text-white font-bold text-center transition-all duration-200 group relative overflow-hidden`}
                        title={getGateDescription(gateType)}
                      >
                        <div className="relative z-10">
                          <div className="text-lg mb-1">{getGateIcon(gateType)}</div>
                          <div className="text-xs opacity-90">{gateType}</div>
                        </div>
                        
                        {/* Hover effect */}
                        <motion.div
                          initial={{ scale: 0 }}
                          whileHover={{ scale: 1 }}
                          className="absolute inset-0 bg-white/20 rounded-lg"
                          transition={{ duration: 0.2 }}
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="mt-6 panel">
          <div className="panel-header">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Quick Tips
            </h3>
          </div>
          <div className="panel-body">
            <div className="text-xs text-slate-400 space-y-2">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Click a gate to select it, then click on the canvas to place</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Drag gates on the canvas to move them around</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Hover over gates to see delete options</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Use keyboard shortcuts: Delete to remove, Ctrl+Z to undo</span>
              </div>
            </div>
          </div>
        </div>

        {/* No results message */}
        {filteredCategories.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <div className="text-slate-400 mb-2">No gates found</div>
            <div className="text-xs text-slate-500">
              Try adjusting your search terms
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 