import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, HelpCircle, User, Phone, AlertTriangle, ArrowLeft, Loader2, BookOpen, CheckCircle2 } from 'lucide-react';
import { supabase, type Exam } from '../lib/supabase';
import Navbar from '../components/Navbar';

export default function ExamInfoPage() {
  const { examCode } = useParams<{ examCode: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    fetchExam();
  }, [examCode]);

  const fetchExam = async () => {
    if (!examCode) return;
    try {
      const { data } = await supabase
        .from('exams')
        .select('*')
        .eq('exam_code', examCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (data) {
        setExam(data);
      } else {
        navigate('/exams');
      }
    } catch {
      navigate('/exams');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    setNameError('');
    setPhoneError('');

    // Validate name - must be exactly 4 words
    if (!studentName.trim()) {
      setNameError('الرجاء إدخال الاسم الرباعي');
      return;
    }

    const nameWords = studentName.trim().split(/\s+/).filter(word => word.length > 0);
    if (nameWords.length !== 4) {
      setNameError('الاسم يجب أن يكون رباعياً (4 كلمات بالضبط)');
      return;
    }

    // Validate phone - must be provided, 11 digits, and start with valid prefix
    if (!studentPhone.trim()) {
      setPhoneError('رقم الهاتف مطلوب');
      return;
    }

    const phoneDigits = studentPhone.trim().replace(/\D/g, '');
    if (phoneDigits.length !== 11) {
      setPhoneError('رقم الهاتف يجب أن يكون 11 رقم بالضبط');
      return;
    }

    const validPrefixes = ['010', '011', '012', '015'];
    const phonePrefix = phoneDigits.substring(0, 3);
    if (!validPrefixes.includes(phonePrefix)) {
      setPhoneError('رقم الهاتف يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015');
      return;
    }

    // Save to sessionStorage
    sessionStorage.setItem('studentName', studentName.trim());
    sessionStorage.setItem('studentPhone', studentPhone.trim());
    sessionStorage.setItem('examData', JSON.stringify(exam));

    navigate(`/exams/${examCode}/start`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  if (!exam) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        {/* Exam Info Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-fadeIn">
          {/* Header */}
          <div className="bg-linear-to-br from-primary to-primary-light p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-black mb-2">{exam.title}</h1>
            <p className="text-white/70 text-sm">{exam.description}</p>
            <div className="inline-block bg-accent/20 text-accent px-4 py-1 rounded-full text-sm font-medium mt-3">
              {exam.grade_level}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 border-b border-gray-100">
            <div className="p-4 text-center border-l border-gray-100">
              <Clock className="w-6 h-6 text-accent mx-auto mb-1" />
              <p className="text-xl font-bold text-primary">{exam.duration_minutes}</p>
              <p className="text-xs text-primary/50">دقيقة</p>
            </div>
            <div className="p-4 text-center border-l border-gray-100">
              <HelpCircle className="w-6 h-6 text-accent mx-auto mb-1" />
              <p className="text-xl font-bold text-primary">{exam.total_questions}</p>
              <p className="text-xs text-primary/50">سؤال</p>
            </div>
            <div className="p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-accent mx-auto mb-1" />
              <p className="text-xl font-bold text-primary">اختيارات</p>
              <p className="text-xs text-primary/50">متعددة</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-primary mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-accent" />
              تعليمات مهمة
            </h3>
            <ul className="space-y-2 text-sm text-primary/70">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">●</span>
                <span>اقرأ كل سؤال جيداً قبل اختيار الإجابة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">●</span>
                <span>لديك {exam.duration_minutes} دقيقة لإكمال الامتحان</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">●</span>
                <span>يمكنك التنقل بين الأسئلة بحرية</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">●</span>
                <span>سيتم التسليم تلقائياً عند انتهاء الوقت</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-1">●</span>
                <span>لا تغلق المتصفح أثناء الامتحان</span>
              </li>
            </ul>
          </div>

          {/* Student Form */}
          <div className="p-6">
            <h3 className="font-bold text-primary mb-4">بيانات الطالب</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary/70 mb-1">
                  <User className="w-4 h-4 inline ml-1" />
                  الاسم الرباعي <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    setNameError('');
                  }}
                  placeholder="أدخل اسمك الرباعي"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-accent focus:outline-none text-primary transition-colors"
                />
                {nameError && (
                  <p className="text-red-500 text-xs mt-1">{nameError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-primary/70 mb-1">
                  <Phone className="w-4 h-4 inline ml-1" />
                  رقم الهاتف <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={studentPhone}
                  onChange={(e) => {
                    setStudentPhone(e.target.value);
                    setPhoneError('');
                  }}
                  placeholder="01XXXXXXXXX"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none text-primary ${
                    phoneError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-accent'
                  }`}
                  dir="ltr"
                />
                {phoneError && (
                  <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                )}
              </div>

              <button
                onClick={handleStart}
                className="w-full bg-accent hover:bg-accent-dark text-white py-4 rounded-xl text-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:scale-[1.02]"
              >
                بدء الامتحان
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
