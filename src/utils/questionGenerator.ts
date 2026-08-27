import { DifficultyLevel, Question } from '../types';

export function generateQuestionSet(level: DifficultyLevel, count = 10): Question[] {
  const questions: Question[] = [];

  // If hard level, make sure 678 - ? = 243 is guaranteed as one of the highlighted questions
  if (level === 'hard') {
    questions.push({
      id: 'featured-678',
      type: 'sub_unknown_subtrahend',
      num1: 678,
      num2: 243,
      missingPosition: 'second',
      operator: '-',
      targetResult: 243,
      correctAnswer: 435,
      options: [435, 921, 445, 425],
      storyText: 'Tentukan bilangan misteri yang tepat untuk melengkapi persamaan: 678 - ... = 243',
      explanation: {
        rule: 'Untuk mencari bilangan kedua pada pengurangan (678 - ? = 243)',
        step1: 'Gunakan rumus: Bilangan Pengurang = Bilangan Pertama - Hasil',
        step2: 'Hitung bersusun: 678 - 243 = 435',
        inverseFormula: '678 - 243 = 435',
      },
    });
  }

  while (questions.length < count) {
    const q = createSingleQuestion(level, questions.length);
    // Avoid duplicate IDs
    if (!questions.some(item => item.id === q.id || (item.num1 === q.num1 && item.correctAnswer === q.correctAnswer))) {
      questions.push(q);
    }
  }

  // Shuffle options in all questions
  return questions.map(q => ({
    ...q,
    options: shuffleArray([...q.options]),
  }));
}

function createSingleQuestion(level: DifficultyLevel, index: number): Question {
  const types: Question['type'][] = [
    'sub_unknown_subtrahend',
    'sub_unknown_minuend',
    'add_unknown_first',
    'add_unknown_second',
  ];
  const selectedType = types[Math.floor(Math.random() * types.length)];

  let num1 = 0;
  let num2 = 0;
  let correctAnswer = 0;
  let targetResult = 0;
  let operator: '+' | '-' = '-';
  let missingPos: 'first' | 'second' = 'second';

  let min = 10;
  let max = 99;
  if (level === 'medium') {
    min = 100;
    max = 500;
  } else if (level === 'hard') {
    min = 250;
    max = 999;
  }

  if (selectedType === 'sub_unknown_subtrahend') {
    // A - ? = B  => ? = A - B
    num1 = getRandomInt(min + 20, max);
    correctAnswer = getRandomInt(10, num1 - 5);
    targetResult = num1 - correctAnswer;
    operator = '-';
    missingPos = 'second';
  } else if (selectedType === 'sub_unknown_minuend') {
    // ? - A = B  => ? = B + A
    num2 = getRandomInt(10, Math.floor(max / 2));
    targetResult = getRandomInt(10, Math.floor(max / 2));
    correctAnswer = num2 + targetResult;
    num1 = correctAnswer;
    operator = '-';
    missingPos = 'first';
  } else if (selectedType === 'add_unknown_first') {
    // ? + A = B  => ? = B - A
    correctAnswer = getRandomInt(min / 2, max / 2);
    num2 = getRandomInt(min / 2, max / 2);
    targetResult = correctAnswer + num2;
    operator = '+';
    missingPos = 'first';
  } else {
    // A + ? = B  => ? = B - A
    num1 = getRandomInt(min / 2, max / 2);
    correctAnswer = getRandomInt(min / 2, max / 2);
    targetResult = num1 + correctAnswer;
    operator = '+';
    missingPos = 'second';
  }

  // Create plausible distractors
  const optionsSet = new Set<number>();
  optionsSet.add(correctAnswer);

  // Common student calculation trap 1: wrong operation (adding instead of subtracting or vice versa)
  if (operator === '-' && missingPos === 'second') {
    optionsSet.add(num1 + targetResult); // e.g. 678 + 243
  } else if (operator === '+' && missingPos === 'second') {
    if (targetResult + num1 > 0) optionsSet.add(targetResult + num1);
  }

  // Common trap 2: off by 10 (borrowing / carrying error)
  optionsSet.add(correctAnswer + 10);
  if (correctAnswer - 10 > 0) optionsSet.add(correctAnswer - 10);
  optionsSet.add(correctAnswer + 100);
  if (correctAnswer - 100 > 0) optionsSet.add(correctAnswer - 100);
  optionsSet.add(correctAnswer + 2);
  if (correctAnswer - 2 > 0) optionsSet.add(correctAnswer - 2);

  // Pick 4 unique options
  const optionsArray = Array.from(optionsSet).filter(n => n > 0 && n !== correctAnswer);
  const pickedOptions = [correctAnswer];
  while (pickedOptions.length < 4 && optionsArray.length > 0) {
    const randIdx = Math.floor(Math.random() * optionsArray.length);
    pickedOptions.push(optionsArray.splice(randIdx, 1)[0]);
  }
  while (pickedOptions.length < 4) {
    const fallback = correctAnswer + (pickedOptions.length * 5);
    pickedOptions.push(fallback);
  }

  let storyText = '';
  let rule = '';
  let step1 = '';
  let step2 = '';
  let inverseFormula = '';

  if (operator === '-' && missingPos === 'second') {
    storyText = `Berapa bilangan yang tepat untuk: ${num1} - ... = ${targetResult}?`;
    rule = `Mencari bilangan pengurang (${num1} - ? = ${targetResult})`;
    step1 = `Kurangkan bilangan awal dengan hasil akhir.`;
    step2 = `${num1} - ${targetResult} = ${correctAnswer}`;
    inverseFormula = `${num1} - ${targetResult} = ${correctAnswer}`;
  } else if (operator === '-' && missingPos === 'first') {
    storyText = `Berapa bilangan yang tepat untuk: ... - ${num2} = ${targetResult}?`;
    rule = `Mencari bilangan yang dikurangi (? - ${num2} = ${targetResult})`;
    step1 = `Jumlahkan hasil dengan bilangan pengurang.`;
    step2 = `${targetResult} + ${num2} = ${correctAnswer}`;
    inverseFormula = `${targetResult} + ${num2} = ${correctAnswer}`;
  } else if (operator === '+' && missingPos === 'first') {
    storyText = `Berapa bilangan yang tepat untuk: ... + ${num2} = ${targetResult}?`;
    rule = `Mencari suku pertama penjumlahan (? + ${num2} = ${targetResult})`;
    step1 = `Gunakan operasi kebalikan: kurangkan hasil dengan bilangan kedua.`;
    step2 = `${targetResult} - ${num2} = ${correctAnswer}`;
    inverseFormula = `${targetResult} - ${num2} = ${correctAnswer}`;
  } else {
    storyText = `Berapa bilangan yang tepat untuk: ${num1} + ... = ${targetResult}?`;
    rule = `Mencari suku kedua penjumlahan (${num1} + ? = ${targetResult})`;
    step1 = `Gunakan operasi kebalikan: kurangkan hasil dengan bilangan pertama.`;
    step2 = `${targetResult} - ${num1} = ${correctAnswer}`;
    inverseFormula = `${targetResult} - ${num1} = ${correctAnswer}`;
  }

  return {
    id: `q-${level}-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: selectedType,
    num1,
    num2,
    missingPosition: missingPos,
    operator,
    targetResult,
    correctAnswer,
    options: pickedOptions,
    storyText,
    explanation: {
      rule,
      step1,
      step2,
      inverseFormula,
    },
  };
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
