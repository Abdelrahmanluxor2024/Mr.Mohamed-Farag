import { BookOpen, Phone, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Slogan */}
          <div className="text-center md:text-right">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">أ / محمد فراج</h3>
                <p className="text-accent text-sm font-medium">مدرس التاريخ</p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              معاً نحوَ تفوقك - منصة تعليمية متكاملة لمادة التاريخ
              من الصف الثاني الإعدادي إلى الثالث الثانوي
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h4 className="text-lg font-bold mb-4 text-accent">روابط سريعة</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-white/70 hover:text-accent transition-colors text-sm">
                الرئيسية
              </Link>
              <Link to="/exams" className="block text-white/70 hover:text-accent transition-colors text-sm">
                الامتحانات
              </Link>
              <a
                href="https://wa.me/201017815143"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white/70 hover:text-accent transition-colors text-sm"
              >
                تواصل معنا
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-bold mb-4 text-accent">تواصل معنا</h4>
            <a
              href="https://wa.me/201017815143"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/70 hover:text-accent transition-colors text-sm"
            >
              <Phone className="w-4 h-4" />
              01017815143
            </a>
            <p className="text-white/50 text-xs mt-4">
              يبدأ الحجز من شهر 8 بإذن الله
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-8 pt-6 text-center">
          <p className="text-white/50 text-sm flex items-center justify-center gap-1">
            صنع بـ <Heart className="w-4 h-4 text-accent fill-accent" /> لأستاذ محمد فراج © {new Date().getFullYear()}
          </p>
          <p className="text-accent text-xs mt-1 font-medium">معاً نحوَ تفوقك</p>
        </div>
      </div>
    </footer>
  );
}
