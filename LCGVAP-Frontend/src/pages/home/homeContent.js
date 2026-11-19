// Static content for the home page. Admin-managed content (slides, FAQs,
// featured graduates, universities) replaces these fallbacks when published.

// Shown only when the admin has not published any FAQs yet.
export const DEFAULT_FAQS = [
  {
    question: 'What documents are required for alumni verification?',
    answer:
      'Applicants must submit an official degree certificate and valid government-issued identification. Additional documentation may be requested if institutional confirmation is required.',
  },
  {
    question: 'How long does the verification process take?',
    answer:
      'Verification timelines depend on documentation completeness and institutional validation procedures. Applicants are notified electronically once a decision has been made.',
  },
  {
    question: 'How is personal identity information protected?',
    answer:
      'Identity information, including passport details and date of birth, is securely stored and used strictly for verification purposes. Access is restricted to authorized administrative personnel.',
  },
  {
    question: 'What does verified alumni status provide?',
    answer:
      'Verified status confirms institutional graduation and grants access to official alumni recognition within the portal and associated network privileges.',
  },
  {
    question: 'Can an application be resubmitted if rejected?',
    answer:
      'Yes. Applicants may resubmit documentation if prior submissions were incomplete or insufficient. Updated documentation must meet verification requirements.',
  },
];

// Hero photo + caption until the admin publishes slides via /patron/slides.
// Local, pre-sized (960x1200) copies so the hero never depends on a third party.
export const FALLBACK_SLIDES = [
  {
    title: 'Graduation day',
    subtitle: 'Each record on the register starts with a degree certificate.',
    image_url: '/home/graduation-caps.jpg',
  },
  {
    title: 'Graduates, findable by name',
    subtitle: 'Verified records can be searched by employers and fellow alumni.',
    image_url: '/home/alumni-meeting.jpg',
  },
];

// A real sequence, so it is numbered (see design-system.md, banned patterns).
// `icon` names a lucide icon; the last step shows the seal instead.
export const PROCESS_STEPS = [
  {
    title: 'Create an account',
    desc: 'Your name, contact details and passport number.',
    icon: 'UserPlus',
  },
  {
    title: 'Submit your degree',
    desc: 'Choose your university and department and upload your degree certificate.',
    icon: 'FileUp',
  },
  {
    title: 'Administrator review',
    desc: 'VCLGC checks your identity and documents. You are told the result by email.',
    icon: 'ShieldCheck',
  },
  {
    title: 'Published on the register',
    desc: 'Your record appears in the directory with the verification seal.',
    icon: 'seal',
  },
];

// Word joiners (U+2060) and a no-break space keep "2–5 business days" on one line.
export const REVIEW_TIME = '2⁠–⁠5 business days';
