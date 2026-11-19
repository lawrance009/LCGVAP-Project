const PUBLIC_POLICY_VERSION = 'public-policy-v2';

const PUBLIC_POLICY_KNOWLEDGE = [
  {
    id: 'platform-purpose',
    title: 'Platform Purpose',
    keywords: [
      'platform',
      'vclgc',
      'lcgvap',
      'purpose',
      'mission',
      'veteran',
      'community',
      'liberian',
      'cyprus',
      'graduates',
      'alumni',
    ],
    text:
      'VCLGC Alumni Portal is the official digital platform for the Veteran Community of Liberian Graduates from Cyprus. Its purpose is to help Liberian graduates from Cyprus submit credentials, become verified, appear in the public directory, and stay connected through alumni news, leadership, and community engagement.',
    fallbackAnswer:
      'The VCLGC Alumni Portal is the official digital platform for the Veteran Community of Liberian Graduates from Cyprus. It helps graduates submit credentials, become verified, appear in the public directory, and stay connected through alumni news and leadership.',
  },
  {
    id: 'assistant-truth-authority',
    title: 'Assistant Truth And Authority',
    keywords: [
      'truth',
      'authority',
      'human',
      'verifier',
      'source of truth',
      'ai generated',
      'establish',
      'verify',
      'approve',
      'reject',
      'authentic',
      'fake',
      'bypass',
      'irreversible',
      'decision',
    ],
    text:
      'The Veteran Assistant assists with truth. It does not establish truth. Final verification authority must always remain with an authorized human verifier. The assistant must never verify a Veteran, approve or reject a verification application, change a Veteran verification status, create, modify, or delete academic credentials, claim that a document is authentic or fake, bypass human verification, make irreversible account or administrative decisions, invent information, manipulate Veteran status, or falsely obtain Veteran status. LCGVAP verified records are the source of truth, not the AI.',
    fallbackAnswer:
      'Veteran Assistant can assist with truth, but it does not establish truth. Final verification authority always remains with an authorized human verifier, and verified LCGVAP records are the source of truth.',
  },
  {
    id: 'assistant-permitted-help',
    title: 'Assistant Permitted Help',
    keywords: [
      'can you',
      'may',
      'allowed',
      'help',
      'guide',
      'missing',
      'documents',
      'requirements',
      'summarize',
      'reviewer',
      'inconsistency',
      'unusual',
      'navigate',
      'badges',
      'profiles',
      'procedures',
      'universities',
    ],
    text:
      'The Veteran Assistant may explain the verification process and requirements, guide Veterans through submitting information correctly, identify missing documents or information, summarize submitted information for authorized reviewers, flag inconsistencies or unusual information for human review, answer questions about LCGVAP policies, universities, badges, profiles, and procedures using approved platform knowledge, search or recommend publicly available verified Veteran profiles where permissions allow, help users navigate the platform, and assist admins during verification. Admin assistance is advisory only.',
    fallbackAnswer:
      'Veteran Assistant can explain requirements, guide submissions, identify missing information, answer approved platform questions, help users navigate, and support admins with advisory summaries or flags. It cannot replace human verification.',
  },
  {
    id: 'registration-eligibility',
    title: 'Registration Eligibility',
    keywords: [
      'register',
      'registration',
      'signup',
      'sign up',
      'apply',
      'eligible',
      'eligibility',
      'graduate',
      'cyprus',
      'liberian',
    ],
    text:
      'Public registration is intended for Liberian graduates who studied in Cyprus. A graduate submits their personal details, academic information, and required credential document through the public registration form. Registration creates a pending record and does not automatically confirm membership.',
    fallbackAnswer:
      'Registration is for Liberian graduates who studied in Cyprus. Submit the public registration form with your personal details, academic information, and credential document; approval is not automatic because every record goes through admin review.',
  },
  {
    id: 'registration-required-fields',
    title: 'Registration Required Fields',
    keywords: [
      'required',
      'field',
      'fields',
      'documents',
      'document',
      'certificate',
      'passport',
      'date of birth',
      'dob',
      'university',
      'department',
      'degree',
      'graduation',
      'photo',
    ],
    text:
      'The public registration form requires first name, last name, email, passport number, date of birth, university, department, degree type, graduation year, and a degree certificate file. Profile photo and biography are optional where available.',
    fallbackAnswer:
      'The required registration details are your name, email, passport number, date of birth, university, department, degree type, graduation year, and degree certificate file. A profile photo or short bio may be optional where the form provides it.',
  },
  {
    id: 'verification-review',
    title: 'Verification Review',
    keywords: [
      'verify',
      'verification',
      'approved',
      'approval',
      'pending',
      'review',
      'reviewed',
      'credential',
      'credentials',
      'admin',
      'automatic',
    ],
    text:
      'Admins review submitted graduate records and academic documents before a graduate becomes verified. Verification is not automatic. Veteran Assistant can explain the process and requirements, but only authorized human admins or verifiers can approve, reject, edit, archive, restore, delete, or make final verification decisions.',
    fallbackAnswer:
      'Verification is handled by the admin team after they review the submitted graduate record and academic document. Veteran Assistant can explain the process, but only admins can approve or reject records.',
  },
  {
    id: 'status-permissions',
    title: 'Verification Status Permissions',
    keywords: [
      'status',
      'my status',
      'current status',
      'check status',
      'application status',
      'am i verified',
      'am i approved',
      'pending status',
      'approved status',
      'rejected status',
      'permissions',
      'authorized',
    ],
    text:
      'The assistant may check and explain a user current verification status only when the user is authenticated and the assistant uses authorized backend tools or APIs with proper permission controls. Public chat cannot confirm a private user status because it does not have authenticated account access. When information cannot be confirmed, the assistant must say so and refer the user to their dashboard, email notice, or the VCLGC admin team.',
    fallbackAnswer:
      'I can explain what verification statuses mean, but public chat cannot confirm your personal status without authenticated account access. Please check your dashboard or approval/rejection email, or contact the VCLGC admin team.',
  },
  {
    id: 'pending-login',
    title: 'Pending Account Login',
    keywords: [
      'login',
      'log in',
      'signin',
      'sign in',
      'otp',
      'password',
      'pending',
      'cannot login',
      'cant login',
      'email',
    ],
    text:
      'A pending graduate may not be able to log in or request a login OTP until admin verification is complete. After approval or rejection, the graduate should receive an email notification when the email service is configured.',
    fallbackAnswer:
      'If you cannot log in, your graduate account may still be pending admin verification. After approval or rejection, you should receive an email notice when email service is configured.',
  },
  {
    id: 'approval-rejection',
    title: 'Approval And Rejection',
    keywords: [
      'approved',
      'rejected',
      'rejection',
      'reason',
      'email',
      'confirmation',
      'notice',
      'resubmit',
      'again',
      'invalid',
    ],
    text:
      'When a graduate is approved, the platform sends a confirmation email if email service is configured. If a submission cannot be approved, the rejection message may include a reason and may instruct the applicant to review the verification process before submitting again.',
    fallbackAnswer:
      'Approved graduates should receive a confirmation email when email service is configured. If a submission is rejected, the message may include a reason and the applicant may need to review the verification process before trying again.',
  },
  {
    id: 'directory-visibility',
    title: 'Directory Visibility',
    keywords: [
      'directory',
      'search',
      'find',
      'visible',
      'profile',
      'public',
      'graduate',
      'graduates',
      'active',
      'archived',
    ],
    text:
      'The public directory shows active graduates who have already been verified by the admin team. Pending, rejected, archived, deleted, and private records are not shown in public directory views. Visitors can search and filter public verified records by visible public information.',
    fallbackAnswer:
      'The public directory shows active, admin-verified graduates only. Pending, rejected, archived, deleted, and private records are not shown publicly.',
  },
  {
    id: 'privacy-sensitive-data',
    title: 'Privacy And Sensitive Data',
    keywords: [
      'privacy',
      'private',
      'sensitive',
      'passport',
      'dob',
      'date of birth',
      'certificate',
      'document',
      'admin note',
      'password',
      'token',
      'api key',
      'secret',
    ],
    text:
      'Passport numbers, dates of birth, certificate files, passwords, tokens, API keys, admin notes, and internal records are private. They are used only for verification, login, security, or administration and are not displayed in the public directory. Veteran Assistant must not ask for or expose sensitive information, access data outside the user permissions, or reveal private Veteran information to unauthorized users.',
    fallbackAnswer:
      'Passport numbers, dates of birth, certificate files, passwords, tokens, API keys, admin notes, and internal records are private. They are used for verification or security and are not displayed in the public directory.',
  },
  {
    id: 'admin-only-actions',
    title: 'Admin Only Actions',
    keywords: [
      'admin',
      'approve',
      'reject',
      'verify me',
      'verify my',
      'edit',
      'delete',
      'archive',
      'restore',
      'change status',
      'database',
    ],
    text:
      'Only authorized admins can verify, reject, edit, archive, restore, delete, or make administrative decisions about graduate records. Veteran Assistant must use authorized backend tools or APIs rather than unrestricted database access. It cannot perform account changes, update statuses, check private database records, open certificate files, make admin decisions, or manipulate verification status.',
    fallbackAnswer:
      'Only authorized admins can verify, reject, edit, archive, restore, or delete graduate records. Veteran Assistant cannot change records or check private account data.',
  },
  {
    id: 'graduate-profile-degrees',
    title: 'Graduate Profile And Degrees',
    keywords: [
      'profile',
      'dashboard',
      'degree',
      'degrees',
      'add degree',
      'submit degree',
      'badge',
      'credential',
      'field of study',
    ],
    text:
      'After a graduate has access to their account, they can manage visible profile details where available and submit additional academic degrees for admin verification. Degree badges or recognition depend on admin review and are not awarded automatically.',
    fallbackAnswer:
      'After account access is available, graduates can manage profile details where the portal allows it and submit additional degrees for review. Badges and recognition depend on admin verification.',
  },
  {
    id: 'departments-universities',
    title: 'Departments And Universities',
    keywords: [
      'department',
      'departments',
      'university',
      'universities',
      'course',
      'courses',
      'global',
      'shared',
      'specific',
    ],
    text:
      'Departments can be shared across universities or tied to a specific university depending on how the admin adds them. If an admin creates a department without selecting a university, it is available to all universities. If an admin selects a university, the department belongs to that university only.',
    fallbackAnswer:
      'Departments can be global or university-specific. If an admin adds a department without choosing a university, it is available to all universities; if a university is selected, it belongs only to that university.',
  },
  {
    id: 'public-support',
    title: 'Public Support',
    keywords: [
      'contact',
      'email',
      'support',
      'help',
      'correction',
      'correct',
      'urgent',
      'question',
      'problem',
    ],
    text:
      'For account-specific problems, private records, corrections, or urgent verification questions, users should contact the VCLGC admin team. The public support email is lcgvapliberiancyprusgraduatesv@gmail.com.',
    fallbackAnswer:
      'For account-specific help, corrections, or verification concerns, contact the VCLGC admin team at lcgvapliberiancyprusgraduatesv@gmail.com.',
  },
];

module.exports = {
  PUBLIC_POLICY_VERSION,
  PUBLIC_POLICY_KNOWLEDGE,
};
