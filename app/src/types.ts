export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  type: 'sub_unknown_subtrahend' | 'sub_unknown_minuend' | 'add_unknown_first' | 'add_unknown_second';
  // Equation representation:
  // e.g. 678 - ? = 243
  num1?: number; // 678
  num2?: number; // 243
  missingPosition: 'first' | 'second' | 'result';
  operator: '+' | '-';
  targetResult: number;
  correctAnswer: number;
  options: number[];
  storyText?: string;
  explanation: {
    rule: string;
    step1: string;
    step2: string;
    inverseFormula: string;
  };
}

export interface StoryScenario {
  id: string;
  title: string;
  character: string;
  themeColor: string;
  icon: string;
  story: string;
  initialValue: number;
  finalValue: number;
  operator: '+' | '-';
  missingType: 'subtrahend' | 'minuend' | 'addend1' | 'addend2';
  equationFormula: string;
  correctAnswer: number;
  visualType: 'marbles' | 'apples' | 'donuts' | 'books' | 'cards' | 'seedlings';
  storySteps: {
    text: string;
    visualHighlight: string;
  }[];
  explanation: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  totalScore: number;
  stars: number;
  quizzesCompleted: number;
  storiesCompleted: number;
  highestStreak: number;
  unlockedBadges: string[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
  stars: number;
  level: DifficultyLevel | 'all';
  date: string;
  isCurrentPlayer?: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}
