import { createElement } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Archive,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  FileCheck2,
  GraduationCap,
  Network,
  ShieldCheck,
  UserPlus,
  UsersRound,
} from 'lucide-react';
import { BRAND } from '../constants/branding';

const MotionDiv = motion.div;

const trustPillars = [
  {
    title: 'Verified Records',
    text: 'Graduate profiles appear only after academic records are reviewed and approved.',
    icon: ShieldCheck,
    iconClassName: 'bg-indigo-50 text-indigo-700',
  },
  {
    title: 'Alumni Legacy',
    text: 'The platform keeps a living record of Liberian graduates who studied in Cyprus.',
    icon: Archive,
    iconClassName: 'bg-red-50 text-red-700',
  },
  {
    title: 'Professional Connection',
    text: 'Members can be discovered through a trusted directory built for recognition and opportunity.',
    icon: Network,
    iconClassName: 'bg-sky-50 text-sky-700',
  },
];

const journeySteps = [
  {
    title: 'Graduate Registers',
    text: 'A graduate submits identity details and academic information.',
    icon: UserPlus,
  },
  {
    title: 'Records Reviewed',
    text: 'Admins check submitted credentials before public approval.',
    icon: FileCheck2,
  },
  {
    title: 'Profile Published',
    text: 'Approved graduates become visible in the public directory.',
    icon: BadgeCheck,
  },
  {
    title: 'Community Connects',
    text: 'Alumni, institutions, and partners can discover verified members.',
    icon: UsersRound,
  },
];

const objectives = [
  'Maintain a trusted registry of verified Liberian graduates from Cyprus.',
  'Strengthen alumni recognition, professional visibility, and community pride.',
  'Support academic integrity through careful credential review.',
  'Preserve the shared history of Liberian academic achievement in Cyprus.',
  'Create a stronger bridge between graduates, universities, and opportunities.',
];

const About = () => (
  <div className="min-h-screen bg-slate-50 text-slate-950">
    <section className="relative overflow-hidden bg-[#0b1020] text-white">
      <img
        src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-25"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[#0b1020]/75" aria-hidden="true"></div>
      <div className="absolute inset-x-0 top-0 grid h-1 grid-cols-3" aria-hidden="true">
        <div className="bg-red-600"></div>
        <div className="bg-white"></div>
        <div className="bg-indigo-600"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <MotionDiv
          className="max-w-4xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs font-bold uppercase text-red-200 backdrop-blur">
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            About {BRAND.shortName}
          </div>

          <h1 className="max-w-4xl text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
            A Verified Home For Liberian Graduates From Cyprus
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
            {BRAND.portalName} documents, verifies, and connects Liberian graduates who pursued higher education in Cyprus.
            It exists to protect credibility, preserve legacy, and make the alumni community easier to find.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-red-600 px-5 text-sm font-bold !text-white transition-colors hover:bg-red-700"
            >
              Begin Verification
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/directory"
              className="inline-flex h-12 items-center justify-center rounded-md bg-white px-5 text-sm font-bold text-slate-950 transition-colors hover:bg-slate-100"
            >
              View Directory
            </Link>
          </div>
        </MotionDiv>
      </div>
    </section>

    <section className="relative z-10 -mt-8 px-4 sm:px-6 lg:px-8">
      <MotionDiv
        className="mx-auto max-w-7xl rounded-md bg-white p-5 shadow-xl shadow-slate-950/10 sm:p-6 lg:p-8"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="mb-2 text-xs font-bold uppercase text-indigo-700">Platform Identity</p>
            <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
              {BRAND.shortName} means {BRAND.fullName}
            </h2>
          </div>
          <p className="text-sm leading-7 text-slate-600 sm:text-base">
            The platform serves as the official digital space for verification, discovery, and alumni recognition.
            It gives the community one organized place to confirm approved graduate records and tell the larger story of
            Liberian academic achievement in Cyprus.
          </p>
        </div>
      </MotionDiv>
    </section>

    <section className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <MotionDiv
          className="mb-8 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-2 text-xs font-bold uppercase text-red-700">What We Protect</p>
          <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-4xl">
            Trust is the center of the platform.
          </h2>
        </MotionDiv>

        <div className="grid gap-4 md:grid-cols-3">
          {trustPillars.map((pillar, index) => {
            const Icon = pillar.icon;

            return (
              <MotionDiv
                key={pillar.title}
                className="rounded-md bg-white p-5 shadow-sm shadow-slate-950/5 sm:p-6"
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-md ${pillar.iconClassName}`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-black text-slate-950">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{pillar.text}</p>
              </MotionDiv>
            );
          })}
        </div>
      </div>
    </section>

    <section className="bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-2">
        <StatementPanel
          label="Our Mission"
          title="Connect, document, and empower Liberian graduates from Cyprus through a secure platform for recognition and opportunity."
          icon={GraduationCap}
          accentClassName="bg-indigo-700 text-white"
        />
        <StatementPanel
          label="Our Vision"
          title="Build a globally recognized alumni community known for credibility, excellence, and lifelong engagement."
          icon={BookOpenCheck}
          accentClassName="bg-red-600 text-white"
          delay={0.08}
        />
      </div>
    </section>

    <section className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <MotionDiv
          className="mb-10 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-bold uppercase text-indigo-700">How It Works</p>
            <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-4xl">
              From graduate record to public recognition.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-600">
            The journey is simple, but the verification step keeps the directory meaningful.
          </p>
        </MotionDiv>

        <div className="relative grid gap-4 lg:grid-cols-4">
          <div className="absolute left-6 top-6 hidden h-1 w-[calc(100%-3rem)] bg-slate-200 lg:block" aria-hidden="true"></div>
          {journeySteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <MotionDiv
                key={step.title}
                className="relative rounded-md bg-white p-5 shadow-sm shadow-slate-950/5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-slate-950 text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="mb-2 text-xs font-black text-red-700">Step {index + 1}</p>
                <h3 className="text-base font-black text-slate-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.text}</p>
              </MotionDiv>
            );
          })}
        </div>
      </div>
    </section>

    <section className="bg-slate-950 px-4 py-14 text-white sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <MotionDiv
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-2 text-xs font-bold uppercase text-red-300">Objectives</p>
          <h2 className="text-2xl font-black leading-tight sm:text-4xl">
            The work behind the registry.
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Every objective supports one bigger goal: a verified alumni community that can be trusted,
            recognized, and carried forward.
          </p>
        </MotionDiv>

        <div className="space-y-3">
          {objectives.map((objective, index) => (
            <MotionDiv
              key={objective}
              className="flex gap-4 rounded-md bg-white/[0.07] p-4"
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.42, delay: index * 0.05 }}
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-indigo-600 text-sm font-black text-white">
                {index + 1}
              </span>
              <p className="text-sm leading-6 text-slate-200">{objective}</p>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>

    <section className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <MotionDiv
        className="mx-auto max-w-4xl text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.5 }}
      >
        <p className="mb-3 text-xs font-bold uppercase text-indigo-700">{BRAND.tagline}</p>
        <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-4xl">
          More than a directory, this is a record of shared achievement.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          {BRAND.shortName} gives Liberian graduates from Cyprus a visible, verified, and organized platform
          for recognition, connection, and future opportunity.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/register"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-red-600 px-5 text-sm font-bold !text-white transition-colors hover:bg-red-700"
          >
            Begin Verification
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            to="/directory"
            className="inline-flex h-12 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-bold text-white transition-colors hover:bg-indigo-800"
          >
            View Directory
          </Link>
        </div>
      </MotionDiv>
    </section>
  </div>
);

const StatementPanel = ({
  label,
  title,
  icon,
  accentClassName,
  delay = 0,
}) => (
  <MotionDiv
    className="rounded-md bg-slate-50 p-5 shadow-sm shadow-slate-950/5 sm:p-6 lg:p-8"
    initial={{ opacity: 0, y: 22 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.35 }}
    transition={{ duration: 0.5, delay }}
  >
    <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-md ${accentClassName}`}>
      {createElement(icon, {
        className: 'h-6 w-6',
        'aria-hidden': 'true',
      })}
    </div>
    <p className="mb-3 text-xs font-bold uppercase text-indigo-700">{label}</p>
    <h3 className="text-xl font-black leading-snug text-slate-950 sm:text-2xl">
      {title}
    </h3>
  </MotionDiv>
);

export default About;
