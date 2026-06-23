-- ═══════════════════════════════════════════════════════
-- منصة الأستاذ محمد فراج - مدرس التاريخ
-- ملف النظام الأساسي - إنشاء الجداول
-- ═══════════════════════════════════════════════════════

-- جدول الامتحانات
CREATE TABLE IF NOT EXISTS exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  grade_level VARCHAR(100),
  duration_minutes INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- جدول الأسئلة
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('a','b','c','d')),
  explanation TEXT,
  question_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- جدول نتائج الطلاب
CREATE TABLE IF NOT EXISTS student_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  student_phone VARCHAR(20),
  exam_id UUID REFERENCES exams(id),
  exam_code VARCHAR(50),
  exam_title VARCHAR(255),
  total_questions INTEGER,
  correct_answers INTEGER,
  wrong_answers INTEGER,
  score_percentage DECIMAL(5,2),
  answers JSONB,
  time_taken_seconds INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_exam_code ON exams(exam_code);
CREATE INDEX IF NOT EXISTS idx_results_exam ON student_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_results_date ON student_results(created_at DESC);

-- تمكين RLS (Row Level Security) - اختياري
-- ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE student_results ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة العامة
-- CREATE POLICY "Allow public read" ON exams FOR SELECT USING (true);
-- CREATE POLICY "Allow public read" ON questions FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert" ON student_results FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public read" ON student_results FOR SELECT USING (true);
