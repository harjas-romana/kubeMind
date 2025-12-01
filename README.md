# KubeMind Dashboard

A real-time Kubernetes cluster monitoring and auto-scaling dashboard powered by AI. This React application provides live telemetry visualization, intelligent pod scaling decisions, and voice-assisted alerts for Kubernetes environments.

## Features

- **Real-time Telemetry**: Live CPU load monitoring and pod replica counts via WebSocket connections
- **AI-Powered Auto-Scaling**: Intelligent scaling decisions based on system metrics and traffic patterns
- **Voice Alerts**: Text-to-speech notifications for critical events and scaling actions
- **Interactive Controls**: Manual intervention capabilities for testing and overrides
- **Visual Cluster Topology**: Dynamic visualization of active pod replicas
- **System Logs**: Real-time logging with animated updates
- **Connection Status**: Live WebSocket connection monitoring

## Tech Stack

- **Frontend**: React 19 with Vite
- **Styling**: Tailwind CSS 4 with custom animations
- **Animations**: Framer Motion for smooth UI transitions
- **Icons**: Lucide React for consistent iconography
- **HTTP Client**: Axios for API communications
- **WebSocket**: Native WebSocket API for real-time data
- **Build Tool**: Vite for fast development and optimized builds
- **Linting**: ESLint with React-specific rules

## Prerequisites

- Node.js (v18 or higher)
- A running KubeMind backend API server
- WebSocket-enabled environment

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd kubemind-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory:
   ```
   VITE_API_URL=http://localhost:8000
   ```
   Replace with your actual backend API URL.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173`

## Usage

1. **Connect to Backend**: Ensure your KubeMind API server is running and accessible
2. **Monitor Metrics**: View real-time CPU usage and active pod counts
3. **Observe Auto-Scaling**: Watch as the AI automatically scales replicas based on load
4. **Manual Intervention**: Use the "Force AI Intervention" button to simulate traffic spikes
5. **Voice Feedback**: Listen to audio alerts for scaling decisions and system events

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## Environment Variables

- `VITE_API_URL` - Backend API endpoint (default: http://localhost:8000)

## Architecture

The dashboard connects to a backend service that:
- Streams live metrics via WebSocket (`/ws/stats`)
- Provides AI analysis via HTTP POST to `/analyze`
- Generates voice alerts via HTTP POST to `/speak`

## Contributing

1. Follow the existing code style and ESLint rules
2. Test WebSocket connections and API integrations
3. Ensure responsive design works across devices
4. Add proper error handling for network failures

## License

This project is private and proprietary.

