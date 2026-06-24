/**
 * دوال لتوليد ملفات PDF للنتائج
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ExamResult {
  student_name: string;
  student_phone: string;
  exam_title: string;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  score_percentage: number;
  answers: Record<
    string,
    {
      question: string;
      student_answer: string;
      correct_answer: string;
      is_correct: boolean;
      options: { a: string; b: string; c: string; d: string };
      explanation: string;
    }
  >;
  time_taken_seconds: number;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} دقيقة و ${secs} ثانية`;
};

const getGrade = (percentage: number): string => {
  if (percentage >= 90) return 'ممتاز';
  if (percentage >= 80) return 'جيد جداً';
  if (percentage >= 70) return 'جيد';
  if (percentage >= 60) return 'مقبول';
  return 'ضعيف';
};

export const generateResultPDF = (result: ExamResult): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.getPageWidth();
  const pageHeight = doc.getPageHeight();
  let currentY = 20;

  // إعدادات الخط
  const primaryColor = [41, 98, 255]; // الأزرق
  const accentColor = [255, 107, 53]; // البرتقالي
  const correctColor = [34, 197, 94]; // الأخضر
  const wrongColor = [239, 68, 68]; // الأحمر

  // العنوان الرئيسي
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.text('نتائج الامتحان', pageWidth / 2, currentY, { align: 'center' });
  currentY += 15;

  // معلومات الطالب
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`الاسم: ${result.student_name}`, pageWidth - 20, currentY, { align: 'right' });
  currentY += 8;
  doc.text(`رقم الهاتف: ${result.student_phone || 'لم يتم إدخاله'}`, pageWidth - 20, currentY, { align: 'right' });
  currentY += 8;
  doc.text(`الامتحان: ${result.exam_title}`, pageWidth - 20, currentY, { align: 'right' });
  currentY += 12;

  // خط فاصل
  doc.setDrawColor(...primaryColor);
  doc.line(20, currentY, pageWidth - 20, currentY);
  currentY += 10;

  // ملخص النتائج
  doc.setFontSize(14);
  doc.setTextColor(...accentColor);
  doc.text('ملخص النتائج', pageWidth - 20, currentY, { align: 'right' });
  currentY += 10;

  // جدول الملخص
  const summaryData = [
    [
      'إجمالي الأسئلة',
      'الإجابات الصحيحة',
      'الإجابات الخاطئة',
      'النسبة المئوية',
      'التقدير',
    ],
    [
      result.total_questions.toString(),
      `${result.correct_answers} ✓`,
      `${result.wrong_answers} ✗`,
      `${result.score_percentage}%`,
      getGrade(result.score_percentage),
    ],
  ];

  (doc as any).autoTable({
    head: [summaryData[0]],
    body: [summaryData[1]],
    startY: currentY,
    margin: { left: 20, right: 20 },
    theme: 'grid',
    headerStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 11,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 11,
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [240, 248, 255],
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // المعلومات الإضافية
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`الوقت المستغرق: ${formatTime(result.time_taken_seconds)}`, pageWidth - 20, currentY, { align: 'right' });
  currentY += 8;
  doc.text(`تاريخ الامتحان: ${new Date().toLocaleDateString('ar-EG')}`, pageWidth - 20, currentY, { align: 'right' });
  currentY += 12;

  // خط فاصل
  doc.setDrawColor(...primaryColor);
  doc.line(20, currentY, pageWidth - 20, currentY);
  currentY += 10;

  // تفاصيل الإجابات
  doc.setFontSize(14);
  doc.setTextColor(...accentColor);
  doc.text('تفاصيل الإجابات', pageWidth - 20, currentY, { align: 'right' });
  currentY += 10;

  // عرض كل سؤال
  Object.values(result.answers).forEach((answer, index) => {
    // التحقق من وجود مساحة كافية
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = 20;
    }

    const questionNum = index + 1;
    const statusColor = answer.is_correct ? correctColor : wrongColor;
    const statusText = answer.is_correct ? '✓ صحيح' : '✗ خاطئ';

    // رقم السؤال والحالة
    doc.setFontSize(11);
    doc.setTextColor(...statusColor);
    doc.text(`${statusText}`, 20, currentY);
    doc.setTextColor(0, 0, 0);
    doc.text(`السؤال ${questionNum}:`, 40, currentY);
    currentY += 7;

    // نص السؤال
    doc.setFontSize(10);
    const splitQuestion = doc.splitTextToSize(answer.question, pageWidth - 60);
    doc.text(splitQuestion, pageWidth - 20, currentY, { align: 'right' });
    currentY += splitQuestion.length * 5 + 3;

    // الخيارات
    const optionLabels = ['أ', 'ب', 'ج', 'د'];
    Object.entries(answer.options).forEach(([key, value], optIndex) => {
      const isStudentAnswer = key === answer.student_answer;
      const isCorrectAnswer = key === answer.correct_answer;

      let optionColor = [0, 0, 0];
      let prefix = '';

      if (isCorrectAnswer && isStudentAnswer) {
        optionColor = correctColor;
        prefix = '✓ ';
      } else if (isCorrectAnswer) {
        optionColor = correctColor;
        prefix = '✓ الإجابة الصحيحة: ';
      } else if (isStudentAnswer) {
        optionColor = wrongColor;
        prefix = '✗ إجابتك: ';
      }

      doc.setTextColor(...optionColor);
      const optionText = `${optionLabels[optIndex]}) ${value}`;
      const splitOption = doc.splitTextToSize(prefix + optionText, pageWidth - 80);
      doc.setFontSize(9);
      doc.text(splitOption, pageWidth - 30, currentY, { align: 'right' });
      currentY += splitOption.length * 4 + 2;
    });

    // الشرح
    if (answer.explanation) {
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.text('الشرح:', pageWidth - 20, currentY, { align: 'right' });
      currentY += 5;
      const splitExplanation = doc.splitTextToSize(answer.explanation, pageWidth - 60);
      doc.text(splitExplanation, pageWidth - 25, currentY, { align: 'right' });
      currentY += splitExplanation.length * 4 + 5;
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(20, currentY, pageWidth - 20, currentY);
    currentY += 8;
  });

  // الصفحة الأخيرة - الشهادة
  doc.addPage();
  currentY = 80;

  doc.setFontSize(28);
  doc.setTextColor(...primaryColor);
  doc.text('شهادة الإتمام', pageWidth / 2, currentY, { align: 'center' });
  currentY += 30;

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`تقدير: ${getGrade(result.score_percentage)}`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 20;

  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  const certificate = `هذا يشهد بأن ${result.student_name} قد اجتاز امتحان ${result.exam_title} 
بنسبة نجاح ${result.score_percentage}%`;
  const splitCert = doc.splitTextToSize(certificate, pageWidth - 60);
  doc.text(splitCert, pageWidth / 2, currentY, { align: 'center' });

  // حفظ الملف
  const filename = `نتيجة_${result.student_name}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
