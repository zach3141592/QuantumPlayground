import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Settings, Play, Save, Brain, Lightbulb, Plus, RotateCcw, Copy, Download, X } from 'lucide-react'
import CircuitCanvas from './components/CircuitCanvas'
import GatePalette from './components/GatePalette'
import PropertiesPanel from './components/PropertiesPanel'
import CircuitPrompt from './components/CircuitPrompt'
import { Circuit, Gate, GateType } from './types/circuit'
import { analyzeCircuit, getCircuitSuggestions, CircuitAnalysis } from './services/openai'

function App() {
  const [circuit, setCircuit] = useState<Circuit>({
    id: '1',
    name: 'New Circuit',
    qubits: 2,
    gates: [],
    measurements: []
  })

  const [selectedGate, setSelectedGate] = useState<Gate | null>(null)
  const [selectedGateType, setSelectedGateType] = useState<GateType | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<CircuitAnalysis | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [circuitHistory, setCircuitHistory] = useState<Circuit[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedGate) {
        e.preventDefault()
        removeGate(selectedGate.id)
        setSelectedGate(null)
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        undo()
      } else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        redo()
      } else if (e.key === 'Escape') {
        setSelectedGateType(null)
        setSelectedGate(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedGate])

  // Save circuit to history
  const saveToHistory = (newCircuit: Circuit) => {
    const newHistory = circuitHistory.slice(0, historyIndex + 1)
    newHistory.push(newCircuit)
    setCircuitHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const addGate = (gateType: GateType, qubit: number, time: number) => {
    const newGate: Gate = {
      id: `gate-${Date.now()}`,
      type: gateType,
      qubit,
      time,
      parameters: {}
    }
    
    const newCircuit = {
      ...circuit,
      gates: [...circuit.gates, newGate]
    }
    
    setCircuit(newCircuit)
    saveToHistory(newCircuit)
  }

  const removeGate = (gateId: string) => {
    const newCircuit = {
      ...circuit,
      gates: circuit.gates.filter(gate => gate.id !== gateId)
    }
    
    setCircuit(newCircuit)
    saveToHistory(newCircuit)
  }

  const moveGate = (gateId: string, newQubit: number, newTime: number) => {
    const newCircuit = {
      ...circuit,
      gates: circuit.gates.map(gate => 
        gate.id === gateId 
          ? { ...gate, qubit: newQubit, time: newTime }
          : gate
      )
    }
    
    setCircuit(newCircuit)
    saveToHistory(newCircuit)
  }

  const updateGate = (gateId: string, updates: Partial<Gate>) => {
    const newCircuit = {
      ...circuit,
      gates: circuit.gates.map(gate => 
        gate.id === gateId ? { ...gate, ...updates } : gate
      )
    }
    
    setCircuit(newCircuit)
    saveToHistory(newCircuit)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setCircuit(circuitHistory[historyIndex - 1])
    }
  }

  const redo = () => {
    if (historyIndex < circuitHistory.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setCircuit(circuitHistory[historyIndex + 1])
    }
  }

  const clearCircuit = () => {
    const newCircuit = {
      id: `circuit-${Date.now()}`,
      name: 'New Circuit',
      qubits: 2,
      gates: [],
      measurements: []
    }
    
    setCircuit(newCircuit)
    setSelectedGate(null)
    setSelectedGateType(null)
    saveToHistory(newCircuit)
  }

  const duplicateCircuit = () => {
    const newCircuit = {
      ...circuit,
      id: `circuit-${Date.now()}`,
      name: `${circuit.name} (Copy)`
    }
    
    setCircuit(newCircuit)
    saveToHistory(newCircuit)
  }

  const exportCircuit = () => {
    const circuitData = JSON.stringify(circuit, null, 2)
    const blob = new Blob([circuitData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${circuit.name.replace(/\s+/g, '_')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const runCircuit = async () => {
    setIsRunning(true)
    // Simulate circuit execution
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRunning(false)
  }

  const analyzeCircuitWithAI = async () => {
    if (circuit.gates.length === 0) {
      alert('Please add some gates to the circuit before analyzing.')
      return
    }

    setIsAnalyzing(true)
    try {
      const [analysisResult, suggestionsResult] = await Promise.all([
        analyzeCircuit(circuit),
        getCircuitSuggestions(circuit)
      ])
      
      setAnalysis(analysisResult)
      setSuggestions(suggestionsResult)
      setShowAnalysis(true)
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Failed to analyze circuit. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGateSelect = (gateType: GateType) => {
    setSelectedGateType(gateType)
  }

  const createNewCircuit = () => {
    const newCircuit = {
      id: `circuit-${Date.now()}`,
      name: 'New Circuit',
      qubits: 2,
      gates: [],
      measurements: []
    }
    
    setCircuit(newCircuit)
    setSelectedGate(null)
    setSelectedGateType(null)
    setShowPrompt(false)
    saveToHistory(newCircuit)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Header */}
      <header className="header flex-shrink-0">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-white rounded">
                <Zap className="h-5 w-5 text-black" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">QuantumPlayground</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Circuit Actions */}
              <div className="hidden md:flex items-center space-x-1 border-r border-neutral-800 pr-2 mr-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="btn-ghost p-2"
                  title="Undo (Ctrl+Z)"
                >
                  <RotateCcw className="h-4 w-4" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearCircuit}
                  className="btn-ghost p-2 hover:text-red-400"
                  title="Clear circuit"
                >
                  <X className="h-4 w-4" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={duplicateCircuit}
                  className="btn-ghost p-2"
                  title="Duplicate circuit"
                >
                  <Copy className="h-4 w-4" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={exportCircuit}
                  className="btn-ghost p-2"
                  title="Export circuit"
                >
                  <Download className="h-4 w-4" />
                </motion.button>
              </div>

              {/* AI Features */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPrompt(!showPrompt)}
                disabled={isAnalyzing}
                className="btn-secondary text-sm h-9"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">AI Generator</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={analyzeCircuitWithAI}
                disabled={isAnalyzing}
                className="btn-secondary text-sm h-9"
              >
                <Brain className="h-3.5 w-3.5 mr-1.5 text-neutral-400" />
                <span className="hidden sm:inline">{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={runCircuit}
                disabled={isRunning}
                className="btn-primary text-sm h-9"
              >
                <Play className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">{isRunning ? 'Running...' : 'Run'}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-ghost p-2"
              >
                <Settings className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* AI Circuit Generator Panel */}
      {showPrompt && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-neutral-900 border-b border-neutral-800 flex-shrink-0"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <CircuitPrompt
              circuit={circuit}
              onCircuitUpdate={setCircuit}
              onNewCircuit={createNewCircuit}
            />
          </div>
        </motion.div>
      )}

      {/* AI Analysis Modal */}
      {showAnalysis && analysis && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto border-neutral-800 bg-neutral-950"
          >
            <div className="card-header flex items-center justify-between border-neutral-800">
              <h2 className="text-lg font-bold text-white flex items-center">
                <Brain className="w-5 h-5 mr-2 text-white" />
                Circuit Analysis
              </h2>
              <button
                onClick={() => setShowAnalysis(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="card-body space-y-6">
              <div className="panel bg-neutral-900 border-neutral-800">
                <div className="panel-header border-neutral-800">
                  <h3 className="text-sm font-semibold text-white">Description</h3>
                </div>
                <div className="panel-body">
                  <p className="text-neutral-300 text-sm leading-relaxed">{analysis.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="panel bg-neutral-900 border-neutral-800">
                  <div className="panel-header border-neutral-800">
                    <h3 className="text-sm font-semibold text-white">Complexity</h3>
                  </div>
                  <div className="panel-body">
                    <p className="text-neutral-300 text-sm">{analysis.complexity}</p>
                  </div>
                </div>
                <div className="panel bg-neutral-900 border-neutral-800">
                  <div className="panel-header border-neutral-800">
                    <h3 className="text-sm font-semibold text-white">Execution Time</h3>
                  </div>
                  <div className="panel-body">
                    <p className="text-neutral-300 text-sm">{analysis.estimatedExecutionTime}</p>
                  </div>
                </div>
              </div>
              
              <div className="panel bg-neutral-900 border-neutral-800">
                <div className="panel-header border-neutral-800">
                  <h3 className="text-sm font-semibold text-white">Potential Applications</h3>
                </div>
                <div className="panel-body">
                  <ul className="list-disc list-inside text-neutral-300 text-sm space-y-1">
                    {analysis.potentialApplications.map((app, index) => (
                      <li key={index}>{app}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="panel bg-neutral-900 border-neutral-800">
                <div className="panel-header border-neutral-800">
                  <h3 className="text-sm font-semibold text-white">Optimization Suggestions</h3>
                </div>
                <div className="panel-body">
                  <ul className="list-disc list-inside text-neutral-300 text-sm space-y-1">
                    {analysis.optimizationSuggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {suggestions.length > 0 && (
                <div className="panel bg-neutral-900 border-neutral-800">
                  <div className="panel-header border-neutral-800">
                    <h3 className="text-sm font-semibold text-white flex items-center">
                      <Lightbulb className="w-4 h-4 mr-2 text-neutral-400" />
                      AI Suggestions
                    </h3>
                  </div>
                  <div className="panel-body">
                    <ul className="list-disc list-inside text-neutral-300 text-sm space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Sidebar - Gate Palette */}
        <div className="w-72 sidebar flex-shrink-0 z-10">
          <div className="h-full p-4">
            <GatePalette onGateSelect={handleGateSelect} />
          </div>
        </div>

        {/* Center - Circuit Canvas */}
        <div className="flex-1 main-content flex-shrink-0 relative">
          <div className="absolute inset-0 p-4">
            <CircuitCanvas
              circuit={circuit}
              onGateAdd={addGate}
              onGateRemove={removeGate}
              onGateMove={moveGate}
              onGateSelect={setSelectedGate}
              selectedGate={selectedGate}
              selectedGateType={selectedGateType}
              onGateTypeSelect={setSelectedGateType}
            />
          </div>
        </div>

        {/* Right Sidebar - Properties Panel */}
        <div className="w-80 sidebar flex-shrink-0 z-10">
          <div className="h-full p-4">
            <PropertiesPanel
              selectedGate={selectedGate}
              onGateUpdate={updateGate}
              circuit={circuit}
              onCircuitUpdate={setCircuit}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
