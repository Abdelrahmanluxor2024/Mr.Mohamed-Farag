import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Award, Activity, Search, Download, Copy, Check, LogOut, Eye, X, ToggleLeft, ToggleRight, Loader2, ChevronDown, RefreshCw, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { supabase, type Exam, type StudentResult } from '../lib/supabase';
import Navbar from '../components/Navbar';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState<StudentResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'results' | 'exams' | 'charts'>('results');
  const [filterExam, setFilterExam] = useState('');
  const [searchName, setSearchName] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const [selectedResult, setSelectedResult] = useState<StudentResult | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth');
    if (auth !== 'true') {
      navigate('/admin');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [resultsRes, examsRes] = await Promise.all([
        supabase.from('student_results').select('*').order('created_at', { ascending: false }),
        supabase.from('exams').select('*').order('created_at', { ascending: false }),
      ]);

      if (resultsRes.data) setResults(resultsRes.data);
      if (examsRes.data) setExams(examsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const toggleExamStatus = async (exam: Exam) => {
    try {
      await supabase
        .from('exams')
        .update({ is_active: !exam.is_active })
        .eq('id', exam.id);

      setExams(prev => prev.map(e => e.id === exam.id ? { ...e, is_active: !e.is_active } : e));
    } catch (err) {
      console.error('Error toggling exam:', err);
    }
  };

  const exportCSV = () => {
    const filtered = getFilteredResults();
    if (filtered.length === 0) return;

    const headers = ['الاسم', 'الهاتف', 'الامتحان', 'الدرجة', 'النسبة', 'التاريخ'];
    const rows = filtered.map(r => [
      r.student_name,
      r.student_phone || '-',
      r.exam_title,
      `${r.correct_answers}/${r.total_questions}`,
      `${r.score_percentage.toFixed(1)}%`,
      new Date(r.created_at).toLocaleDateString('ar-EG'),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `نتائج_الطلاب_${new Date().toLocaleDateString('ar-EG')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFilteredResults = () => {
    return results.filter(r => {
      if (filterExam && r.exam_code !== filterExam) return false;
      if (searchName && !r.student_name.includes(searchName)) return false;
      return true;
    });
  };

  // Stats calculations
  const totalStudents = results.length;
  const uniqueExamsTaken = new Set(results.map(r => r.exam_code)).size;
  const averageScore = results.length > 0
    ? results.reduce((acc, r) => acc + r.score_percentage, 0) / results.length
    : 0;
  const activeExamsCount = exams.filter(e => e.is_active).length;

  // Chart data
  const examAverages = exams.map(exam => {
    const examResults = results.filter(r => r.exam_id === exam.id);
    const avg = examResults.length > 0
      ? examResults.reduce((acc, r) => acc + r.score_percentage, 0) / examResults.length
      : 0;
    return {
      name: exam.title.replace('امتحان التاريخ - ', ''),
      average: Math.round(avg),
      count: examResults.length,
    };
  }).filter(e => e.count > 0);

  // Daily students data
  const dailyData: Record<string, number> = {};
  results.forEach(r => {
    const day = new Date(r.created_at).toLocaleDateString('ar-EG');
    dailyData[day] = (dailyData[day] || 0) + 1;
  });
  const dailyChartData = Object.entries(dailyData).map(([date, count]) => ({
    date,
    count,
  })).reverse().slice(0, 14);

  const filteredResults = getFilteredResults();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-primary">لوحة التحكم</h1>
            <p className="text-primary/50 text-sm">إدارة الامتحانات والنتائج</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-primary px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              تحديث
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              خروج
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-primary">{totalStudents}</p>
                <p className="text-xs text-primary/50">إجمالي الطلاب</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-primary">{uniqueExamsTaken}</p>
                <p className="text-xs text-primary/50">امتحانات مؤداة</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-primary">{averageScore.toFixed(1)}%</p>
                <p className="text-xs text-primary/50">متوسط الدرجات</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-primary">{activeExamsCount}</p>
                <p className="text-xs text-primary/50">امتحانات نشطة</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'results' as const, label: 'النتائج', icon: FileText },
            { id: 'exams' as const, label: 'الامتحانات', icon: Activity },
            { id: 'charts' as const, label: 'الرسوم البيانية', icon: BarChart3 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-white text-primary/60 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="بحث بالاسم..."
                  className="w-full pr-10 pl-4 py-2 rounded-lg border border-gray-200 focus:border-accent focus:outline-none text-sm"
                />
              </div>
              <div className="relative">
                <select
                  value={filterExam}
                  onChange={(e) => setFilterExam(e.target.value)}
                  className="appearance-none w-full sm:w-48 pr-4 pl-8 py-2 rounded-lg border border-gray-200 focus:border-accent focus:outline-none text-sm bg-white"
                >
                  <option value="">كل الامتحانات</option>
                  {exams.map(e => (
                    <option key={e.id} value={e.exam_code}>{e.title.replace('امتحان التاريخ - ', '')}</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 pointer-events-none" />
              </div>
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                تصدير CSV
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-primary/60">
                    <th className="px-4 py-3 text-right font-medium">#</th>
                    <th className="px-4 py-3 text-right font-medium">الاسم</th>
                    <th className="px-4 py-3 text-right font-medium hidden sm:table-cell">الهاتف</th>
                    <th className="px-4 py-3 text-right font-medium">الامتحان</th>
                    <th className="px-4 py-3 text-right font-medium">الدرجة</th>
                    <th className="px-4 py-3 text-right font-medium hidden md:table-cell">النسبة</th>
                    <th className="px-4 py-3 text-right font-medium hidden lg:table-cell">التاريخ</th>
                    <th className="px-4 py-3 text-right font-medium">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-primary/40">
                        لا توجد نتائج
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((r, i) => (
                      <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-primary/40">{i + 1}</td>
                        <td className="px-4 py-3 font-medium text-primary">{r.student_name}</td>
                        <td className="px-4 py-3 text-primary/60 hidden sm:table-cell" dir="ltr">{r.student_phone || '-'}</td>
                        <td className="px-4 py-3 text-primary/60 text-xs">{r.exam_title?.replace('امتحان التاريخ - ', '') || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-primary">{r.correct_answers}/{r.total_questions}</span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            r.score_percentage >= 75 ? 'bg-green-100 text-green-700' :
                            r.score_percentage >= 50 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {r.score_percentage.toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-primary/50 text-xs hidden lg:table-cell">
                          {new Date(r.created_at).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedResult(r)}
                            className="text-accent hover:text-accent-dark"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-100 text-sm text-primary/50">
              عرض {filteredResults.length} من {results.length} نتيجة
            </div>
          </div>
        )}

        {/* Exams Tab */}
        {activeTab === 'exams' && (
          <div className="grid gap-4">
            {exams.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <p className="text-primary/40">لا توجد امتحانات</p>
              </div>
            ) : (
              exams.map(exam => (
                <div key={exam.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-primary">{exam.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          exam.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {exam.is_active ? 'مفعّل' : 'معطّل'}
                        </span>
                      </div>
                      <p className="text-sm text-primary/50 mb-2">{exam.grade_level} • {exam.duration_minutes} دقيقة • {exam.total_questions} سؤال</p>

                      {/* Code */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-primary/40">الكود:</span>
                        <code className="bg-primary/5 px-3 py-1 rounded-lg text-sm font-bold text-accent" dir="ltr">
                          {exam.exam_code}
                        </code>
                        <button
                          onClick={() => copyCode(exam.exam_code)}
                          className="text-primary/40 hover:text-accent transition-colors"
                        >
                          {copiedCode === exam.exam_code ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExamStatus(exam)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        exam.is_active
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {exam.is_active ? (
                        <>
                          <ToggleRight className="w-5 h-5" />
                          تعطيل
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5" />
                          تفعيل
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <div className="grid gap-6">
            {/* Average Scores by Exam */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-primary mb-4">متوسط الدرجات لكل امتحان</h3>
              {examAverages.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={examAverages} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" domain={[0, 100]} stroke="#1a2754" fontSize={12} />
                      <YAxis type="category" dataKey="name" width={120} stroke="#1a2754" fontSize={11} />
                      <Tooltip
                        formatter={(value) => [`${value}%`, 'المتوسط']}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', direction: 'rtl' }}
                      />
                      <Bar dataKey="average" fill="#ff7a30" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-primary/40 py-12">لا توجد بيانات</p>
              )}
            </div>

            {/* Daily Students */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-primary mb-4">عدد الطلاب يومياً</h3>
              {dailyChartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#1a2754" fontSize={11} />
                      <YAxis stroke="#1a2754" fontSize={12} />
                      <Tooltip
                        formatter={(value) => [value, 'عدد الطلاب']}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', direction: 'rtl' }}
                      />
                      <Line type="monotone" dataKey="count" stroke="#1a2754" strokeWidth={3} dot={{ fill: '#ff7a30', r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-primary/40 py-12">لا توجد بيانات</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Result Detail Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg font-bold text-primary">تفاصيل النتيجة</h3>
              <button onClick={() => setSelectedResult(null)} className="text-primary/40 hover:text-primary">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-primary/50">الطالب</p>
                  <p className="font-bold text-primary">{selectedResult.student_name}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-primary/50">الهاتف</p>
                  <p className="font-bold text-primary" dir="ltr">{selectedResult.student_phone || '-'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-primary/50">الامتحان</p>
                  <p className="font-bold text-primary text-xs">{selectedResult.exam_title}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-primary/50">الدرجة</p>
                  <p className="font-bold text-accent">{selectedResult.correct_answers}/{selectedResult.total_questions} ({selectedResult.score_percentage.toFixed(0)}%)</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-primary/50">الوقت المستغرق</p>
                  <p className="font-bold text-primary">{Math.floor(selectedResult.time_taken_seconds / 60)} دقيقة</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-primary/50">التاريخ</p>
                  <p className="font-bold text-primary text-xs">{new Date(selectedResult.created_at).toLocaleDateString('ar-EG')}</p>
                </div>
              </div>

              {/* Detailed answers */}
              <h4 className="font-bold text-primary text-sm">الإجابات:</h4>
              <div className="space-y-2">
                {Object.values(selectedResult.answers || {}).map((answer, i) => (
                  <div key={i} className={`p-3 rounded-xl border text-sm ${
                    answer.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <p className="font-medium text-primary mb-1">س{i + 1}: {answer.question}</p>
                    <p className={answer.is_correct ? 'text-green-600' : 'text-red-600'}>
                      إجابة الطالب: {answer.options?.[answer.student_answer as keyof typeof answer.options] || 'لم يُجب'}
                    </p>
                    {!answer.is_correct && (
                      <p className="text-green-600">
                        الإجابة الصحيحة: {answer.options?.[answer.correct_answer as keyof typeof answer.options]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
