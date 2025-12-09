export const GRID_SIZE = 10;
export const CELL_SIZE_PX = 40; // Base size for calculations, though we use responsive CSS

export const POINTS = {
  PROTECTOR: 10,
  SAMURAI: 5,
};

// Initial Positions
// Player is at the bottom (Rows 8, 9 for a 10x10)
// AI is at the top (Rows 0, 1)
export const INITIAL_BOARD_SETUP = {
  PLAYER_ROW_START: GRID_SIZE - 2,
  AI_ROW_START: 0,
};