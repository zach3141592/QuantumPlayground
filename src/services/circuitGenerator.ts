import OpenAI from 'openai'
import { Circuit, Gate, GateType } from '../types/circuit'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
})

export interface CircuitGenerationRequest {
  prompt: string
  mode: 'generate' | 'modify'
  currentCircuit?: Circuit
}

export const generateCircuitFromPrompt = async (
  request: CircuitGenerationRequest
): Promise<Circuit | null> => {
  try {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }

    const systemPrompt = `You are a quantum computing expert. Generate quantum circuits based on user descriptions. 
    
    Available gates: H (Hadamard), X (Pauli-X), Y (Pauli-Y), Z (Pauli-Z), CNOT (Controlled NOT), SWAP, RX (X rotation), RY (Y rotation), RZ (Z rotation), PHASE, MEASURE.
    
    Respond with a JSON object in this exact format:
    {
      "name": "Circuit name",
      "qubits": number,
      "gates": [
        {
          "type": "gate_type",
          "qubit": number,
          "time": number,
          "parameters": {},
          "controlQubit": number (only for CNOT)
        }
      ]
    }`

    const userPrompt = request.mode === 'modify' 
      ? `Current circuit: ${request.currentCircuit?.name}, ${request.currentCircuit?.qubits} qubits, ${request.currentCircuit?.gates.length} gates. 
         Modify this circuit: ${request.prompt}
         Return the complete modified circuit.`
      : `Create a new quantum circuit: ${request.prompt}`

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from AI')

    // Try to parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid response format')
    }

    const circuitData = JSON.parse(jsonMatch[0])
    
    // Convert to our Circuit format
    const circuit: Circuit = {
      id: `circuit-${Date.now()}`,
      name: circuitData.name || 'Generated Circuit',
      qubits: circuitData.qubits || 2,
      gates: circuitData.gates.map((gate: any, index: number) => ({
        id: `gate-${Date.now()}-${index}`,
        type: gate.type as GateType,
        qubit: gate.qubit,
        time: gate.time,
        parameters: gate.parameters || {},
        controlQubit: gate.controlQubit,
        targetQubit: gate.targetQubit
      })),
      measurements: []
    }

    return circuit
  } catch (error) {
    console.error('Error generating circuit:', error)
    // Fallback to mock generation
    return generateMockCircuit(request.prompt, request.currentCircuit, request.mode)
  }
}

const generateMockCircuit = (
  userPrompt: string, 
  currentCircuit?: Circuit, 
  mode: 'generate' | 'modify' = 'generate'
): Circuit => {
  const lowerPrompt = userPrompt.toLowerCase()
  
  if (mode === 'generate') {
    // Generate new circuit based on prompt
    if (lowerPrompt.includes('bell') || lowerPrompt.includes('entanglement')) {
      return {
        id: `circuit-${Date.now()}`,
        name: 'Bell State Circuit',
        qubits: 2,
        gates: [
          { id: 'gate-1', type: 'H', qubit: 0, time: 0, parameters: {} },
          { id: 'gate-2', type: 'CNOT', qubit: 1, time: 1, parameters: {}, controlQubit: 0 }
        ],
        measurements: []
      }
    } else if (lowerPrompt.includes('superposition') || lowerPrompt.includes('hadamard')) {
      return {
        id: `circuit-${Date.now()}`,
        name: 'Superposition Circuit',
        qubits: 1,
        gates: [
          { id: 'gate-1', type: 'H', qubit: 0, time: 0, parameters: {} }
        ],
        measurements: []
      }
    } else if (lowerPrompt.includes('quantum fourier') || lowerPrompt.includes('qft')) {
      return {
        id: `circuit-${Date.now()}`,
        name: 'Quantum Fourier Transform',
        qubits: 3,
        gates: [
          { id: 'gate-1', type: 'H', qubit: 0, time: 0, parameters: {} },
          { id: 'gate-2', type: 'PHASE', qubit: 1, time: 1, parameters: { angle: Math.PI / 2 } },
          { id: 'gate-3', type: 'CNOT', qubit: 1, time: 2, parameters: {}, controlQubit: 0 },
          { id: 'gate-4', type: 'H', qubit: 1, time: 3, parameters: {} },
          { id: 'gate-5', type: 'PHASE', qubit: 2, time: 4, parameters: { angle: Math.PI / 4 } },
          { id: 'gate-6', type: 'CNOT', qubit: 2, time: 5, parameters: {}, controlQubit: 0 },
          { id: 'gate-7', type: 'H', qubit: 2, time: 6, parameters: {} }
        ],
        measurements: []
      }
    } else if (lowerPrompt.includes('grover') || lowerPrompt.includes('search')) {
      return {
        id: `circuit-${Date.now()}`,
        name: 'Grover Search Algorithm',
        qubits: 2,
        gates: [
          { id: 'gate-1', type: 'H', qubit: 0, time: 0, parameters: {} },
          { id: 'gate-2', type: 'H', qubit: 1, time: 0, parameters: {} },
          { id: 'gate-3', type: 'X', qubit: 0, time: 1, parameters: {} },
          { id: 'gate-4', type: 'X', qubit: 1, time: 1, parameters: {} },
          { id: 'gate-5', type: 'H', qubit: 1, time: 2, parameters: {} },
          { id: 'gate-6', type: 'CNOT', qubit: 1, time: 3, parameters: {}, controlQubit: 0 },
          { id: 'gate-7', type: 'H', qubit: 1, time: 4, parameters: {} },
          { id: 'gate-8', type: 'X', qubit: 0, time: 5, parameters: {} },
          { id: 'gate-9', type: 'X', qubit: 1, time: 5, parameters: {} },
          { id: 'gate-10', type: 'H', qubit: 0, time: 6, parameters: {} },
          { id: 'gate-11', type: 'H', qubit: 1, time: 6, parameters: {} }
        ],
        measurements: []
      }
    } else {
      // Default circuit
      return {
        id: `circuit-${Date.now()}`,
        name: 'Generated Circuit',
        qubits: 2,
        gates: [
          { id: 'gate-1', type: 'H', qubit: 0, time: 0, parameters: {} },
          { id: 'gate-2', type: 'X', qubit: 1, time: 0, parameters: {} }
        ],
        measurements: []
      }
    }
  } else {
    // Modify existing circuit
    if (!currentCircuit) return generateMockCircuit(userPrompt, undefined, 'generate')
    
    const modifiedCircuit = { ...currentCircuit }
    
    if (lowerPrompt.includes('add hadamard') || lowerPrompt.includes('add h gate')) {
      const newGate: Gate = {
        id: `gate-${Date.now()}`,
        type: 'H',
        qubit: 0,
        time: modifiedCircuit.gates.length,
        parameters: {}
      }
      modifiedCircuit.gates.push(newGate)
    } else if (lowerPrompt.includes('add cnot') || lowerPrompt.includes('add controlled')) {
      const newGate: Gate = {
        id: `gate-${Date.now()}`,
        type: 'CNOT',
        qubit: 1,
        time: modifiedCircuit.gates.length,
        parameters: {},
        controlQubit: 0
      }
      modifiedCircuit.gates.push(newGate)
    } else if (lowerPrompt.includes('measure') || lowerPrompt.includes('add measurement')) {
      const newGate: Gate = {
        id: `gate-${Date.now()}`,
        type: 'MEASURE',
        qubit: 0,
        time: modifiedCircuit.gates.length,
        parameters: {}
      }
      modifiedCircuit.gates.push(newGate)
    }
    
    return modifiedCircuit
  }
} 