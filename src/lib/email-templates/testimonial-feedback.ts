const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  'https://lunary.app';
const TESTIMONIAL_PAGE_URL = `${APP_BASE_URL.replace(/\/$/, '')}/testimonials-new`;

export type TestimonialEmailType = 'intro' | 'followup';

interface TestimonialEmailTemplate {
  subject: string;
  text: string;
  html: string;
}

const templates: Record<TestimonialEmailType, TestimonialEmailTemplate> = {
  intro: {
    subject: 'A small check-in from Lunary ✨',
    text: `Hi,

I just wanted to take a moment to say thank you for being part of the Lunary beta.

Seeing people explore their charts, daily insights, and tarot has genuinely meant more to me than I can easily put into words. Lunary is still very much growing, and hearing how it's landing for real people helps shape what it becomes next.

If you're open to it, I'd love to hear your honest thoughts so far. Anything at all is helpful - what resonated, what surprised you, what felt grounding, or even what felt confusing or unfinished.

You can simply reply to this email and share whatever comes to mind.

If it's easier, I've also made a small page where you can leave feedback in your own time:
${TESTIMONIAL_PAGE_URL}

There's no right or wrong way to respond, and no expectation at all. I'm just really grateful you're here and exploring this with me.

Thank you for being part of Lunary's early days. It truly means more than you know.

Warmly,
Sammii
Founder, Lunary`,
    html: `<p>Hi,</p>
<p>I just wanted to take a moment to say thank you for being part of the Lunary beta.</p>
<p>Seeing people explore their charts, daily insights, and tarot has genuinely meant more to me than I can easily put into words. Lunary is still very much growing, and hearing how it's landing for real people helps shape what it becomes next.</p>
<p>If you're open to it, I'd love to hear your honest thoughts so far. Anything at all is helpful - what resonated, what surprised you, what felt grounding, or even what felt confusing or unfinished.</p>
<p>You can simply reply to this email and share whatever comes to mind.</p>
<p>If it's easier, I've also made a small page where you can leave feedback in your own time:<br/>
<a href="${TESTIMONIAL_PAGE_URL}">${TESTIMONIAL_PAGE_URL}</a></p>
<p>There's no right or wrong way to respond, and no expectation at all. I'm just really grateful you're here and exploring this with me.</p>
<p>Thank you for being part of Lunary's early days. It truly means more than you know.</p>
<p>Warmly,<br/>Sammii<br/>Founder, Lunary</p>`,
  },
  followup: {
    subject: 'Just checking in, if now feels like the right time',
    text: `Hi,

I just wanted to gently check in again, in case you saw my last email but life got busy.

By now you've had a little more time with Lunary, and I'm slowly shaping what comes next based on how people are actually using it. Hearing real experiences, even short ones, has been incredibly grounding for me as I build.

If you feel up to it, I'd love to know how Lunary has felt for you over time.
What you return to.
What feels helpful.
What you wish existed.

You can reply directly to this email with a few thoughts, or, if it's easier, you can leave something here whenever it suits you:
${TESTIMONIAL_PAGE_URL}

Absolutely no pressure at all. Even a single sentence is meaningful, and silence is completely okay too.

Thank you again for being part of this early chapter. I'm really grateful you're here.

Warmly,
Sammii
Founder, Lunary`,
    html: `<p>Hi,</p>
<p>I just wanted to gently check in again, in case you saw my last email but life got busy.</p>
<p>By now you've had a little more time with Lunary, and I'm slowly shaping what comes next based on how people are actually using it. Hearing real experiences, even short ones, has been incredibly grounding for me as I build.</p>
<p>If you feel up to it, I'd love to know how Lunary has felt for you over time.<br/>
What you return to.<br/>
What feels helpful.<br/>
What you wish existed.</p>
<p>You can reply directly to this email with a few thoughts, or, if it's easier, you can leave something here whenever it suits you:<br/>
<a href="${TESTIMONIAL_PAGE_URL}">${TESTIMONIAL_PAGE_URL}</a></p>
<p>Absolutely no pressure at all. Even a single sentence is meaningful, and silence is completely okay too.</p>
<p>Thank you again for being part of this early chapter. I'm really grateful you're here.</p>
<p>Warmly,<br/>Sammii<br/>Founder, Lunary</p>`,
  },
};

export function getTestimonialFeedbackEmail(type: TestimonialEmailType) {
  return templates[type];
}
