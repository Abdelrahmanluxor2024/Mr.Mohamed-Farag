import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, ChevronLeft, Send, AlertTriangle, Loader2, X } from 'lucide-react';
import { supabase, type Exam, type Question } from '../lib/supabase';

export default function ExamStartPage() {
  const { examCode } = useParams<{ examCode: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const submittedRef = useRef(false);

  useEffect(() => {
    const name = sessionStorage.getItem('studentName');
    const phone = sessionStorage.getItem('studentPhone');
    const examData = sessionStorage.getItem('examData');

    if (!name || !examData) {
      navigate(`/exams/${examCode}`);
      return;
    }

    setStudentName(name);
    setStudentPhone(phone || '');

    const parsedExam = JSON.parse(examData) as Exam;
    setExam(parsedExam);
    setTimeLeft(parsedExam.duration_minutes * 60);
    startTimeRef.current = Date.now();

    fetchQuestions(parsedExam.id);

    // Load saved answers
    const saved = localStorage.getItem(`exam_answers_${examCode}`);
    if (saved) {
      setAnswers(JSON.parse(saved));
    }

    // Warn before leaving
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examCode, navigate]);

  useEffect(() => {
    if (timeLeft <= 0 && exam && !loading) {
      if (!submittedRef.current) {
        submitExam();
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, loading, timeLeft]);

  const fetchQuestions = async (examId: string) => {
    try {
      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', examId)
        .order('question_order', { ascending: true });

      if (data && data.length > 0) {
        setQuestions(data);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    localStorage.setItem(`exam_answers_${examCode}`, JSON.stringify(newAnswers));
  };

  const submitExam = async () => {
    if (submittedRef.current || !exam) return;
    submittedRef.current = true;
    setSubmitting(true);
    setShowConfirm(false);

    if (timerRef.current) clearInterval(timerRef.current);

    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

    try {
      // Calculate results client-side
      let correct = 0;
      const detailedAnswers: Record<string, {
        question: string;
        student_answer: string;
        correct_answer: string;
        is_correct: boolean;
        options: { a: string; b: string; c: string; d: string };
        explanation: string;
      }> = {};

      questions.forEach(q => {
        const studentAnswer = answers[q.id] || '';
        const isCorrect = studentAnswer === q.correct_answer;
        if (isCorrect) correct++;

        detailedAnswers[q.id] = {
          question: q.question_text,
          student_answer: studentAnswer,
          correct_answer: q.correct_answer,
          is_correct: isCorrect,
          options: { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d },
          explanation: q.explanation || '',
        };
      });

      const total = questions.length;
      const wrong = total - correct;
      const percentage = total > 0 ? (correct / total) * 100 : 0;

      const { data, error } = await supabase
        .from('student_results')
        .insert({
          student_name: studentName,
          student_phone: studentPhone,
          exam_id: exam.id,
          exam_code: examCode,
          exam_title: exam.title,
          total_questions: total,
          correct_answers: correct,
          wrong_answers: wrong,
          score_percentage: percentage,
          answers: detailedAnswers,
          time_taken_seconds: timeTaken,
        })
        .select()
        .single();

      if (error) throw error;

      // Clear saved data
      localStorage.removeItem(`exam_answers_${examCode}`);
      sessionStorage.setItem('examResult', JSON.stringify(data));

      navigate(`/exams/${examCode}/result`);
    } catch (err) {
      console.error('Submit error:', err);
      submittedRef.current = false;
      setSubmitting(false);
      alert('حدث خطأ أثناء تسليم الامتحان. حاول مرة أخرى.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-accent animate-spin mx-auto mb-4" />
          <p className="text-primary/60">جاري تحميل الامتحان...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <AlertTriangle className="w-16 h-16 text-accent mx-auto mb-4" />
          <h2 className="text-xl font-bold text-primary mb-2">لا توجد أسئلة</h2>
          <p className="text-primary/60 mb-4">هذا الامتحان لا يحتوي على أسئلة بعد</p>
          <button
            onClick={() => navigate('/')}
            className="bg-accent text-white px-6 py-2 rounded-lg font-medium"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isTimeLow = timeLeft < 60;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-sm font-bold text-primary truncate">{exam?.title}</h1>
              <p className="text-xs text-primary/50">{studentName}</p>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg ${
              isTimeLow ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-primary/5 text-primary'
            }`}>
              <Clock className="w-5 h-5" />
              <span dir="ltr">{formatTime(timeLeft)}</span>
            </div>

            <div className="flex-1 text-left">
              <span className="text-sm font-medium text-primary/60">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-linear-to-l from-accent to-accent-light"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Question Area */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Question Header */}
              <div className="bg-linear-to-l from-primary to-primary-light p-4 text-white">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  السؤال {currentIndex + 1}
                </span>
              </div>

              {/* Question Text */}
              <div className="p-6">
                <p className="text-lg font-bold text-primary leading-relaxed mb-6">
                  {currentQuestion.question_text}
                </p>

                {/* Options */}
                <div className="space-y-3">
                  {(['a', 'b', 'c', 'd'] as const).map((opt) => {
                    const optionText = currentQuestion[`option_${opt}`];
                    const isSelected = answers[currentQuestion.id] === opt;
                    const labels = { a: 'أ', b: 'ب', c: 'ج', d: 'د' };

                    return (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(currentQuestion.id, opt)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-right ${
                          isSelected
                            ? 'border-accent bg-accent/5 shadow-md'
                            : 'border-gray-200 hover:border-accent/50 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                          isSelected
                            ? 'bg-accent text-white'
                            : 'bg-gray-100 text-primary/60'
                        }`}>
                          {labels[opt]}
                        </span>
                        <span className={`text-sm font-medium flex-1 ${
                          isSelected ? 'text-primary' : 'text-primary/70'
                        }`}>
                          {optionText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg text-primary/60 hover:bg-white hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  <ChevronRight className="w-4 h-4" />
                  السابق
                </button>

                {currentIndex === questions.length - 1 ? (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="flex items-center gap-2 px-6 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-accent/20"
                  >
                    <Send className="w-4 h-4" />
                    تسليم الامتحان
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-light transition-colors text-sm font-medium"
                  >
                    التالي
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Question Navigator */}
          <div className="lg:w-64">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-24">
              <h3 className="text-sm font-bold text-primary mb-3">الأسئلة</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, i) => {
                  const isAnswered = !!answers[q.id];
                  const isCurrent = i === currentIndex;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(i)}
                      className={`w-full aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                        isCurrent
                          ? 'bg-primary text-white scale-110 shadow-md'
                          : isAnswered
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-primary/50 hover:bg-gray-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 space-y-2 text-xs text-primary/60">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-green-500"></span>
                  <span>تمت الإجابة ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-gray-100"></span>
                  <span>لم يُجَب ({questions.length - answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-primary"></span>
                  <span>السؤال الحالي</span>
                </div>
              </div>

              <button
                onClick={() => setShowConfirm(true)}
                className="w-full mt-4 bg-accent hover:bg-accent-dark text-white py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                تسليم الامتحان
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-primary">تأكيد التسليم</h3>
              <button onClick={() => setShowConfirm(false)} className="text-primary/40 hover:text-primary">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">هل أنت متأكد من تسليم الامتحان؟</p>
                  <p className="text-sm text-amber-600 mt-1">
                    أجبت على {answeredCount} من أصل {questions.length} سؤال
                  </p>
                  {answeredCount < questions.length && (
                    <p className="text-sm text-red-500 mt-1 font-medium">
                      ⚠️ يوجد {questions.length - answeredCount} سؤال بدون إجابة
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-primary py-3 rounded-xl font-medium transition-colors"
              >
                رجوع
              </button>
              <button
                onClick={submitExam}
                disabled={submitting}
                className="flex-1 bg-accent hover:bg-accent-dark text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    تسليم
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submitting Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-primary/90 flex items-center justify-center z-50">
          <div className="text-center text-white">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-accent" />
            <h2 className="text-2xl font-bold mb-2">جاري تسليم الامتحان...</h2>
            <p className="text-white/60">الرجاء الانتظار</p>
          </div>
        </div>
      )}
    </div>
  );
}
