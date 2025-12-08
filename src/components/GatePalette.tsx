import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Zap, RotateCcw, ArrowRight, ArrowRightLeft, Target, Settings } from 'lucide-react'
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
    // These match the classes in index.css
    return `gate-${gateType} bg-neutral-800 hover:bg-neutral-700`
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
    <div className="h-full flex flex-col bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      <div className="panel-header bg-neutral-900 border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Gate Palette</h2>
          <div className="text-xs text-neutral-500 bg-neutral-800 px-2 py-1 rounded border border-neutral-700">
            {gateCategories.reduce((total, cat) => total + cat.gates.length, 0)} gates
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search gates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-black border border-neutral-800 rounded-md text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="panel-body flex-1 overflow-y-auto bg-black p-4">
        <div className="space-y-4">
          {filteredCategories.map((category) => (
            <div key={category.name} className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900">
              <div 
                className="p-3 cursor-pointer hover:bg-neutral-800 transition-colors flex items-center justify-between border-b border-neutral-800/50"
                onClick={() => toggleCategory(category.name)}
              >
                <div className="flex items-center space-x-2">
                  <div className="text-blue-500">
                    {category.icon}
                  </div>
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wide">{category.name}</h3>
                </div>
                <motion.div
                  animate={{ rotate: expandedCategories.has(category.name) ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-neutral-500"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.div>
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
                <div className="p-3 bg-black">
                  <div className="grid grid-cols-2 gap-2">
                    {category.gates.map((gateType) => (
                      <motion.button
                        key={gateType}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onGateSelect(gateType)}
                        className={`${getGateClass(gateType)} quantum-gate p-3 rounded-md text-white font-bold text-center transition-all duration-200 group relative overflow-hidden h-16 flex flex-col items-center justify-center`}
                        title={getGateDescription(gateType)}
                      >
                        <div className="text-lg mb-1">{getGateIcon(gateType)}</div>
                        <div className="text-[10px] text-neutral-400 font-normal uppercase tracking-wider">{gateType}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="mt-6 border border-neutral-800 rounded-lg bg-neutral-900 overflow-hidden">
          <div className="p-3 border-b border-neutral-800 bg-neutral-900">
            <h3 className="text-xs font-semibold text-white flex items-center uppercase tracking-wide">
              <Settings className="w-3.5 h-3.5 mr-2 text-neutral-500" />
              Quick Tips
            </h3>
          </div>
          <div className="p-3">
            <div className="text-xs text-neutral-400 space-y-2">
              <div className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Click a gate to select, then click canvas to place</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-neutral-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Drag gates to move, hover for options</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1 h-1 bg-neutral-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Shortcuts: Delete to remove, Ctrl+Z undo</span>
              </div>
            </div>
          </div>
        </div>

        {/* No results message */}
        {filteredCategories.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <div className="text-neutral-500 mb-2">No gates found</div>
            <div className="text-xs text-neutral-600">
              Try different search terms
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
