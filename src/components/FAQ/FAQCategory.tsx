'use client';

import { getIcon, type IconName } from '@/lib/icon-map';
import { FAQAccordion } from './FAQAccordion';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQCategoryData {
  id: string;
  title: string;
  icon: IconName;
  questions: FAQItem[];
}

interface FAQCategoryProps {
  category: FAQCategoryData;
  openQuestionId: string | null;
  onQuestionToggle: (questionId: string) => void;
}

export function FAQCategory({
  category,
  openQuestionId,
  onQuestionToggle,
}: FAQCategoryProps) {
  return (
    <section id={category.id} className='scroll-mt-24'>
      {/* Category Header */}
      <div className='flex items-center gap-3 mb-6'>
        <div className='p-2 rounded-lg bg-lunary-primary-900/20 text-lunary-primary-300'>
          {getIcon(category.icon, 'w-5 h-5')}
        </div>
        <div>
          <h2 className='text-2xl md:text-3xl font-light text-zinc-100'>
            {category.title}
          </h2>
          <p className='text-sm text-zinc-500'>
            {category.questions.length} question
            {category.questions.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Questions */}
      <div className='space-y-3'>
        {category.questions.map((faq) => (
          <FAQAccordion
            key={faq.id}
            question={faq.question}
            answer={faq.answer}
            isOpen={openQuestionId === faq.id}
            onToggle={() => onQuestionToggle(faq.id)}
          />
        ))}
      </div>
    </section>
  );
}
