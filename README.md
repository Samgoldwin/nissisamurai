# Nissi Samurai

**Strategy on the Line.**

Nissi Samurai is a tactical 1v1 board game played on a grid of points. It combines the deterministic nature of Chess with a unique dynamic movement mechanic.

## 🎮 Game Rules

### **Objective**
Win by either:
1.  **Assassination**: Capture the enemy **Protector**.
2.  **Attrition**: Have a higher score (Army Value) when the time limit expires.

### **The Units**
*   **Samurai (5 Points)**: 
    *   Moves 1 step forward.
    *   Captures diagonally forward (or 1 step forward into an enemy).
    *   *Role:* The Phalanx. Use them to block paths and force trades.
*   **Protector (10 Points)**: 
    *   **Normal State**: Moves 1 step in any direction. Vulnerable.
    *   **Raging State (The Sniper)**: When standing on the **Opponent's End Row**, moves like a Queen (Infinite range in all directions).
    *   *Constraint:* If the Protector leaves the End Row to move to the middle of the board, it **immediately loses** its Raging powers and reverts to the Normal State.

### **Game Modes**
*   **PVE**: Play against a greedy heuristic AI.
*   **PVP**: Local multiplayer on the same device.

## 🛠 Tech Stack
*   **Frontend**: React 18, TypeScript
*   **Styling**: Tailwind CSS (Minimalist White/Black/Red/Blue theme)
*   **Animation**: CSS Keyframes for slash effects and movement indicators.
*   **Build Tool**: Vite

## 🚀 Running Locally

To run this project on your local machine, follow these steps:

### Prerequisites
*   Node.js (v14 or higher)
*   npm (or yarn/pnpm)

### Installation

1.  **Clone the repository** (or download the files):
    ```bash
    git clone <repository-url>
    cd nissi-samurai
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

## 🧠 Strategy Guide
*   **The Sniper Nest**: Rush your Protector to the end of the board to turn it into a turret.
*   **The Bait**: Lure the enemy Protector out of their nest. Once they step out to kill a pawn, they lose their infinite movement and can be trapped.
*   **Time Management**: If you are up on points, play defensively. The burden of attack is on the losing player.
