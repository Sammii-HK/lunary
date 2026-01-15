export const revalidate = 86400;

import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const metadata: Metadata = {
  title: 'Witchcraft Ethics: The Wiccan Rede & Threefold Law - Lunary',
  description:
    'Learn about witchcraft ethics including the Wiccan Rede, Threefold Law, and core ethical principles. Understand harm none, respect free will, and responsible magical practice.',
  keywords: [
    'witchcraft ethics',
    'wiccan rede',
    'threefold law',
    'harm none',
    'witchcraft principles',
    'ethical witchcraft',
    'magical ethics',
  ],
  openGraph: {
    title: 'Witchcraft Ethics: The Wiccan Rede & Threefold Law - Lunary',
    description:
      'Learn about witchcraft ethics including the Wiccan Rede, Threefold Law, and core ethical principles.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Witchcraft Ethics: The Wiccan Rede & Threefold Law - Lunary',
    description: 'Learn about witchcraft ethics and ethical magical practice.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/witchcraft-ethics',
  },
};

export default function WitchcraftEthicsPage() {
  return (
    <SEOContentTemplate
      title='Witchcraft Ethics: The Wiccan Rede & Threefold Law - Lunary'
      h1='Witchcraft Ethics'
      description='Learn about witchcraft ethics including the Wiccan Rede, Threefold Law, and core ethical principles. Understand harm none, respect free will, and responsible magical practice.'
      keywords={[
        'witchcraft ethics',
        'wiccan rede',
        'threefold law',
        'harm none',
        'witchcraft principles',
        'ethical witchcraft',
      ]}
      canonicalUrl='https://lunary.app/grimoire/witchcraft-ethics'
      intro='Witchcraft ethics emphasize personal responsibility, harm none (or harm reduction), and respecting free will. Understanding ethical principles helps you practice responsibly and create positive change. Ethics guide your magical work and ensure you act with intention, respect, and responsibility.'
      tldr='Ethical witchcraft centers on harm reduction, consent, and accountability. The Wiccan Rede and Threefold Law are common guides, but many practitioners adapt them into a personal code. If your work affects others, prioritize consent and focus on protection, clarity, and healing.'
      meaning={`**The Wiccan Rede:**
"An it harm none, do what ye will."

This means: As long as it harms no one (including yourself), do what you want. Your actions should not cause harm to others or yourself. This includes not manipulating others' free will.

**The Threefold Law:**
"Whatever you send out returns to you threefold."

This means your actions (positive or negative) come back to you multiplied. It encourages ethical behavior and kindness. What you put into the world returns to you amplified.

**Core Ethical Principles:**
- **Harm none:** Don't cause harm to others or yourself
- **Respect free will:** Don't manipulate or control others
- **Consent:** Always get permission before working with others
- **Responsibility:** Take responsibility for your actions
- **Respect nature:** Honor and protect the natural world
- **Cultural respect:** Don't appropriate closed traditions
- **Confidentiality:** Keep others' spiritual practices private

**Coven vs Solitary Practice:**
Both paths are valid. Solitary practice offers freedom and flexibility. Coven practice offers community and shared learning. Many witches practice both: solitary most of the time, with occasional group work. Choose what works for your lifestyle and needs.

**Ethical decision check:**
Before doing any spellwork, ask:
- Who could be affected directly or indirectly?
- Have I sought consent or chosen a method that avoids violating free will?
- Am I acting from fear or from clarity?
- Would I still be comfortable with this decision a month from now?

Ethics are not about perfection. They are about honest reflection and responsibility for outcomes. A simple personal code you revisit regularly is often more effective than memorizing rules.`}
      tables={[
        {
          title: 'Ethical Checkpoints',
          headers: ['Question', 'Why It Matters', 'Example'],
          rows: [
            [
              'Is there consent?',
              'Consent protects autonomy',
              'Focus on self-healing vs targeting a person',
            ],
            [
              'Is there harm?',
              'Harm creates backlash',
              'Choose protection over punishment',
            ],
            [
              'Is it necessary?',
              'Necessity clarifies intent',
              'Set a boundary before casting a banishing',
            ],
            [
              'Is it respectful?',
              'Respect avoids appropriation',
              'Use traditions you are initiated into',
            ],
          ],
        },
      ]}
      howToWorkWith={[
        'Follow the Wiccan Rede: harm none',
        'Understand the Threefold Law',
        `Respect others' free will`,
        'Get consent before working with others',
        'Take responsibility for your actions',
        'Respect nature and the environment',
        'Avoid cultural appropriation',
        `Keep others' practices confidential`,
      ]}
      journalPrompts={[
        'What does harm reduction look like in my daily choices?',
        'When I feel defensive, what ethical boundary is being tested?',
        'Where do I need clearer consent in my relationships?',
        'How do I want my practice to impact the people around me?',
        'What is one ethical principle I want to recommit to this month?',
      ]}
      faqs={[
        {
          question: 'Do I have to follow the Wiccan Rede?',
          answer:
            'The Wiccan Rede is a guideline, not a requirement. Many witches follow it, others develop their own ethical codes. The key is acting with intention, respect, and responsibility. Some practitioners interpret "harm none" as "harm reduction" rather than absolute prohibition.',
        },
        {
          question: 'What if I need to do banishing or protection magic?',
          answer:
            'Protection and banishing magic are generally considered ethical when used to protect yourself or remove negative energy. The key is intention—are you protecting or attacking? Protection magic is defensive and ethical. Banishing negative energy is also ethical when done responsibly.',
        },
        {
          question: 'Can I do love spells?',
          answer: `This is debated. Many practitioners avoid love spells that target specific people (manipulating free will). Instead, they do spells to attract love in general, enhance self-love, or improve existing relationships with consent. The key is not manipulating someone's free will.`,
        },
        {
          question: 'How do I build my own ethical code?',
          answer:
            'Start with your core values, then define what you will and will not do. Write it down, review it monthly, and adjust based on real outcomes. Ethics should be lived, not just read.',
        },
      ]}
      internalLinks={[
        {
          text: 'Modern Witchcraft',
          href: '/grimoire/modern-witchcraft',
        },
        { text: 'Book of Shadows', href: '/grimoire/book-of-shadows' },
        { text: 'Witchcraft Tools', href: '/grimoire/witchcraft-tools' },
        {
          text: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
      ]}
    />
  );
}
