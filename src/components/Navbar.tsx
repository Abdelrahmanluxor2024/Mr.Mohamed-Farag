import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen, Phone } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-primary shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h1 className="text-lg font-bold leading-tight">أ / محمد فراج</h1>
              <p className="text-xs text-accent font-medium -mt-1">مدرس التاريخ</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-accent' : 'text-white/80 hover:text-accent'
              }`}
            >
              الرئيسية
            </Link>
            <Link
              to="/exams"
              className={`text-sm font-medium transition-colors ${
                isActive('/exams') ? 'text-accent' : 'text-white/80 hover:text-accent'
              }`}
            >
              الامتحانات
            </Link>
            <Link
              to="/admin"
              className={`text-sm font-medium transition-colors ${
                isActive('/admin') ? 'text-accent' : 'text-white/80 hover:text-accent'
              }`}
            >
              لوحة التحكم
            </Link>
            <a
              href="https://wa.me/201017815143"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Phone className="w-4 h-4" />
              تواصل معنا
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-primary-dark border-t border-white/10 animate-fadeIn">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`block py-2 px-3 rounded-lg text-sm font-medium ${
                isActive('/') ? 'bg-accent text-white' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              الرئيسية
            </Link>
            <Link
              to="/exams"
              onClick={() => setIsOpen(false)}
              className={`block py-2 px-3 rounded-lg text-sm font-medium ${
                isActive('/exams') ? 'bg-accent text-white' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              الامتحانات
            </Link>
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className={`block py-2 px-3 rounded-lg text-sm font-medium ${
                isActive('/admin') ? 'bg-accent text-white' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              لوحة التحكم
            </Link>
            <a
              href="https://wa.me/201017815143"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium w-full justify-center"
            >
              <Phone className="w-4 h-4" />
              تواصل واتساب
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
