import { Circuit, Gate, GateType } from '../types/circuit'

export interface CircuitAnalysis {
  description: string
  complexity: string
  estimatedExecutionTime: string
  potentialApplications: string[]
  optimizationSuggestions: string[]
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  console.warn('OpenAI API key not found. AI features will be disabled.')
}

export async function generateCircuit(prompt: string, existingCircuit?: Circuit): Promise<Circuit> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  try {
    const systemPrompt = `You are a quantum computing expert. Generate accurate quantum circuits based on user requests.

IMPORTANT RULES:
1. Generate ONLY valid quantum circuits with proper gate sequences
2. Use standard quantum gates: H, X, Y, Z, CNOT, SWAP, RX, RY, RZ, MEASURE
3. Ensure gates are placed logically and sequentially
4. For CNOT gates, specify control and target qubits properly
5. For rotation gates (RX, RY, RZ), include angle parameters
6. Return ONLY valid JSON in the exact format specified
7. Do not include explanations or markdown formatting

CIRCUIT FORMAT:
{
  "name": "Circuit Name",
  "qubits": number,
  "gates": [
    {
      "id": "unique-id",
      "type": "GATE_TYPE",
      "qubit": number,
      "time": number,
      "parameters": {}
    }
  ]
}

GATE TYPES:
- H: Hadamard gate (creates superposition)
- X: Pauli-X gate (bit flip)
- Y: Pauli-Y gate (bit and phase flip)
- Z: Pauli-Z gate (phase flip)
- CNOT: Controlled-NOT gate (two-qubit)
- SWAP: SWAP gate (exchanges qubit states)
- RX: X-axis rotation (requires angle parameter)
- RY: Y-axis rotation (requires angle parameter)
- RZ: Z-axis rotation (requires angle parameter)
- MEASURE: Measurement gate

EXAMPLES:
- Bell state: H on q0, CNOT with control q0 and target q1
- Quantum teleportation: 3 qubits with specific gate sequence
- Superposition: H gates on multiple qubits
- Entanglement: CNOT gates between qubits
- Quantum Fourier Transform: H and controlled phase gates

Generate a circuit that matches the user's request exactly.`

    const userPrompt = existingCircuit 
      ? `Modify this existing circuit: ${JSON.stringify(existingCircuit, null, 2)}

User request: ${prompt}

Generate a modified circuit that incorporates the user's request while maintaining quantum correctness.`
      : `Generate a quantum circuit for: ${prompt}

Create a circuit that accurately implements the requested quantum operation.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response content from OpenAI')
    }

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response')
    }

    const circuitData = JSON.parse(jsonMatch[0])
    
    // Validate and clean the circuit data
    const validatedCircuit = validateAndCleanCircuit(circuitData)
    
    return validatedCircuit

  } catch (error) {
    console.error('Circuit generation error:', error)
    
    // Return a simple fallback circuit if AI generation fails
    return {
      id: `circuit-${Date.now()}`,
      name: 'Generated Circuit',
      qubits: 2,
      gates: [
        {
          id: 'gate-1',
          type: 'H',
          qubit: 0,
          time: 0,
          parameters: {}
        },
        {
          id: 'gate-2',
          type: 'CNOT',
          qubit: 1,
          time: 1,
          parameters: {}
        }
      ],
      measurements: []
    }
  }
}

function validateAndCleanCircuit(circuitData: any): Circuit {
  // Ensure required fields exist
  const circuit: Circuit = {
    id: `circuit-${Date.now()}`,
    name: circuitData.name || 'Generated Circuit',
    qubits: Math.max(1, Math.min(10, circuitData.qubits || 2)),
    gates: [],
    measurements: []
  }

  // Validate and clean gates
  if (Array.isArray(circuitData.gates)) {
    circuit.gates = circuitData.gates
      .filter((gate: any) => gate && gate.type && typeof gate.qubit === 'number' && typeof gate.time === 'number')
      .map((gate: any, index: number) => ({
        id: gate.id || `gate-${index + 1}`,
        type: validateGateType(gate.type),
        qubit: Math.max(0, Math.min(circuit.qubits - 1, gate.qubit)),
        time: Math.max(0, gate.time),
        parameters: gate.parameters || {}
      }))
      .sort((a: Gate, b: Gate) => a.time - b.time || a.qubit - b.qubit)
  }

  return circuit
}

function validateGateType(type: string): GateType {
  const validTypes: GateType[] = ['H', 'X', 'Y', 'Z', 'CNOT', 'SWAP', 'RX', 'RY', 'RZ', 'PHASE', 'MEASURE']
  return validTypes.includes(type as GateType) ? type as GateType : 'H'
}

export async function analyzeCircuit(circuit: Circuit): Promise<CircuitAnalysis> {
  if (!OPENAI_API_KEY) {
    return {
      description: 'AI analysis not available - API key not configured',
      complexity: 'Unknown',
      estimatedExecutionTime: 'Unknown',
      potentialApplications: ['Analysis not available'],
      optimizationSuggestions: ['Configure OpenAI API key for analysis']
    }
  }

  try {
    const systemPrompt = `You are a quantum computing expert. Analyze the provided quantum circuit and provide detailed insights.

Provide analysis in the following JSON format:
{
  "description": "Clear description of what the circuit does",
  "complexity": "Assessment of circuit complexity (e.g., 'Low', 'Medium', 'High')",
  "estimatedExecutionTime": "Estimated execution time on quantum hardware",
  "potentialApplications": ["List of potential applications"],
  "optimizationSuggestions": ["List of optimization suggestions"]
}

Focus on:
- Circuit functionality and purpose
- Quantum algorithm identification
- Performance characteristics
- Real-world applications
- Optimization opportunities`

    const userPrompt = `Analyze this quantum circuit:

Circuit: ${JSON.stringify(circuit, null, 2)}

Provide a comprehensive analysis of this circuit's functionality, complexity, and applications.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response content from OpenAI')
    }

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response')
    }

    const analysis = JSON.parse(jsonMatch[0])
    
    return {
      description: analysis.description || 'Analysis not available',
      complexity: analysis.complexity || 'Unknown',
      estimatedExecutionTime: analysis.estimatedExecutionTime || 'Unknown',
      potentialApplications: Array.isArray(analysis.potentialApplications) ? analysis.potentialApplications : ['Analysis not available'],
      optimizationSuggestions: Array.isArray(analysis.optimizationSuggestions) ? analysis.optimizationSuggestions : ['Analysis not available']
    }

  } catch (error) {
    console.error('Circuit analysis error:', error)
    return {
      description: 'Failed to analyze circuit - please try again',
      complexity: 'Unknown',
      estimatedExecutionTime: 'Unknown',
      potentialApplications: ['Analysis failed'],
      optimizationSuggestions: ['Try again later']
    }
  }
}

export async function getCircuitSuggestions(circuit: Circuit): Promise<string[]> {
  if (!OPENAI_API_KEY) {
    return ['Configure OpenAI API key for suggestions']
  }

  try {
    const systemPrompt = `You are a quantum computing expert. Provide helpful suggestions for improving or extending the given quantum circuit.

Return suggestions as a JSON array of strings:
["Suggestion 1", "Suggestion 2", "Suggestion 3"]

Focus on:
- Circuit improvements
- Additional gates that could be useful
- Alternative approaches
- Performance optimizations
- Educational insights`

    const userPrompt = `Provide suggestions for this quantum circuit:

Circuit: ${JSON.stringify(circuit, null, 2)}

Give 3-5 helpful suggestions for improving or understanding this circuit.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.4,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response content from OpenAI')
    }

    // Extract JSON array from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('No valid JSON array found in response')
    }

    const suggestions = JSON.parse(jsonMatch[0])
    
    return Array.isArray(suggestions) ? suggestions : ['No suggestions available']

  } catch (error) {
    console.error('Circuit suggestions error:', error)
    return ['Failed to get suggestions - please try again']
  }
} 