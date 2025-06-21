import OpenAI from 'openai'
import { Circuit } from '../types/circuit'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
})

export interface CircuitAnalysis {
  description: string
  complexity: string
  potentialApplications: string[]
  optimizationSuggestions: string[]
  estimatedExecutionTime: string
}

export const analyzeCircuit = async (circuit: Circuit): Promise<CircuitAnalysis> => {
  try {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }

    const circuitDescription = generateCircuitDescription(circuit)
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a quantum computing expert. Analyze the given quantum circuit and provide insights about its purpose, complexity, potential applications, and optimization opportunities. Be concise but informative.`
        },
        {
          role: "user",
          content: `Please analyze this quantum circuit:\n\n${circuitDescription}\n\nProvide analysis in the following format:
          - Description: What this circuit does
          - Complexity: Simple/Medium/Complex
          - Potential Applications: List 2-3 applications
          - Optimization Suggestions: 1-2 suggestions for improvement
          - Estimated Execution Time: Rough estimate for execution`
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })

    const analysis = response.choices[0]?.message?.content || ''
    
    // Parse the response into structured format
    return parseAnalysisResponse(analysis)
  } catch (error) {
    console.error('Error analyzing circuit:', error)
    return {
      description: 'Unable to analyze circuit at this time. Please check your OpenAI API key configuration.',
      complexity: 'Unknown',
      potentialApplications: ['Analysis unavailable'],
      optimizationSuggestions: ['Check circuit configuration'],
      estimatedExecutionTime: 'Unknown'
    }
  }
}

export const getCircuitSuggestions = async (circuit: Circuit): Promise<string[]> => {
  try {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }

    const circuitDescription = generateCircuitDescription(circuit)
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a quantum computing expert. Provide 3 specific suggestions for improving or extending the given quantum circuit. Focus on practical, implementable improvements.`
        },
        {
          role: "user",
          content: `Here's my quantum circuit:\n\n${circuitDescription}\n\nProvide 3 specific suggestions for improvement or extension.`
        }
      ],
      max_tokens: 300,
      temperature: 0.8
    })

    const suggestions = response.choices[0]?.message?.content || ''
    return suggestions.split('\n').filter(s => s.trim().length > 0).slice(0, 3)
  } catch (error) {
    console.error('Error getting suggestions:', error)
    return ['Unable to generate suggestions. Please check your OpenAI API key configuration.']
  }
}

const generateCircuitDescription = (circuit: Circuit): string => {
  const gateCounts: Record<string, number> = {}
  circuit.gates.forEach(gate => {
    gateCounts[gate.type] = (gateCounts[gate.type] || 0) + 1
  })

  const gateSummary = Object.entries(gateCounts)
    .map(([type, count]) => `${count} ${type}`)
    .join(', ')

  return `
Circuit: ${circuit.name}
Qubits: ${circuit.qubits}
Total Gates: ${circuit.gates.length}
Gate Types: ${gateSummary}
Circuit Depth: ${circuit.gates.length > 0 ? Math.max(...circuit.gates.map(g => g.time)) + 1 : 0}

Gate Sequence:
${circuit.gates.map(gate => 
  `Time ${gate.time}: ${gate.type} on qubit ${gate.qubit}${gate.parameters.angle ? ` (angle: ${gate.parameters.angle})` : ''}`
).join('\n')}
  `.trim()
}

const parseAnalysisResponse = (response: string): CircuitAnalysis => {
  const lines = response.split('\n')
  
  const description = lines.find(line => line.includes('Description:'))?.replace('Description:', '').trim() || 'No description available'
  const complexity = lines.find(line => line.includes('Complexity:'))?.replace('Complexity:', '').trim() || 'Unknown'
  const applications = lines.find(line => line.includes('Potential Applications:'))?.replace('Potential Applications:', '').trim().split(',').map(s => s.trim()) || ['Unknown']
  const suggestions = lines.find(line => line.includes('Optimization Suggestions:'))?.replace('Optimization Suggestions:', '').trim().split(',').map(s => s.trim()) || ['No suggestions']
  const executionTime = lines.find(line => line.includes('Estimated Execution Time:'))?.replace('Estimated Execution Time:', '').trim() || 'Unknown'

  return {
    description,
    complexity,
    potentialApplications: applications,
    optimizationSuggestions: suggestions,
    estimatedExecutionTime: executionTime
  }
} 