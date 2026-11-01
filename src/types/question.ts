export type GameId = 'g1' | 'g2' | 'g3' | 'g4' | 'g5';

export interface SocraticScaffolding {
  tier1Perception: string; // 第一階：知覺引導提問（觀察現象）
  tier2Action: string;     // 第二階：操作鷹架指示（動手實作）
  tier3Concept: string;    // 第三階：算則本質收斂（抽象公式）
  reflection: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface BaseQuestion {
  id: string;
  gameId: GameId;
  title: string;
  storyPrompt: string; // 情境題幹文字
  speechText: string;  // 語音朗讀文本
  scaffolding: SocraticScaffolding;
}

// G1: 200以內的數 (位值化聚、比大小、跳數)
export interface G1Question extends BaseQuestion {
  hundreds: number;
  tens: number;
  ones: number;
  targetAmount: number;
  mode: 'regroup' | 'compare' | 'skip_count';
  compareTarget?: { name: string; amount: number; hundreds: number; tens: number; ones: number };
  skipCount?: {
    step: 2 | 5 | 10;
    direction: 'forward' | 'backward';
    sequence: (number | null)[]; // 挖空處為 null
    correctAnswers: number[];
  };
}

// G2: 二位數加減 (進退位、墨水污漬破譯、抓蟲特工)
export interface G2Question extends BaseQuestion {
  operation: '+' | '-';
  num1: number;
  num2: number;
  mode: 'vertical' | 'stain_puzzle' | 'bug_buster';
  stains?: {
    part: 'num1_tens' | 'num1_ones' | 'num2_tens' | 'num2_ones' | 'ans_tens' | 'ans_ones';
    label: '甲' | '乙';
    correctValue: number;
  }[];
  bugBuster?: {
    wrongAnswer: number;
    bugReason: string;
    options: string[];
    correctOptionIndex: number;
  };
}

// G3: 公分長度測量 (斷尺差量、逆向推算、雙物比較)
export interface G3Question extends BaseQuestion {
  rulerMin: number;
  rulerMax: number;
  objectStart: number;
  objectEnd: number;
  objectName: string;
  mode: 'measure_diff' | 'draw_line' | 'compare_two';
  secondObject?: {
    name: string;
    start: number;
    end: number;
  };
  targetDrawLength?: number;
}

// G4: 兩步驟加減混合 (收銀找零、預算評估、逆向求原量)
export interface G4Question extends BaseQuestion {
  scenarioType: 'market_change' | 'budget_check' | 'reverse_original' | 'reverse_compare';
  step1: {
    label: string;
    num1: number;
    op: '+' | '-';
    num2: number;
    expected: number;
  };
  step2: {
    label: string;
    num1FromStep1: boolean;
    num1Custom?: number;
    op: '+' | '-';
    num2: number;
    expected: number;
    unit: string;
  };
  budgetCheck?: {
    budget: number;
    totalCost: number;
    isEnough: boolean;
    diff: number;
  };
}

// G5: 平面圖形與直線 (直線端點、L型卡規、旋轉45度破偏誤)
export interface G5Question extends BaseQuestion {
  shapeType: 'square' | 'rectangle' | 'rhombus' | 'triangle' | 'straight_line';
  rotationDeg: number;
  sides: number[];     // 各邊長度 (cm)
  angles: number[];    // 各角角度 (例如 [90, 90, 90, 90])
  isStandardSquare: boolean;
  questionPrompt: string;
  options?: string[];
  correctAnswer?: string;
}

export type AnyQuestion = G1Question | G2Question | G3Question | G4Question | G5Question;
