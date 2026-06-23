import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ujyualsgihlmiimcrmjb.supabase.co';
const supabaseKey = 'sb_publishable_BlkT28bsh8eiTwDzlmyGbA_HGOlRD3v';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types
export interface Exam {
  id: string;
  exam_code: string;
  title: string;
  description: string;
  grade_level: string;
  duration_minutes: number;
  total_questions: number;
  is_active: boolean;
  created_at: string;
}

export interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd';
  explanation: string;
  question_order: number;
}

export interface StudentResult {
  id: string;
  student_name: string;
  student_phone: string;
  exam_id: string;
  exam_code: string;
  exam_title: string;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  score_percentage: number;
  answers: Record<string, {
    question: string;
    student_answer: string;
    correct_answer: string;
    is_correct: boolean;
    options: { a: string; b: string; c: string; d: string };
    explanation: string;
  }>;
  time_taken_seconds: number;
  created_at: string;
}
