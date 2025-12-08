import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Sparkles, RotateCcw, Send, Loader2, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react'
import { Circuit } from '../types/circuit'
import { generateCircuit } from '../services/openai'

interface CircuitPromptProps {
  circuit: Circuit
  onCircuitUpdate: (circuit: Circuit) => void
  onNewCircuit: () => void
}

export default function CircuitPrompt({
  circuit,
  onCircuitUpdate,
  onNewCircuit
}: CircuitPromptProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [mode, setMode] = useState<'new' | 'modify'>('new')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const examplePrompts = [
    'Create a Bell state circuit',
    'Generate a quantum teleportation circuit',
    'Make a superposition state',
    'Create an entangled state',
    'Generate a quantum Fourier transform',
    'Add measurement gates to the circuit',
    'Create a quantum error correction circuit',
    'Generate a Grover search algorithm',
    'Make a quantum random number generator',
    'Create a quantum key distribution circuit'
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    setError(null)
    setSuccess(null)

    try {
      const newCircuit = await generateCircuit(
        prompt,
        mode === 'modify' ? circuit : undefined
      )
      
      onCircuitUpdate(newCircuit)
      setSuccess(`Successfully ${mode === 'new' ? 'generated' : 'modified'} circuit!`)
      setPrompt('')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
      
    } catch (error) {
      console.error('Circuit generation error:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate circuit')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExampleClick = (example: string) => {
    setPrompt(example)
    setMode('new')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Circuit Generator</h2>
            <p className="text-sm text-neutral-400">
              Generate or modify quantum circuits using natural language
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode('new')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${
              mode === 'new'
                ? 'bg-blue-600 text-white border-blue-500 shadow-lg'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            New Circuit
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode('modify')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${
              mode === 'modify'
                ? 'bg-blue-600 text-white border-blue-500 shadow-lg'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700 hover:text-white'
            }`}
          >
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Modify Existing
          </motion.button>
        </div>
      </div>

      {/* Mode Description */}
      <div className="panel bg-neutral-900 border-neutral-800">
        <div className="panel-header border-neutral-800 bg-neutral-900">
          <h3 className="text-sm font-semibold text-white flex items-center">
            <Lightbulb className="w-4 h-4 mr-2 text-blue-400" />
            {mode === 'new' ? 'Generate New Circuit' : 'Modify Current Circuit'}
          </h3>
        </div>
        <div className="panel-body">
          <p className="text-sm text-neutral-300">
            {mode === 'new' 
              ? 'Describe the quantum circuit you want to create. Be specific about the gates, qubits, and operations you need.'
              : 'Describe how you want to modify the current circuit. The AI will update the existing circuit based on your request.'
            }
          </p>
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              mode === 'new'
                ? "e.g., 'Create a Bell state circuit with 2 qubits' or 'Generate a quantum teleportation circuit'"
                : "e.g., 'Add a measurement gate to qubit 0' or 'Replace the H gate with an X gate'"
            }
            className="w-full h-24 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
            disabled={isGenerating}
          />
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="absolute bottom-3 right-3 btn-primary"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline ml-2">
              {isGenerating ? 'Generating...' : 'Generate'}
            </span>
          </motion.button>
        </div>

        {/* Status Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-800/50 rounded-lg"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300 text-sm">{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 p-3 bg-blue-900/20 border border-blue-800/50 rounded-lg"
          >
            <CheckCircle className="w-5 h-5 text-blue-400" />
            <span className="text-blue-300 text-sm">{success}</span>
          </motion.div>
        )}
      </div>

      {/* Example Prompts */}
      <div className="panel bg-neutral-900 border-neutral-800">
        <div className="panel-header border-neutral-800 bg-neutral-900">
          <h3 className="text-sm font-semibold text-white">Example Prompts</h3>
          <p className="text-xs text-neutral-500 mt-1">
            Click any example to try it out
          </p>
        </div>
        <div className="panel-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {examplePrompts.map((example, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleExampleClick(example)}
                disabled={isGenerating}
                className="text-left p-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-all duration-200 group"
              >
                <div className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                  {example}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="panel bg-neutral-900 border-neutral-800">
        <div className="panel-header border-neutral-800 bg-neutral-900">
          <h3 className="text-sm font-semibold text-white">Tips for Better Results</h3>
        </div>
        <div className="panel-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-neutral-200">For New Circuits:</h4>
              <ul className="text-neutral-400 space-y-1">
                <li>• Specify the number of qubits needed</li>
                <li>• Mention specific quantum gates (H, X, CNOT, etc.)</li>
                <li>• Describe the desired quantum state or operation</li>
                <li>• Include measurement gates if needed</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-neutral-200">For Modifications:</h4>
              <ul className="text-neutral-400 space-y-1">
                <li>• Be specific about which gates to change</li>
                <li>• Mention qubit numbers and time steps</li>
                <li>• Describe the desired outcome</li>
                <li>• Ask for optimizations or improvements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Current Circuit Info (for modify mode) */}
      {mode === 'modify' && (
        <div className="panel bg-neutral-900 border-neutral-800">
          <div className="panel-header border-neutral-800 bg-neutral-900">
            <h3 className="text-sm font-semibold text-white">Current Circuit</h3>
          </div>
          <div className="panel-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-neutral-500">Name</div>
                <div className="text-white font-medium">{circuit.name}</div>
              </div>
              <div>
                <div className="text-neutral-500">Qubits</div>
                <div className="text-white font-medium">{circuit.qubits}</div>
              </div>
              <div>
                <div className="text-neutral-500">Gates</div>
                <div className="text-white font-medium">{circuit.gates.length}</div>
              </div>
              <div>
                <div className="text-neutral-500">Depth</div>
                <div className="text-white font-medium">
                  {circuit.gates.length > 0 ? Math.max(...circuit.gates.map(g => g.time)) + 1 : 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
