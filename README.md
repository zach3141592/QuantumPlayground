# cursor for building quantum circuits

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key (for AI analysis features)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/zach3141592/QuantumPlayground.git
cd QuantumPlayground
```

2. Install dependencies:

```bash
npm install
```

3. Configure OpenAI API (optional, for AI analysis):

   - Copy `env.example` to `.env.local`
   - Add your OpenAI API key:

   ```bash
   cp env.example .env.local
   ```

   - Edit `.env.local` and replace `your_openai_api_key_here` with your actual OpenAI API key
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

### Adding Gates

1. Select a gate from the left sidebar palette
2. Click on the circuit canvas to place the gate
3. Gates are automatically positioned on the grid

### Editing Gates

1. Click on any gate in the circuit to select it
2. Use the properties panel on the right to modify parameters
3. Delete gates using the red delete button that appears on hover

### Circuit Management

- Edit circuit name and number of qubits in the properties panel
- View circuit statistics including depth and gate count
- Run circuits (simulation mode)
- Use AI Analysis to get insights about your circuit (requires OpenAI API key)

### AI Analysis

- Click the "AI Analysis" button in the header to analyze your circuit
- Get insights about circuit purpose, complexity, and potential applications
- Receive optimization suggestions and improvement recommendations

## Project Structure

```
src/
├── components/
│   ├── CircuitCanvas.tsx    # Main circuit visualization
│   ├── GatePalette.tsx      # Gate selection panel
│   └── PropertiesPanel.tsx  # Gate and circuit properties
├── services/
│   └── openai.ts           # OpenAI API integration
├── types/
│   └── circuit.ts          # TypeScript type definitions
├── App.tsx                 # Main application component
├── main.tsx               # Application entry point
└── index.css              # Global styles
```

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Vite** - Build tool and dev server
- **OpenAI API** - AI-powered circuit analysis

## Quantum Gates Supported

- **H (Hadamard)**: Creates superposition states
- **X (Pauli-X)**: Quantum NOT gate
- **Y (Pauli-Y)**: Y-axis rotation
- **Z (Pauli-Z)**: Z-axis rotation
- **CNOT**: Controlled NOT gate
- **SWAP**: Exchanges qubit states
- **RX/RY/RZ**: Rotation gates with configurable angles
- **Phase**: Phase shift gate
- **Measure**: Measurement gate

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

## License

This project is licensed under the MIT License.
