# Nissi Samurai: Engineering Findings & Strategic Analysis

## 1. Mechanics Engineering
The game operates on a deterministic grid with a distinct asymmetry in movement capabilities based on unit type.
*   **Samurai (Pawns):** Linear, unidirectional movement. They act as "blockers" and "traders".
*   **Protector (The Sniper King):** 
    *   **Phase 1 (The Approach):** Single-step movement (1 tile in any direction) anywhere on the board except the opponent's end row.
    *   **Phase 2 (The Turret State):** **ONLY** when standing on the opponent's end row, the Protector gains **Infinite Range** (Queen movement).
    *   **Phase 3 (The Discharge):** If the Protector uses its infinite range to move *away* from the end row (e.g., to snipe an enemy mid-board), it **immediately loses** the infinite range ability and reverts to Phase 1. It must climb back to the end row to recharge.

## 2. Tactics

### The "Sniper Nest" Tactic
*   The goal is to get your Protector to the end row. Once there, you control the entire board.
*   *Warning:* If you leave the nest to take a kill, you become a weak walker again.
*   *Strategy:* Only leave the end row for a game-winning kill (Enemy Protector) or a high-value trade that cripples the enemy's offense. Otherwise, use the infinite movement to slide left/right *along* the end row to threaten different angles.

### The "Single Line" Formation (The Phalanx)
With all units starting on Row 0/9:
*   **Strength:** Maximum initial coverage.
*   **Weakness:** The Protector is exposed.
*   **Strategy:** Move Samurai forward to create space.

### The "Trade War"
*   Points are calculated based on *alive* units at the time limit.
*   If you have a score lead, stall. Force the opponent to come into your Protector's range.

## 3. Loopholes & Anomalies

### 1. The "Recharge" Vulnerability
A player might bait the enemy Protector out of the end row by sacrificing a Samurai. Once the Protector moves out to kill the Samurai, it is now "discharged" (1-step move) and vulnerable to being surrounded or captured by the remaining enemy forces.

### 2. The Diagonal Slip
Samurai only capture forward. A weak Protector can zigzag diagonally between enemy Samurai to reach the "Sniper Nest".

### 3. The Suicide King
Killing the Protector ends the game. The Protector is your strongest weapon (when in the zone) but also your only defeat condition. Using it offensively is the ultimate risk.

## 4. Engineering Recommendations for AI
*   **Priority 0:** Protect the King.
*   **Priority 1:** Kill Enemy King (Win).
*   **Priority 2:** Reach the "Power Zone" (End Row).
*   **Priority 3:** If in Power Zone, only leave if it guarantees a high-value kill or saves the game.
