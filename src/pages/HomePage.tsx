import { Link } from 'react-router-dom';
import { GraduationCap, ClipboardList, BookOpen, UserCheck, Phone, ChevronLeft, Star, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import teacherImage from '../assets/aaa.png';

const features = [
  {
    icon: GraduationCap,
    title: 'خبرة في التدريس',
    description: 'سنوات من الخبرة في تدريس مادة التاريخ بأساليب حديثة وفعّالة',
    color: 'bg-blue-500',
  },
  {
    icon: ClipboardList,
    title: 'متابعة دورية واختبارات',
    description: 'اختبارات دورية لقياس مستوى الطالب ومتابعة تقدمه المستمر',
    color: 'bg-green-500',
  },
  {
    icon: BookOpen,
    title: 'مراجعات أمام الامتحانات',
    description: 'مراجعات شاملة ومكثفة قبل الامتحانات لضمان أفضل النتائج',
    color: 'bg-purple-500',
  },
  {
    icon: UserCheck,
    title: 'شرح مبسط ومنظم',
    description: 'شرح واضح ومنظم يسهّل فهم واستيعاب المادة التاريخية',
    color: 'bg-accent',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-linear-to-br from-primary via-primary-dark to-primary">
          {/* Decorative elements */}
          <div className="absolute top-10 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl"></div>
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, white 2px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            {/* Bismillah */}
            <div className="animate-fadeIn mb-8">
              <p className="text-accent/90 text-xl md:text-2xl font-medium" style={{ fontFamily: "'Cairo', sans-serif" }}>
                ﷽
              </p>
            </div>

            {/* Main content */}
            <div className="animate-fadeIn delay-100" style={{ animationFillMode: 'both' }}>
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4 fill-accent" />
                <span>يُعلن</span>
              </div>
            </div>

            <h1 className="animate-fadeIn delay-200 text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4" style={{ animationFillMode: 'both' }}>
              أ / محمد فراج
            </h1>

            <div className="mx-auto mb-8 w-[220px] h-[220px] rounded-[2.5rem] overflow-hidden border-4 border-white/20 shadow-2xl shadow-black/30 ring-1 ring-white/10 animate-fadeIn delay-250" style={{ animationFillMode: 'both' }}>
              <img src={teacherImage} alt="أ / محمد فراج" className="object-cover w-full h-full" />
            </div>

            <div className="animate-fadeIn delay-300 mb-6" style={{ animationFillMode: 'both' }}>
              <span className="inline-block bg-accent text-white px-6 py-2 rounded-full text-lg md:text-xl font-bold">
                مدرس مادة التاريخ
              </span>
            </div>

            <p className="animate-fadeIn delay-400 text-white/80 text-base md:text-lg max-w-2xl mx-auto mb-8" style={{ animationFillMode: 'both' }}>
              من الصف الثاني الإعدادي إلى الصف الثالث الثانوي (عام وبكلوريا)
            </p>

            {/* Subject Card */}
            <div className="animate-scaleIn delay-400 mb-8" style={{ animationFillMode: 'both' }}>
              <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-4">
                <p className="text-accent font-bold text-lg mb-1">📚 سيتم تدريس مادة التاريخ</p>
                <p className="text-white/70 text-sm">يبدأ الحجز من شهر 8 بإذن الله</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="animate-fadeIn delay-500 flex flex-col sm:flex-row gap-4 justify-center" style={{ animationFillMode: 'both' }}>
              <Link
                to="/exams"
                className="group inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-105 shadow-lg shadow-accent/30"
              >
                <ClipboardList className="w-5 h-5" />
                ابدأ الامتحان
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://wa.me/201017815143"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/30"
              >
                <Phone className="w-5 h-5" />
                تواصل واتساب
              </a>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8f9fc"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">
              لماذا تختار الأستاذ محمد فراج؟
            </h2>
            <p className="text-primary/60 text-lg max-w-2xl mx-auto">
              نقدم لك تجربة تعليمية متميزة تضمن تفوقك في مادة التاريخ
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 group"
              >
                <div className={`${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">{feature.title}</h3>
                <p className="text-primary/60 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grades Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">
              المراحل الدراسية
            </h2>
            <p className="text-primary/60 text-lg">
              نغطي كافة المراحل من الإعدادي إلى الثانوي
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              'الصف الثاني الإعدادي',
              'الصف الثالث الإعدادي',
              'الصف الأول الثانوي',
              'الصف الثاني الثانوي',
              'الصف الثالث الثانوي',
            ].map((grade, i) => (
              <div
                key={i}
                className="bg-linear-to-br from-primary to-primary-light text-white rounded-xl p-4 text-center hover:shadow-lg transition-all hover:scale-105"
              >
                <div className="text-3xl mb-2">🎓</div>
                <p className="font-bold text-sm">{grade}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-linear-to-br from-primary via-primary-dark to-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, white 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            معاً نحوَ <span className="text-accent">تفوقك</span>
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            انضم إلينا الآن وابدأ رحلة التفوق في مادة التاريخ مع الأستاذ محمد فراج
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/exams"
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 hover:scale-105"
            >
              ابدأ الامتحان الآن
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <a
              href="https://wa.me/201017815143"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-xl text-lg font-bold transition-all"
            >
              <Phone className="w-5 h-5" />
              01017815143
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
