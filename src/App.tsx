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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="header flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">Quantum Circuit Designer</h1>
                <p className="text-sm text-slate-400">Interactive quantum computing platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Circuit Actions */}
              <div className="hidden md:flex items-center space-x-2 border-r border-slate-600 pr-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="btn-secondary flex items-center space-x-2"
                  title="Undo (Ctrl+Z)"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Undo</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearCircuit}
                  className="btn-warning flex items-center space-x-2"
                  title="Clear circuit"
                >
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={duplicateCircuit}
                  className="btn-secondary flex items-center space-x-2"
                  title="Duplicate circuit"
                >
                  <Copy className="h-4 w-4" />
                  <span className="hidden sm:inline">Duplicate</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={exportCircuit}
                  className="btn-secondary flex items-center space-x-2"
                  title="Export circuit"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </motion.button>
              </div>

              {/* AI Features */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPrompt(!showPrompt)}
                disabled={isAnalyzing}
                className="btn-success flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">AI Generator</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={analyzeCircuitWithAI}
                disabled={isAnalyzing}
                className="btn-purple flex items-center space-x-2"
              >
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">{isAnalyzing ? 'Analyzing...' : 'AI Analysis'}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={runCircuit}
                disabled={isRunning}
                className="btn-primary flex items-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span className="hidden sm:inline">{isRunning ? 'Running...' : 'Run Circuit'}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Save</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
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
          className="bg-slate-800 border-b border-slate-600 flex-shrink-0"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="card-header flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-400" />
                AI Circuit Analysis
              </h2>
              <button
                onClick={() => setShowAnalysis(false)}
                className="text-slate-400 hover:text-slate-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="card-body space-y-6">
              <div className="panel">
                <div className="panel-header">
                  <h3 className="text-lg font-semibold text-slate-100">Description</h3>
                </div>
                <div className="panel-body">
                  <p className="text-slate-300">{analysis.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="panel">
                  <div className="panel-header">
                    <h3 className="text-lg font-semibold text-slate-100">Complexity</h3>
                  </div>
                  <div className="panel-body">
                    <p className="text-slate-300">{analysis.complexity}</p>
                  </div>
                </div>
                <div className="panel">
                  <div className="panel-header">
                    <h3 className="text-lg font-semibold text-slate-100">Execution Time</h3>
                  </div>
                  <div className="panel-body">
                    <p className="text-slate-300">{analysis.estimatedExecutionTime}</p>
                  </div>
                </div>
              </div>
              
              <div className="panel">
                <div className="panel-header">
                  <h3 className="text-lg font-semibold text-slate-100">Potential Applications</h3>
                </div>
                <div className="panel-body">
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {analysis.potentialApplications.map((app, index) => (
                      <li key={index}>{app}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="panel">
                <div className="panel-header">
                  <h3 className="text-lg font-semibold text-slate-100">Optimization Suggestions</h3>
                </div>
                <div className="panel-body">
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {analysis.optimizationSuggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {suggestions.length > 0 && (
                <div className="panel">
                  <div className="panel-header">
                    <h3 className="text-lg font-semibold text-slate-100 flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2 text-amber-400" />
                      AI Suggestions
                    </h3>
                  </div>
                  <div className="panel-body">
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
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
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar - Gate Palette */}
        <div className="w-80 sidebar flex-shrink-0">
          <div className="h-full p-4">
            <GatePalette onGateSelect={handleGateSelect} />
          </div>
        </div>

        {/* Center - Circuit Canvas */}
        <div className="flex-1 main-content flex-shrink-0">
          <div className="h-full p-4">
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
        <div className="w-96 sidebar flex-shrink-0">
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