export type GateType = 
  | 'H'      // Hadamard
  | 'X'      // Pauli-X (NOT)
  | 'Y'      // Pauli-Y
  | 'Z'      // Pauli-Z
  | 'CNOT'   // Controlled NOT
  | 'SWAP'   // SWAP
  | 'RX'     // Rotation around X-axis
  | 'RY'     // Rotation around Y-axis
  | 'RZ'     // Rotation around Z-axis
  | 'PHASE'  // Phase shift
  | 'MEASURE' // Measurement

export interface Gate {
  id: string
  type: GateType
  qubit: number
  time: number
  parameters: Record<string, number>
  controlQubit?: number // For controlled gates
  targetQubit?: number  // For controlled gates
}

export interface Measurement {
  id: string
  qubit: number
  time: number
  basis: 'computational' | 'bell' | 'custom'
}

export interface Circuit {
  id: string
  name: string
  qubits: number
  gates: Gate[]
  measurements: Measurement[]
  description?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CircuitResult {
  circuitId: string
  measurements: Record<number, number>
  stateVector?: number[]
  executionTime: number
  shots: number
} 