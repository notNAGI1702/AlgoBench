# AlgoBench

AlgoBench is an advanced, highly interactive web-based algorithm visualizer that enables users to see algorithms come to life. The application features real-time visualizations for sorting, searching, and pathfinding algorithms, a "race mode" to compare multiple algorithms side-by-side, and an integrated sandboxed code execution engine where users can write, run, and step through custom code in an embedded Monaco Editor. It provides a rich, responsive user interface with comprehensive step-by-step playback controls, detailed performance statistics, and visual canvas renderings.

## Tech Stack
- **Frontend Framework:** React
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Code Editor:** Monaco Editor
- **Concurreny/Sandbox:** Web Workers

## Setup Instructions
1. Clone the repo:
   ```bash
   git clone https://github.com/notNAGI1702/AlgoBench.git
   cd AlgoBench
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## How It Works
- **Step Engine:** The visualizer core relies on a stateful playback engine that breaks algorithm execution down into discrete visual/logical steps. This allows users to play, pause, step forward, step backward, adjust execution speed, and inspect current variables at any point in the run.
- **Sandboxed Code Execution Pipeline:** Custom code written in the Monaco Editor is processed and executed within a dedicated Web Worker sandbox. The engine hooks into the execution flow, instrumenting user code or running it step-by-step, capturing state snapshots after each statement, and posting updates back to the main UI thread to drive the visualizations safely without blocking the browser.

## Screenshot
![App Screenshot](screenshot.png)

## License
MIT
