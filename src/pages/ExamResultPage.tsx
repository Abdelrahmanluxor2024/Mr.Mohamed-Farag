import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, Home, Phone, ChevronDown, ChevronUp, Download, Star, BookOpen, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { StudentResult } from '../lib/supabase';
import { generateResultPDF } from '../utils/pdfGenerator';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ExamResultPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<StudentResult | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem('examResult');
    if (!data) {
      navigate('/');
      return;
    }
    setResult(JSON.parse(data));
  }, [navigate]);

  if (!result) return null;

  const percentage = result.score_percentage;
  const pieData = [
    { name: 'صحيح', value: result.correct_answers, color: '#22c55e' },
    { name: 'خطأ', value: result.wrong_answers, color: '#ef4444' },
  ];

  const getMotivationalMessage = () => {
    if (percentage >= 90) return { emoji: '🏆', text: 'ممتاز جداً! أنت متفوق', color: 'text-green-600' };
    if (percentage >= 75) return { emoji: '🌟', text: 'أداء رائع! استمر', color: 'text-blue-600' };
    if (percentage >= 50) return { emoji: '👍', text: 'جيد، يمكنك التحسن أكثر', color: 'text-amber-600' };
    return { emoji: '💪', text: 'لا تيأس، حاول مرة أخرى', color: 'text-red-600' };
  };

  const message = getMotivationalMessage();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} دقيقة و ${secs} ثانية`;
  };

  const toggleQuestion = (qId: string) => {
    setExpandedQuestions(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleDownloadPDF = () => {
    generateResultPDF(result);
  };

  const getOptionLabel = (opt: string) => {
    const labels: Record<string, string> = { a: 'أ', b: 'ب', c: 'ج', d: 'د' };
    return labels[opt] || opt;
  };

  const handleDownloadResult = () => {
    // Create a simple text-based result
    let text = `نتيجة امتحان: ${result.exam_title}\n`;
    text += `الطالب: ${result.student_name}\n`;
    text += `التاريخ: ${new Date(result.created_at).toLocaleDateString('ar-EG')}\n`;
    text += `الدرجة: ${result.correct_answers}/${result.total_questions}\n`;
    text += `النسبة: ${percentage.toFixed(1)}%\n`;
    text += `الوقت: ${formatTime(result.time_taken_seconds)}\n\n`;
    text += `─────────────────────────────\n\n`;

    Object.values(result.answers).forEach((answer, i) => {
      text += `السؤال ${i + 1}: ${answer.question}\n`;
      text += `إجابتك: ${getOptionLabel(answer.student_answer)} - ${answer.options[answer.student_answer as keyof typeof answer.options] || 'لم تُجب'}\n`;
      text += `الإجابة الصحيحة: ${getOptionLabel(answer.correct_answer)} - ${answer.options[answer.correct_answer as keyof typeof answer.options]}\n`;
      text += `${answer.is_correct ? '✅ صحيح' : '❌ خطأ'}\n`;
      if (answer.explanation) text += `الشرح: ${answer.explanation}\n`;
      text += `\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `نتيجة_${result.student_name}_${result.exam_title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const answersArray = Object.entries(result.answers);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Result Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-scaleIn">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary to-primary-light p-6 text-white text-center">
            <div className="text-5xl mb-3">{message.emoji}</div>
            <h1 className="text-2xl font-black mb-2">{result.exam_title}</h1>
            <p className="text-white/70 text-sm">{result.student_name}</p>
            <p className="text-white/50 text-xs mt-1">
              {new Date(result.created_at).toLocaleDateString('ar-EG', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>

          {/* Score Section */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
              {/* Pie Chart */}
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center -mt-28">
                  <p className="text-3xl font-black text-primary">{percentage.toFixed(0)}%</p>
                  <p className="text-xs text-primary/50">النسبة</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1 w-full">
                <div className={`text-center mb-4 ${message.color}`}>
                  <p className="text-xl font-bold">{message.text}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{result.correct_answers}</p>
                    <p className="text-xs text-green-500">صحيح</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 text-center">
                    <XCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-600">{result.wrong_answers}</p>
                    <p className="text-xs text-red-500">خطأ</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <Clock className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-blue-600">{Math.floor(result.time_taken_seconds / 60)}</p>
                    <p className="text-xs text-blue-500">دقيقة</p>
                  </div>
                </div>

                {/* Score bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-primary/60">الدرجة</span>
                    <span className="font-bold text-primary">{result.correct_answers}/{result.total_questions}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 bg-gradient-to-l from-accent to-accent-light"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={handleDownloadPDF}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-accent-light hover:from-accent-dark hover:to-accent text-white py-3 rounded-xl font-medium text-sm transition-all duration-300 shadow-lg shadow-accent/20 hover:shadow-accent/40"
              >
                <FileText className="w-4 h-4" />
                تحميل PDF
              </button>
              <button
                onClick={handleDownloadResult}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white py-3 rounded-xl font-medium text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                تحميل نص
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-primary py-3 rounded-xl font-medium text-sm transition-colors"
              >
                <Home className="w-4 h-4" />
                الرئيسية
              </button>
              <a
                href="https://wa.me/201017815143"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                تواصل واتساب
              </a>
            </div>

            {/* Review Questions */}
            <div>
              <button
                onClick={() => setShowAllQuestions(!showAllQuestions)}
                className="w-full flex items-center justify-between bg-primary/5 hover:bg-primary/10 px-4 py-3 rounded-xl transition-colors"
              >
                <span className="font-bold text-primary flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent" />
                  مراجعة الأسئلة والإجابات
                </span>
                {showAllQuestions ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-primary" />}
              </button>

              {showAllQuestions && (
                <div className="mt-4 space-y-4 animate-fadeIn">
                  {answersArray.map(([qId, answer], index) => {
                    const isExpanded = expandedQuestions[qId];

                    return (
                      <div
                        key={qId}
                        className={`rounded-xl border-2 overflow-hidden ${
                          answer.is_correct ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'
                        }`}
                      >
                        <button
                          onClick={() => toggleQuestion(qId)}
                          className="w-full flex items-center gap-3 p-4 text-right"
                        >
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                            answer.is_correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="flex-1 text-sm font-medium text-primary truncate">
                            {answer.question}
                          </span>
                          {answer.is_correct ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 animate-fadeIn">
                            <p className="text-primary font-bold text-sm mb-3">{answer.question}</p>

                            <div className="space-y-2">
                              {(['a', 'b', 'c', 'd'] as const).map(opt => {
                                const optionText = answer.options[opt];
                                const isStudentAnswer = answer.student_answer === opt;
                                const isCorrectAnswer = answer.correct_answer === opt;

                                let classes = 'bg-white border-gray-200 text-primary/70';
                                if (isCorrectAnswer) classes = 'bg-green-100 border-green-400 text-green-800';
                                if (isStudentAnswer && !answer.is_correct) classes = 'bg-red-100 border-red-400 text-red-800';

                                return (
                                  <div
                                    key={opt}
                                    className={`flex items-center gap-3 p-3 rounded-lg border ${classes} text-sm`}
                                  >
                                    <span className="font-bold">{getOptionLabel(opt)}</span>
                                    <span className="flex-1">{optionText}</span>
                                    {isCorrectAnswer && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                    {isStudentAnswer && !answer.is_correct && <XCircle className="w-4 h-4 text-red-500" />}
                                  </div>
                                );
                              })}
                            </div>

                            {answer.explanation && (
                              <div className="mt-3 bg-blue-50 rounded-lg p-3 flex items-start gap-2">
                                <Star className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-blue-800">{answer.explanation}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <p className="text-primary/40 text-sm mb-2">منصة الأستاذ محمد فراج</p>
          <p className="text-accent font-bold">معاً نحوَ تفوقك</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
