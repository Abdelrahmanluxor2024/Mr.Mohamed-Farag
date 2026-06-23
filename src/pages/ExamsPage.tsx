import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Search, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ExamsPage() {
  const [examCode, setExamCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const code = examCode.trim().toUpperCase();
    if (!code) {
      setError('الرجاء إدخال كود الامتحان');
      return;
    }

    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from('exams')
        .select('*')
        .eq('exam_code', code)
        .eq('is_active', true)
        .single();

      if (dbError || !data) {
        setError('كود الامتحان غير صحيح أو غير مفعّل. تأكد من الكود وحاول مرة أخرى.');
        return;
      }

      navigate(`/exams/${code}`);
    } catch {
      setError('حدث خطأ في الاتصال. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-scaleIn">
            {/* Icon */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-black text-primary mb-2">أدخل كود الامتحان</h1>
              <p className="text-primary/60 text-sm">
                احصل على الكود من الأستاذ محمد فراج
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                <input
                  type="text"
                  value={examCode}
                  onChange={(e) => {
                    setExamCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder="مثال: HIST-2PREP-001"
                  className="w-full pr-12 pl-4 py-4 rounded-xl border-2 border-gray-200 focus:border-accent focus:outline-none text-center text-lg font-bold tracking-wider text-primary placeholder:text-primary/30 placeholder:text-sm placeholder:font-normal transition-colors"
                  dir="ltr"
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm animate-fadeIn">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !examCode.trim()}
                className="w-full bg-accent hover:bg-accent-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl text-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-accent/20 hover:shadow-accent/40"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    متابعة
                    <ArrowLeft className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Help */}
            <div className="mt-6 text-center">
              <p className="text-primary/40 text-xs mb-2">ليس لديك كود؟</p>
              <a
                href="https://wa.me/201017815143"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-dark font-medium text-sm transition-colors"
              >
                تواصل مع الأستاذ محمد فراج
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
