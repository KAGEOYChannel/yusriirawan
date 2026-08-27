export type GameMode = "learn" | "story" | "adventure" | "speed" | "leaderboard";

export type DifficultyLevel = "easy" | "medium" | "hard" | "master";

export type OperationType = "+" | "-";

export interface MathProblem {
  id: string;
  equation: string; // e.g. "678 - ... = 243"
  displayLeft: string; // "678" or "..." or "678 - ..."
  displayRight: string; // "243"
  operation: OperationType;
  num1: number;
  num2: number;
  missingValue: number;
  unknownPosition: "first" | "second" | "result"; // e.g., "... - 243 = 435" (first), "678 - ... = 243" (second), "678 - 243 = ..." (result)
  difficulty: DifficultyLevel;
  options: number[]; // 4 choices
  hint: string;
  explanationStep: string;
  storyContext?: string;
  category: string;
}

export interface StoryMission {
  id: string;
  title: string;
  theme: "bakery" | "orchard" | "pirate" | "space" | "jungle" | "custom";
  character: string;
  characterAvatar: string;
  bgGradient: string;
  itemEmoji: string;
  storyText: string;
  num1: number;
  num2: number;
  operation: OperationType;
  unknownPos: "first" | "second" | "result";
  missingValue: number;
  equation: string;
  questionPrompt: string;
  initialItemsCount: number;
  finalItemsCount: number;
  explanation: string;
  animationType: "take_away" | "add_to" | "balance_chest" | "rocket_launch";
}

export interface StudentProfile {
  id: string;
  name: string;
  avatar: string;
  grade: string; // e.g. "Kelas 3 SD", "Kelas 4 SD"
  xp: number;
  stars: number;
  level: number;
  rankTitle: string;
  highScoreSpeed: number;
  completedStories: string[];
  completedLevels: number[];
  streakDays: number;
  badges: string[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  xp: number;
  stars: number;
  solvedCount: number;
  speedScore: number;
  rankTitle: string;
  isCurrentUser?: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  requiredXp?: number;
  requiredStories?: number;
  requiredSpeed?: number;
}
