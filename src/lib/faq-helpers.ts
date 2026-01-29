import faqData from '@/data/faq.json';
import type { FAQItem, FAQCategoryData } from '@/components/FAQ';

// Type-safe FAQ data accessors
export function getHomepageFAQs(): FAQItem[] {
  return faqData.homepage as FAQItem[];
}

export function getPricingFAQs(): FAQItem[] {
  return faqData.pricing as FAQItem[];
}

export function getAllFAQCategories(): FAQCategoryData[] {
  return faqData.categories as FAQCategoryData[];
}

export function getAllFAQs(): FAQItem[] {
  const categories = getAllFAQCategories();
  return categories.flatMap((cat) => cat.questions);
}

export function getFAQById(id: string): FAQItem | undefined {
  return getAllFAQs().find((faq) => faq.id === id);
}

export function searchFAQs(query: string): FAQItem[] {
  const lowerQuery = query.toLowerCase();
  return getAllFAQs().filter(
    (faq) =>
      faq.question.toLowerCase().includes(lowerQuery) ||
      faq.answer.toLowerCase().includes(lowerQuery),
  );
}
