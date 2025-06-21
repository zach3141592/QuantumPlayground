import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Settings, Play, Save, Download, Upload, Plus, Trash2, Brain, Lightbulb } from 'lucide-react'
import CircuitCanvas from './components/CircuitCanvas'
import GatePalette from './components/GatePalette'
import PropertiesPanel from './components/PropertiesPanel'
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

  const addGate = (gateType: GateType, qubit: number, time: number) => {
    const newGate: Gate = {
      id: `gate-${Date.now()}`,
      type: gateType,
      qubit,
      time,
      parameters: {}
    }
    
    setCircuit(prev => ({
      ...prev,
      gates: [...prev.gates, newGate]
    }))
  }

  const removeGate = (gateId: string) => {
    setCircuit(prev => ({
      ...prev,
      gates: prev.gates.filter(gate => gate.id !== gateId)
    }))
  }

  const updateGate = (gateId: string, updates: Partial<Gate>) => {
    setCircuit(prev => ({
      ...prev,
      gates: prev.gates.map(gate => 
        gate.id === gateId ? { ...gate, ...updates } : gate
      )
    }))
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Zap className="h-8 w-8 text-blue-400" />
              <h1 className="text-xl font-bold text-white">Quantum Circuit Designer</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={analyzeCircuitWithAI}
                disabled={isAnalyzing}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
              >
                <Brain className="h-4 w-4" />
                <span>{isAnalyzing ? 'Analyzing...' : 'AI Analysis'}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={runCircuit}
                disabled={isRunning}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
              >
                <Play className="h-4 w-4" />
                <span>{isRunning ? 'Running...' : 'Run Circuit'}</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* AI Analysis Modal */}
      {showAnalysis && analysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">AI Circuit Analysis</h2>
              <button
                onClick={() => setShowAnalysis(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                <p className="text-gray-300">{analysis.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Complexity</h3>
                  <p className="text-gray-300">{analysis.complexity}</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Execution Time</h3>
                  <p className="text-gray-300">{analysis.estimatedExecutionTime}</p>
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Potential Applications</h3>
                <ul className="list-disc list-inside text-gray-300">
                  {analysis.potentialApplications.map((app, index) => (
                    <li key={index}>{app}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Optimization Suggestions</h3>
                <ul className="list-disc list-inside text-gray-300">
                  {analysis.optimizationSuggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
              
              {suggestions.length > 0 && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                    AI Suggestions
                  </h3>
                  <ul className="list-disc list-inside text-gray-300">
                    {suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Gate Palette */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
          <GatePalette onGateSelect={handleGateSelect} />
        </div>

        {/* Center - Circuit Canvas */}
        <div className="flex-1 bg-gray-900 p-4">
          <CircuitCanvas
            circuit={circuit}
            onGateAdd={addGate}
            onGateRemove={removeGate}
            onGateSelect={setSelectedGate}
            selectedGate={selectedGate}
            selectedGateType={selectedGateType}
            onGateTypeSelect={setSelectedGateType}
          />
        </div>

        {/* Right Sidebar - Properties Panel */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
          <PropertiesPanel
            selectedGate={selectedGate}
            onGateUpdate={updateGate}
            circuit={circuit}
            onCircuitUpdate={setCircuit}
          />
        </div>
      </div>
    </div>
  )
}

export default App 