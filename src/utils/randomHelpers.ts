/**
 * دوال مساعدة للعمليات العشوائية
 */

/**
 * اختيار عدد عشوائي من العناصر من مصفوفة
 */
export const getRandomItems = <T>(array: T[], count: number): T[] => {
  if (count >= array.length) return array;
  
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

/**
 * خلط مصفوفة (Fisher-Yates shuffle)
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * إعادة ترتيب الخيارات بشكل عشوائي وإرجاع الإجابة الصحيحة الجديدة
 */
export const shuffleOptions = (
  options: { a: string; b: string; c: string; d: string },
  correctAnswer: string
): { shuffled: { a: string; b: string; c: string; d: string }; newCorrectAnswer: string } => {
  const optionsArray = [
    { key: 'a', value: options.a },
    { key: 'b', value: options.b },
    { key: 'c', value: options.c },
    { key: 'd', value: options.d },
  ];

  const shuffledOptions = shuffleArray(optionsArray);
  
  const newOptionsMap: { [key: string]: string } = {};
  let newCorrectAnswer = '';

  shuffledOptions.forEach((option, index) => {
    const newKey = String.fromCharCode(97 + index); // a, b, c, d
    newOptionsMap[newKey] = option.value;
    
    if (option.key === correctAnswer) {
      newCorrectAnswer = newKey;
    }
  });

  return {
    shuffled: newOptionsMap as { a: string; b: string; c: string; d: string },
    newCorrectAnswer,
  };
};

/**
 * حساب النسبة المئوية
 */
export const calculatePercentage = (correct: number, total: number): number => {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
};
