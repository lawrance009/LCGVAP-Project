import { createElement, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Swal from "sweetalert2";
import getFileUrl from "../utils/getFileUrl";
import api from "../services/api";
import AnimatedGlobe from "../components/AnimatedGlobe";
import FeaturedUniversitiesSection from "../components/FeaturedUniversitiesSection";
import { BRAND } from "../constants/branding";
import {
  Mail,
  ArrowRight,
  Clock,
  Shield,
  CheckCircle2,
  ShieldCheck,
  BadgeCheck,
  Building2,
  ChevronDown,
  CircleCheckBig,
  FileCheck2,
  GraduationCap,
  IdCard,
  Network,
  UserPlus,
} from "lucide-react";

const MotionDiv = motion.div;
const MotionForm = motion.form;
const MotionPath = motion.path;

// Fallback FAQs shown only when the admin has not published any yet.
const DEFAULT_FAQS = [
  {
    question: "What documents are required for alumni verification?",
    answer:
      "Applicants must submit an official degree certificate and valid government-issued identification. Additional documentation may be requested if institutional confirmation is required.",
  },
  {
    question: "How long does the verification process take?",
    answer:
      "Verification timelines depend on documentation completeness and institutional validation procedures. Applicants are notified electronically once a decision has been made.",
  },
  {
    question: "How is personal identity information protected?",
    answer:
      "Identity information, including passport details and date of birth, is securely stored and used strictly for verification purposes. Access is restricted to authorized administrative personnel.",
  },
  {
    question: "What does verified alumni status provide?",
    answer:
      "Verified status confirms institutional graduation and grants access to official alumni recognition within the portal and associated network privileges.",
  },
  {
    question: "Can an application be resubmitted if rejected?",
    answer:
      "Yes. Applicants may resubmit documentation if prior submissions were incomplete or insufficient. Updated documentation must meet verification requirements.",
  },
];

// Fallback hero slides — shown only until the admin publishes slides via
// the Slides CMS (/patron/slides). Three distinct angles: the achievement
// itself, the community it belongs to, and the security behind it.
const FALLBACK_SLIDES = [
  {
    title: "Verified Liberian Cyprus Graduates Registry",
    subtitle:
      "A trusted public home for alumni identity, academic recognition, and community legacy.",
    image_url:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80",
  },
  {
    title: "Credentials Reviewed With Care",
    subtitle:
      "Graduates submit academic records for careful administrative review before public recognition.",
    image_url:
      "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1920&q=80",
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Create account",
    desc: "Start with identity and contact details.",
    icon: UserPlus,
    tone: "red",
    nodeColor: "#dc2626",
    node: { x: 110, y: 270 },
    desktop: { left: "0%", top: "220px" },
  },
  {
    step: "02",
    title: "Submit credentials",
    desc: "Upload academic documents for review.",
    icon: FileCheck2,
    tone: "indigo",
    nodeColor: "#4f46e5",
    node: { x: 365, y: 125 },
    desktop: { left: "23%", top: "66px" },
  },
  {
    step: "03",
    title: "Admin review",
    desc: "Identity and degree details are checked.",
    icon: IdCard,
    tone: "blue",
    nodeColor: "#0369a1",
    node: { x: 650, y: 282 },
    desktop: { left: "48%", top: "232px" },
  },
  {
    step: "04",
    title: "Directory ready",
    desc: "Approved profiles become searchable.",
    icon: CircleCheckBig,
    tone: "slate",
    nodeColor: "#0f172a",
    node: { x: 970, y: 135 },
    desktop: { left: "74%", top: "88px" },
  },
];

const Home = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [graduates, setGraduates] = useState([]);
  const [currentGraduate, setCurrentGraduate] = useState(0);
  const [faqs, setFaqs] = useState([]);
  const [, setLoading] = useState(true);
  const [stats, setStats] = useState({
    verified: null,
    universities: null,
    departments: null,
  });
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const mobileJourneyRef = useRef(null);
  const { scrollYProgress: mobileJourneyProgress } = useScroll({
    target: mobileJourneyRef,
    offset: ["start 82%", "end 38%"],
  });
  const mobileJourneyDraw = useSpring(mobileJourneyProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.35,
  });
  const mobileTrackerTop = useTransform(mobileJourneyDraw, [0, 1], ["2%", "92%"]);
  const mobileTrackerX = useTransform(
    mobileJourneyDraw,
    [0, 0.25, 0.5, 0.75, 1],
    [0, -9, 7, -6, 5]
  );
  const mobileTrackerOpacity = useTransform(
    mobileJourneyProgress,
    [0, 0.08, 0.94, 1],
    [0, 1, 1, 0]
  );

  useEffect(() => {
    const fetchAllData = async () => {
      // allSettled so one failing endpoint never blanks the whole page.
      const [slidesRes, graduatesRes, faqsRes, statsRes] =
        await Promise.allSettled([
          api.get("/slides/public"),
          api.get("/graduates-showcase/featured"),
          api.get("/faq/published"),
          api.get("/users/stats/public"),
        ]);

      if (slidesRes.status === "fulfilled")
        setSlides(slidesRes.value.data || []);
      if (graduatesRes.status === "fulfilled")
        setGraduates(graduatesRes.value.data || []);
      if (faqsRes.status === "fulfilled") setFaqs(faqsRes.value.data || []);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data || {});

      setLoading(false);
    };

    fetchAllData();
  }, []);

  // Auto-advance hero slides — swaps every 7s (the middle of the 5-10s
  // window). Falls back to cycling the 3 FALLBACK_SLIDES when the admin
  // hasn't published any slides yet, so the hero never goes static.
  useEffect(() => {
    const count = slides.length > 0 ? slides.length : FALLBACK_SLIDES.length;
    if (count <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % count);
    }, 7000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // Auto-advance graduates showcase
  useEffect(() => {
    if (graduates.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentGraduate((prev) => (prev + 1) % graduates.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [graduates.length]);

  // Active slide set: admin-managed CMS slides (via /patron/slides) take
  // priority; fall back to the 3 curated slides above when none are
  // published yet, so the hero is never empty.
  const activeSlides = slides.length > 0 ? slides : FALLBACK_SLIDES;
  const slideCount = activeSlides.length;
  const heroContent =
    activeSlides[currentSlide % slideCount] || activeSlides[0];
  const guidelineItems = faqs.length > 0 ? faqs : DEFAULT_FAQS;

  // Handle Verification Office contact submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();

    const { name, email, subject, message } = contactForm;
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing information",
        text: "Please complete all fields before submitting.",
        confirmButtonColor: "#4f46e5",
      });
      return;
    }

    setContactSubmitting(true);
    try {
      await api.post("/faq/submit", {
        question: `[Contact Inquiry] ${subject}\n\nFrom: ${name}\n\n${message}`,
        category: "Contact",
        submitted_by_email: email,
      });
      Swal.fire({
        icon: "success",
        title: "Inquiry submitted",
        text: "Our verification office will respond within 2–5 business days.",
        confirmButtonColor: "#4f46e5",
      });
      setContactForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      Swal.fire({
        icon: "error",
        title: "Submission failed",
        text: "Something went wrong. Please try again later.",
        confirmButtonColor: "#4f46e5",
      });
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div
      className="relative overflow-hidden bg-slate-50"
    >
      {/* ================= HERO SECTION — 3-panel swipe slider ================= */}
      <section className="relative min-h-[560px] overflow-hidden bg-indigo-950 sm:min-h-[620px] lg:min-h-[660px]">
        <AnimatePresence mode="wait">
          <MotionDiv
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Background image */}
            <img
              src={
                getFileUrl(heroContent.image_url) ||
                FALLBACK_SLIDES[0].image_url
              }
              alt={heroContent.title || `${BRAND.shortName} Verification`}
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = FALLBACK_SLIDES[0].image_url;
              }}
            />

            <div className="absolute inset-0 bg-indigo-950/72"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-indigo-950/72 to-indigo-950/18"></div>
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-50 via-slate-50/35 to-transparent"></div>
            <div className="pointer-events-none absolute -right-36 top-10 z-0 w-[430px] opacity-35 sm:-right-20 sm:top-6 sm:w-[520px] lg:hidden">
              <AnimatedGlobe idPrefix="mobile-hero-globe" showLabels={false} className="max-w-none" />
            </div>

            {/* Slide content */}
            <div className="relative z-10 flex h-full items-center">
              <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8 lg:py-20">
                <div className="max-w-4xl">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
                    <ShieldCheck className="h-4 w-4 text-red-300" aria-hidden="true" />
                    <span className="hidden" aria-hidden="true">
                      {BRAND.shortName} · {BRAND.portalSubtitle}
                    </span>
                    <span>{BRAND.shortName} official alumni registry</span>
                  </div>

                  <h1 className="max-w-3xl text-4xl font-black leading-[1.04] text-white sm:text-5xl lg:text-6xl">
                    {heroContent.title}
                  </h1>

                  {heroContent.subtitle && (
                    <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 sm:text-lg lg:text-xl lg:leading-8">
                      {heroContent.subtitle}
                    </p>
                  )}

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Link
                      to="/register"
                        className="inline-flex items-center justify-center rounded-md bg-red-600 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
                    >
                      Begin verification
                    </Link>

                    <Link
                      to="/directory"
                      className="inline-flex items-center justify-center rounded-md border border-white/35 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-indigo-950"
                    >
                      Search the directory
                    </Link>
                  </div>

                  <div className="mt-10 hidden max-w-4xl grid-cols-3 border-y border-white/16 bg-indigo-950/58 backdrop-blur md:grid">
                    <div className="border-r border-white/12 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-red-200">Registry Purpose</p>
                      <p className="mt-1 text-sm leading-6 text-white/78">Verified identity and alumni recognition.</p>
                    </div>
                    <div className="border-r border-white/12 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">Directory Standard</p>
                      <p className="mt-1 text-sm leading-6 text-white/78">Only approved public information is shown.</p>
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">Community Focus</p>
                      <p className="mt-1 text-sm leading-6 text-white/78">Liberian graduates from Cyprus in one record.</p>
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none hidden justify-self-end lg:block">
                  <AnimatedGlobe idPrefix="desktop-hero-globe" />
                </div>
              </div>
            </div>
          </MotionDiv>
        </AnimatePresence>

        {slideCount > 1 && (
          <div className="absolute right-4 top-5 z-10 flex gap-2 sm:right-6 lg:right-8">
            {Array.from({ length: slideCount }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Show slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide
                    ? "bg-red-300 w-10"
                    : "bg-white/45 w-2 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        )}
      </section>
      {/* --- Stats Section --- */}
      <section className="relative overflow-hidden border-y border-slate-200 bg-slate-50 py-12 sm:py-14 lg:py-16">
        <div className="absolute inset-x-0 top-0 grid h-1 grid-cols-3" aria-hidden="true">
          <div className="bg-red-600"></div>
          <div className="bg-white"></div>
          <div className="bg-indigo-700"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6">
          <MotionDiv
            className="mx-auto mb-7 flex max-w-7xl flex-col gap-4 md:mb-9 md:flex-row md:items-end md:justify-between"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-red-600">
                <span className="h-px w-8 bg-red-600" aria-hidden="true"></span>
                Registry Snapshot
              </div>
              <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl lg:text-4xl">
                Verified alumni numbers, kept clear and current.
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-slate-600 sm:text-base">
              A fast view of the records, schools, and departments shaping the Liberian Cyprus graduate network.
            </p>
          </MotionDiv>

          <MotionDiv
            className="mx-auto grid max-w-7xl grid-cols-2 gap-3 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
          >
            <StatItem
              icon={GraduationCap}
              number={
                stats.verified != null ? stats.verified.toLocaleString() : "—"
              }
              label="Graduates"
              detail="Verified alumni records"
              tone="red"
            />
            <StatItem
              icon={Building2}
              number={
                stats.universities != null
                  ? stats.universities.toLocaleString()
                  : "—"
              }
              label="Universities"
              detail="Cyprus institutions"
              tone="indigo"
            />
            <StatItem
              icon={Network}
              number={
                stats.departments != null
                  ? stats.departments.toLocaleString()
                  : "—"
              }
              label="Departments"
              detail="Academic pathways"
              tone="blue"
            />
            <StatItem
              icon={BadgeCheck}
              number="100%"
              label="Reviewed"
              detail="Published after approval"
              eyebrow="Standard"
              tone="slate"
            />
          </MotionDiv>
        </div>
      </section>

      {/* --- About / Why Verification --- */}
      <section className="relative overflow-hidden bg-white py-14 sm:py-16 lg:py-24">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 border-l border-slate-100 bg-slate-50 lg:block" aria-hidden="true"></div>

        <div className="container relative mx-auto px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.62fr)] lg:items-center lg:gap-12">
            <MotionDiv
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">
                <span className="h-px w-8 bg-indigo-700" aria-hidden="true"></span>
                Why Verification Matters
              </div>

              <h2 className="max-w-3xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Verification turns a graduate record into public trust.
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                {BRAND.shortName} protects the value of every approved profile by
                checking identity, reviewing academic evidence, and publishing
                only the details that belong in the public alumni directory.
              </p>
            </MotionDiv>

            <MotionDiv
              className="relative overflow-hidden rounded-md bg-slate-950 p-5 text-white shadow-lg shadow-indigo-950/10 sm:p-6"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute inset-x-0 top-0 grid h-1 grid-cols-3" aria-hidden="true">
                <div className="bg-red-600"></div>
                <div className="bg-white"></div>
                <div className="bg-indigo-500"></div>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">
                    Verification Record
                  </p>
                  <h3 className="mt-2 text-xl font-black leading-tight sm:text-2xl">
                    Only approved graduates enter the directory.
                  </h3>
                </div>
                <div className="rounded-md bg-red-500/12 p-2 text-red-200">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>

              <div className="mt-6 space-y-3 border-t border-white/12 pt-5">
                {[
                  "Identity checked",
                  "Credential reviewed",
                  "Public fields approved",
                ].map((item) => (
                  <div key={item} className="flex gap-3">
                    <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/18 text-indigo-100">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <p className="text-sm font-semibold leading-6 text-white/78">{item}</p>
                  </div>
                ))}
              </div>
            </MotionDiv>
          </div>
        </div>
      </section>
      {/* ================= HOW IT WORKS ================= */}
      <section className="relative overflow-hidden bg-slate-50 py-14 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <MotionDiv
            className="mb-9 max-w-3xl lg:mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-red-600">
              <span className="h-px w-8 bg-red-600" aria-hidden="true"></span>
              Verification Procedure
            </div>

            <h2 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
              A clear path from application to recognition.
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Four steps, one controlled journey. Each stage moves the graduate
              closer to a verified public profile.
            </p>
          </MotionDiv>

          <MotionDiv
            className="relative mx-auto hidden min-h-[430px] max-w-7xl lg:block"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <svg
              className="absolute inset-0 h-full w-full overflow-visible"
              viewBox="0 0 1120 430"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="journeyDesktopGradient" x1="80" y1="250" x2="1092" y2="250">
                  <stop stopColor="#dc2626" />
                  <stop offset="0.52" stopColor="#4f46e5" />
                  <stop offset="1" stopColor="#0369a1" />
                </linearGradient>
              </defs>

              <path
                d="M80 292C175 105 285 58 365 125C465 210 525 360 650 282C765 198 830 74 970 135C1025 160 1068 207 1092 252"
                fill="none"
                stroke="#e2e8f0"
                strokeLinecap="round"
                strokeWidth="13"
              />
              <MotionPath
                d="M80 292C175 105 285 58 365 125C465 210 525 360 650 282C765 198 830 74 970 135C1025 160 1068 207 1092 252"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, ease: "easeInOut" }}
                stroke="url(#journeyDesktopGradient)"
                strokeLinecap="round"
                strokeWidth="5"
              />

              {PROCESS_STEPS.map((item) => (
                <g key={item.step}>
                  <circle cx={item.node.x} cy={item.node.y} r="14" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
                  <circle cx={item.node.x} cy={item.node.y} r="6" fill={item.nodeColor} />
                </g>
              ))}
            </svg>

            {PROCESS_STEPS.map((item) => (
              <JourneyStep
                key={item.step}
                item={item}
                className="absolute w-[224px] xl:w-[244px]"
                style={item.desktop}
              />
            ))}
          </MotionDiv>

          <MotionDiv
            ref={mobileJourneyRef}
            className="relative lg:hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
            }}
          >
            <svg
              className="absolute left-2 top-0 h-full w-12 overflow-visible"
              viewBox="0 0 64 640"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="journeyMobileGradient" x1="32" y1="0" x2="32" y2="640">
                  <stop stopColor="#dc2626" />
                  <stop offset="0.56" stopColor="#4f46e5" />
                  <stop offset="1" stopColor="#0369a1" />
                </linearGradient>
              </defs>
              <path
                d="M36 8C8 106 58 166 31 248C9 320 57 400 30 493C23 545 35 594 43 632"
                fill="none"
                stroke="#e2e8f0"
                strokeLinecap="round"
                strokeWidth="9"
              />
              <MotionPath
                d="M36 8C8 106 58 166 31 248C9 320 57 400 30 493C23 545 35 594 43 632"
                fill="none"
                style={{ pathLength: mobileJourneyDraw }}
                stroke="url(#journeyMobileGradient)"
                strokeLinecap="round"
                strokeWidth="4"
              />
            </svg>

            <MotionDiv
              className="pointer-events-none absolute left-[27px] z-10 h-4 w-4 rounded-full bg-white shadow-lg shadow-red-600/20 ring-4 ring-red-100"
              style={{
                top: mobileTrackerTop,
                x: mobileTrackerX,
                opacity: mobileTrackerOpacity,
              }}
              aria-hidden="true"
            >
              <span className="absolute inset-1 rounded-full bg-red-600"></span>
            </MotionDiv>

            <div className="space-y-4 pl-14">
              {PROCESS_STEPS.map((item, idx) => (
                <JourneyStep key={item.step} item={item} compact index={idx} />
              ))}
            </div>
          </MotionDiv>
        </div>
      </section>
      {/* --- Graduate Showcase Slider --- */}
      {graduates.length > 0 && (
        <section className="py-16 sm:py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-6">
            <MotionDiv
              className="mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="h-1 w-16 bg-indigo-600 mb-6"></div>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-gray-900 mb-4">
                Featured Alumni
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl">
                Meet our verified graduates making a difference in their fields.
              </p>
            </MotionDiv>

            <div className="relative">
              <AnimatePresence mode="wait">
                <MotionDiv
                  key={currentGraduate}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-gray-50 overflow-hidden"
                >
                  <div className="grid lg:grid-cols-5 gap-0">
                    <div className="lg:col-span-2 relative">
                      {graduates[currentGraduate].photo_url && (
                        <img
                          src={getFileUrl(graduates[currentGraduate].photo_url)}
                          alt={graduates[currentGraduate].name}
                          className="w-full h-full min-h-[280px] sm:min-h-[400px] lg:min-h-[500px] object-cover"
                        />
                      )}
                    </div>
                    <div className="lg:col-span-3 p-6 sm:p-12 lg:p-16 flex flex-col justify-center">
                      <div className="h-1 w-12 bg-indigo-300 mb-8"></div>
                      <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
                        {graduates[currentGraduate].name}
                      </h3>
                      <p className="text-indigo-600 font-bold text-lg sm:text-xl mb-8 uppercase tracking-wider">
                        {graduates[currentGraduate].degree_type}
                      </p>

                      <div className="space-y-3 mb-8 text-gray-600">
                        <p className="text-lg">
                          <span className="font-bold text-gray-900">
                            Department:
                          </span>{" "}
                          {graduates[currentGraduate].department}
                        </p>
                        <p className="text-lg">
                          <span className="font-bold text-gray-900">
                            University:
                          </span>{" "}
                          {graduates[currentGraduate].university}
                        </p>
                      </div>

                      {graduates[currentGraduate].featured_story && (
                        <p className="text-gray-700 leading-relaxed text-lg mb-6">
                          {graduates[currentGraduate].featured_story}
                        </p>
                      )}
                      {graduates[currentGraduate].bio && (
                        <p className="text-gray-600 leading-relaxed">
                          {graduates[currentGraduate].bio}
                        </p>
                      )}
                    </div>
                  </div>
                </MotionDiv>
              </AnimatePresence>

              {/* Navigation Dots */}
              <div className="flex justify-center gap-3 mt-12">
                {graduates.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentGraduate(idx)}
                    className={`h-2 transition-all ${idx === currentGraduate ? "bg-indigo-600 w-12" : "bg-gray-300 w-2"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- Featured Universities Section (Admin-Managed) --- */}
      <FeaturedUniversitiesSection />

      {/* --- Verification Guidelines & Clarifications --- */}
      <section id="verification-guidelines" className="relative overflow-hidden bg-slate-50 py-14 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] lg:gap-12">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">
                <span className="h-px w-8 bg-indigo-700" aria-hidden="true"></span>
                Guidelines
              </div>

              <h2 className="max-w-xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Read this before verification.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Short answers for the questions graduates ask most before
                submitting documents or checking application status.
              </p>

              <div className="mt-7 border-l-4 border-red-600 pl-4">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                  Official guidance
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Updated from published admin FAQs when available.
                </p>
              </div>
            </MotionDiv>

            <MotionDiv
              className="space-y-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
              }}
            >
              {guidelineItems.map((item, idx) => (
                <FAQItem
                  key={item.id ?? idx}
                  question={item.question}
                  answer={item.answer}
                />
              ))}
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* --- Verification Call To Action --- */}
      <section className="relative overflow-hidden bg-slate-950 py-12 text-white sm:py-14 lg:py-16">
        <div className="absolute inset-x-0 top-0 grid h-1 grid-cols-3" aria-hidden="true">
          <div className="bg-red-600"></div>
          <div className="bg-white"></div>
          <div className="bg-indigo-500"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6">
          <MotionDiv
            className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">
                <BadgeCheck className="h-4 w-4 text-red-300" aria-hidden="true" />
                Ready for review
              </div>

              <h2 className="text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
                Start verification when your documents are ready.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
                Submit your academic credentials for admin review and directory approval.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
              >
                Begin verification
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <Link
                to="/directory"
                className="inline-flex items-center justify-center rounded-md border border-white/20 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-white/45 hover:bg-white/10"
              >
                Search directory
              </Link>
            </div>
          </MotionDiv>
        </div>
      </section>

      {/* --- Verification Office Contact Section --- */}
      <section className="bg-white py-14 sm:py-16 lg:py-24">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] lg:gap-12">
            <MotionDiv
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
            >
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-red-600">
                <span className="h-px w-8 bg-red-600" aria-hidden="true"></span>
                Contact
              </div>

              <h2 className="max-w-xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Reach the verification office.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Use this channel for application status, document clarification,
                or formal alumni verification questions.
              </p>

              <div className="mt-8 space-y-3">
                <ContactInfoRow
                  icon={Mail}
                  label="Official email"
                  value={BRAND.contactEmail}
                />
                <ContactInfoRow
                  icon={Clock}
                  label="Processing window"
                  value="2–5 business days"
                />
                <ContactInfoRow
                  icon={Shield}
                  label="Assistance scope"
                  value="Verification, document review, and recognition matters."
                />
              </div>
            </MotionDiv>

            <MotionForm
              className="rounded-md border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-6 lg:p-8"
              onSubmit={handleContactSubmit}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.08 }}
            >
              <div className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-indigo-700" aria-hidden="true" />
                Replies go to the email address submitted here.
              </div>

              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField label="Full legal name" htmlFor="contact-name">
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="As it appears on your degree"
                      className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-600"
                      value={contactForm.name}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, name: e.target.value })
                      }
                      required
                    />
                  </FormField>

                  <FormField label="Email address" htmlFor="contact-email">
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="you@example.com"
                      className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-600"
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, email: e.target.value })
                      }
                      required
                    />
                  </FormField>
                </div>

                <FormField label="Subject of inquiry" htmlFor="contact-subject">
                  <input
                    id="contact-subject"
                    type="text"
                    placeholder="Verification status, document resubmission"
                    className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-600"
                    value={contactForm.subject}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, subject: e.target.value })
                    }
                    required
                  />
                </FormField>

                <FormField label="Message" htmlFor="contact-message">
                  <textarea
                    id="contact-message"
                    rows="5"
                    placeholder="Provide the key details for your inquiry."
                    className="min-h-[140px] w-full resize-y rounded-md border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-600"
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, message: e.target.value })
                    }
                    required
                  />
                </FormField>

                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    disabled={contactSubmitting}
                    className="inline-flex w-full items-center justify-center rounded-md bg-indigo-700 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {contactSubmitting ? "Submitting…" : "Submit inquiry"}
                  </button>
                  <p className="text-xs leading-5 text-slate-500">
                    Information is used only for verification correspondence.
                  </p>
                </div>
              </div>
            </MotionForm>
          </div>
        </div>
      </section>
    </div>
  );
};

// Helper Components
const ContactInfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
    <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-white text-indigo-700 shadow-sm">
      {createElement(Icon, {
        className: "h-4 w-4",
        "aria-hidden": "true",
      })}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm leading-6 text-slate-700">
        {value}
      </p>
    </div>
  </div>
);

const FormField = ({ label, htmlFor, children }) => (
  <div>
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-600"
    >
      {label}
    </label>
    {children}
  </div>
);

const STAT_TONES = {
  red: {
    accent: "bg-red-600",
    icon: "bg-red-50 text-red-600",
    hover: "hover:border-red-200",
    number: "group-hover:text-red-600",
  },
  indigo: {
    accent: "bg-indigo-700",
    icon: "bg-indigo-50 text-indigo-700",
    hover: "hover:border-indigo-200",
    number: "group-hover:text-indigo-700",
  },
  blue: {
    accent: "bg-sky-600",
    icon: "bg-sky-50 text-sky-700",
    hover: "hover:border-sky-200",
    number: "group-hover:text-sky-700",
  },
  slate: {
    accent: "bg-slate-900",
    icon: "bg-slate-100 text-slate-800",
    hover: "hover:border-slate-300",
    number: "group-hover:text-slate-900",
  },
};

const StatItem = ({
  icon: Icon,
  number,
  label,
  detail,
  eyebrow = "Live",
  tone = "indigo",
}) => {
  const toneClasses = STAT_TONES[tone] || STAT_TONES.indigo;

  return (
    <MotionDiv
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className={`group relative min-h-[150px] overflow-hidden rounded-md border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:min-h-[172px] sm:p-5 ${toneClasses.hover}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${toneClasses.accent}`} aria-hidden="true"></div>

      <div className="flex h-full flex-col justify-between gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-md ${toneClasses.icon}`}>
            {createElement(Icon, {
              className: "h-5 w-5",
              "aria-hidden": "true",
            })}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {eyebrow}
          </span>
        </div>

        <div>
          <div
            className={`mb-2 inline-block origin-left text-3xl font-black leading-none text-slate-950 transition-[transform,color,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:-translate-y-0.5 group-hover:scale-[1.045] group-hover:drop-shadow-sm sm:text-4xl lg:text-5xl ${toneClasses.number}`}
          >
            {number}
          </div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-700 sm:text-[13px]">
            {label}
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
            {detail}
          </p>
        </div>
      </div>
    </MotionDiv>
  );
};

const JOURNEY_TONES = {
  red: {
    bar: "bg-red-600",
    icon: "bg-red-50 text-red-600",
    step: "text-red-600",
    hover: "hover:border-red-200",
  },
  indigo: {
    bar: "bg-indigo-700",
    icon: "bg-indigo-50 text-indigo-700",
    step: "text-indigo-700",
    hover: "hover:border-indigo-200",
  },
  blue: {
    bar: "bg-sky-600",
    icon: "bg-sky-50 text-sky-700",
    step: "text-sky-700",
    hover: "hover:border-sky-200",
  },
  slate: {
    bar: "bg-slate-900",
    icon: "bg-slate-100 text-slate-800",
    step: "text-slate-900",
    hover: "hover:border-slate-300",
  },
};

const JourneyStep = ({
  item,
  compact = false,
  className = "",
  style,
  index = 0,
}) => {
  const toneClasses = JOURNEY_TONES[item.tone] || JOURNEY_TONES.indigo;
  const entryDirection = index % 2 === 0 ? -14 : 14;

  return (
    <MotionDiv
      style={style}
      initial={{
        opacity: 0,
        x: compact ? entryDirection : 0,
        y: compact ? 18 : 14,
        scale: compact ? 0.98 : 1,
      }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: !compact, amount: compact ? 0.45 : 0.2 }}
      transition={{
        duration: compact ? 0.55 : 0.45,
        delay: compact ? index * 0.03 : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`group relative overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition-[transform,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-md ${compact ? "p-4" : "p-4 xl:p-5"} ${toneClasses.hover} ${className}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${toneClasses.bar}`} aria-hidden="true"></div>

      <div className="flex gap-3">
        <div className={`mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md ${toneClasses.icon}`}>
          {createElement(item.icon, {
            className: "h-5 w-5",
            "aria-hidden": "true",
          })}
        </div>

        <div className="min-w-0">
          <p className={`text-xs font-black uppercase tracking-[0.18em] ${toneClasses.step}`}>
            Step {item.step}
          </p>
          <h3 className="mt-1 text-base font-black leading-tight text-slate-950">
            {item.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {item.desc}
          </p>
        </div>
      </div>
    </MotionDiv>
  );
};
const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <MotionDiv
      variants={{
        hidden: { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0 },
      }}
      className={`overflow-hidden rounded-md border bg-white transition-[border-color,box-shadow] duration-300 ${
        open ? "border-indigo-200 shadow-sm" : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5 sm:py-5"
      >
        <span className="text-sm font-black leading-6 text-slate-950 sm:text-base">{question}</span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${
            open ? "rotate-180 text-red-600" : "text-slate-400"
          }`}
          aria-hidden="true"
        />
      </button>

      <MotionDiv
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="border-t border-slate-100 px-4 pb-5 pt-4 text-sm leading-6 text-slate-600 sm:px-5">
          {answer}
        </div>
      </MotionDiv>
    </MotionDiv>
  );
};

export default Home;
