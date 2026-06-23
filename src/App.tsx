import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ExamsPage from './pages/ExamsPage';
import ExamInfoPage from './pages/ExamInfoPage';
import ExamStartPage from './pages/ExamStartPage';
import ExamResultPage from './pages/ExamResultPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/exams" element={<ExamsPage />} />
      <Route path="/exams/:examCode" element={<ExamInfoPage />} />
      <Route path="/exams/:examCode/start" element={<ExamStartPage />} />
      <Route path="/exams/:examCode/result" element={<ExamResultPage />} />
      <Route path="/admin" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
    </Routes>
  );
}
