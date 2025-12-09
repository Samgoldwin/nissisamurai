# Nissi Samurai - Official Rulebook

## 1. Introduction
Nissi Samurai is a tactical 1v1 board game played on a 10x10 grid. It combines the deterministic nature of Chess with meaningful spatial dynamics.

## 2. Objective
Win the game by achieving one of the following:
1.  **Assassination (Instant Win)**: Capture the enemy **Protector**.
2.  **Attrition (Time Win)**: Have a higher **Army Score** when the timer expires.

## 3. The Units

### 🗡️ Samurai (5 Points)
The backbone of your army.
*   **Movement**: Can move 1 step **Forward**, **Left**, or **Right**.
*   **Restrictions**: Cannot move Backward or Diagonally.
*   **Capture**: Moves onto an enemy tile to capture it.

### 🛡️ Protector (10 Points)
Your most valuable unit.
*   **Normal State**: Moves 1 step in any direction (Forward, Backward, Sideways, Diagonal).
*   **Promotion (Raging State)**: 
    *   **Trigger**: The Protector becomes Promoted when it stands on the **Furthest Enemy Row** (Row 0 for Player, Row 9 for AI).
    *   **Ability**: Moves infinite distance in any direction (like a Chess Queen) while in this state.
    *   **Loss of Power**: If the Promoted Protector moves away from the End Row, it immediately reverts to the **Normal State**.

## 4. Controls (Keyboard)

### Selection
Each of your pieces is assigned a specific key:
*   **Z**: Samurai 1 (Leftmost)
*   **X**: Samurai 2
*   **C**: Protector (Center)
*   **V**: Samurai 3
*   **B**: Samurai 4 (Rightmost)

### Movement
Once a piece is selected:
*   **Arrow Keys**: Move 1 step (Up/Down/Left/Right).
*   **Direct Coordinate Input**: Type a letter (A-J) followed by a number (0-9) to jump to a specific tile (e.g., "A5"). This is essential for long-range Protector moves.

### Other
*   **Escape**: Deselect current piece.
*   **P**: Pass turn (Not currently implemented, moves are mandatory if possible).

## 5. Game Modes
*   **PVE**: Play against an AI opponent.
*   **PVP**: Play locally with a friend (shared keyboard).

## 6. Strategy Tips
1.  **The Sniper Nest**: Rush your Protector to the enemy's backline to unlock its full potential.
2.  **The Shield Wall**: Use your Samurai to block enemy advances. Since they can move sideways, they are excellent at creating impenetrable lines.
3.  **The Bait**: Lure the enemy Protector out of their promotion zone. Once they leave the backline, they become slow and vulnerable.
