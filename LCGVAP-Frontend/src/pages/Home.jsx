import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import getFileUrl from "../utils/getFileUrl";
import api from "../services/api";
import FeaturedUniversitiesSection from "../components/FeaturedUniversitiesSection";
import { BRAND } from "../constants/branding";
import {
  Mail,
  Clock,
  Shield,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Users,
} from "lucide-react";

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
    title: "One Network, Every Veteran.",
    subtitle:
      "Liberian graduates of Cyprus, united in one verified alumni community.",
    image_url:
      "https://images.unsplash.com/photo-1758272133693-d2124dbe00de?auto=format&fit=crop&w=1920&q=80",
  },
  {
    title: "Your Credentials, Secured.",
    subtitle:
      "Identity-anchored verification protects your record from fraud and misrepresentation.",
    image_url:
      "https://images.unsplash.com/photo-1725656469709-4d0bcb828bcf?auto=format&fit=crop&w=1920&q=80",
  },
];

const Home = () => {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [graduates, setGraduates] = useState([]);
  const [currentGraduate, setCurrentGraduate] = useState(0);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
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
      className="overflow-hidden bg-white relative"
      style={{
        backgroundImage: `linear-gradient(rgba(229, 231, 235, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(229, 231, 235, 0.3) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }}
    >
      {/* ================= HERO SECTION — 3-panel swipe slider ================= */}
      <section className="relative h-[620px] sm:h-[700px] lg:h-[800px] overflow-hidden bg-gray-900">
        <AnimatePresence mode="wait">
          <motion.div
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
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = FALLBACK_SLIDES[0].image_url;
              }}
            />

            {/* Dark overlay so text stays readable over any photo */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-transparent"></div>

            {/* Slide content */}
            <div className="relative h-full flex items-center">
              <div className="container mx-auto px-6 lg:px-12">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 mb-6">
                    <div className="h-px w-8 bg-cyan-400"></div>
                    <span className="text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase">
                      {BRAND.shortName} · {BRAND.portalSubtitle}
                    </span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-6">
                    {heroContent.title}
                  </h1>

                  {heroContent.subtitle && (
                    <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 leading-relaxed mb-10 max-w-xl">
                      {heroContent.subtitle}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      to="/register"
                      className="px-10 py-5 bg-indigo-600 !text-white font-bold text-sm tracking-wide uppercase hover:bg-indigo-700 transition-all duration-200"
                    >
                      Get Verified
                    </Link>

                    <Link
                      to="/directory"
                      className="px-10 py-5 border-2 border-white text-white font-bold text-sm tracking-wide uppercase hover:bg-white hover:text-gray-900 transition-all duration-200"
                    >
                      Explore Directory
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide indicators */}
        {slideCount > 1 && (
          <div className="absolute bottom-8 left-0 w-full flex justify-center gap-3 z-10">
            {Array.from({ length: slideCount }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Show slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide
                    ? "bg-white w-12"
                    : "bg-white/40 w-2 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </section>
      {/* --- Stats Section --- */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-1 bg-white"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
          >
            <StatItem
              number={
                stats.verified != null ? stats.verified.toLocaleString() : "—"
              }
              label="Graduates"
            />
            <StatItem
              number={
                stats.universities != null
                  ? stats.universities.toLocaleString()
                  : "—"
              }
              label="Universities"
            />
            <StatItem
              number={
                stats.departments != null
                  ? stats.departments.toLocaleString()
                  : "—"
              }
              label="Departments"
            />
            <StatItem number="100%" label="Verified" />
          </motion.div>
        </div>
      </section>

      {/* --- About / Why Verification --- */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            {/* ================= LEFT SIDE ================= */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="h-1 w-16 bg-indigo-600 mb-6"></div>

              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-gray-900 mb-8 leading-tight">
                Why Verification Matters
              </h2>

              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Institutional integrity is paramount. {BRAND.shortName} provides
                a secure, immutable record of academic achievement for all
                graduates.
              </p>

              <Link
                to="/about"
                className="inline-block px-8 py-4 border-2 border-indigo-600 text-indigo-600 font-bold text-sm uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-all mb-12"
              >
                Learn About {BRAND.shortName}
              </Link>

              {/* Credibility Stats */}
              <div className="grid grid-cols-2 gap-6 sm:gap-12">
                <div className="border-l-4 border-indigo-600 pl-4 sm:pl-6">
                  <h4 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-2">
                    100%
                  </h4>
                  <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">
                    Verified Records
                  </p>
                </div>

                <div className="border-l-4 border-cyan-400 pl-4 sm:pl-6">
                  <h4 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-2">
                    Secure
                  </h4>
                  <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">
                    Database Sync
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ================= RIGHT SIDE ================= */}
            <motion.div
              className="grid gap-6"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <FeatureCard
                icon={ShieldCheck}
                title="Institutional Integrity"
                desc="Directly connected to university databases ensuring authenticated records and verified credentials."
              />

              <FeatureCard
                icon={Lock}
                title="Secure Identity"
                desc="Passport and DOB anchored identity prevents fraud and impersonation."
              />

              <FeatureCard
                icon={Users}
                title="Alumni Network"
                desc="Connect with fellow graduates and access exclusive veteran opportunities."
              />
            </motion.div>
          </div>
        </div>
      </section>
      {/* ================= HOW IT WORKS ================= */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          {/* SECTION HEADER */}
          <motion.div
            className="mb-20 max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="h-px w-8 bg-indigo-600"></div>
              <span className="text-xs font-bold tracking-[0.2em] text-indigo-600 uppercase">
                Verification Procedure
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              How It Works
            </h2>

            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
              A structured workflow ensuring authenticity, compliance, and
              institutional record integrity.
            </p>
          </motion.div>

          {/* PROCESS GRID */}
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            <ProcessCard
              step="01"
              title="Create Account"
              desc="Register using your official email and provide foundational personal information."
            />

            <ProcessCard
              step="02"
              title="Submit Credentials"
              desc="Upload your academic certificate, identification documents, and supporting records."
            />

            <ProcessCard
              step="03"
              title="Identity Validation"
              desc="Administrative verification of passport details and date of birth for fraud prevention."
            />

            <ProcessCard
              step="04"
              title="Alumni Confirmation"
              desc="Receive verified alumni status with access to directory visibility and network privileges."
            />
          </motion.div>
        </div>
      </section>
      {/* --- Graduate Showcase Slider --- */}
      {graduates.length > 0 && (
        <section className="py-16 sm:py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
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
            </motion.div>

            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
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
                      <div className="h-1 w-12 bg-cyan-400 mb-8"></div>
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
                </motion.div>
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
      <section className="py-16 sm:py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-1 w-16 bg-indigo-600 mb-6"></div>
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Verification Guidelines
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
              Official guidance regarding alumni verification, identity
              validation, and institutional recognition.
            </p>
          </motion.div>

          <div className="space-y-2">
            {(faqs.length > 0 ? faqs : DEFAULT_FAQS).map((item, idx) => (
              <FAQItem
                key={item.id ?? idx}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </div>
      </section>

      {/* --- Verification Call To Action --- */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="h-1 w-16 bg-cyan-400 mb-8"></div>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-8 leading-tight">
                Begin Alumni Verification
              </h2>

              <p className="text-gray-400 text-xl leading-relaxed mb-12">
                Submit your academic credentials for official review and
                institutional recognition within the portal.
              </p>

              <Link
                to="/register"
                className="inline-block px-12 py-5 bg-white text-gray-900 font-bold text-sm tracking-wide uppercase hover:bg-gray-100 transition-all duration-200"
              >
                Proceed to Verification
              </Link>
            </motion.div>

            <motion.div
              className="lg:text-right"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="inline-block border-l-4 border-indigo-600 pl-8 text-left">
                <p className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-4">
                  {stats.verified != null
                    ? stats.verified.toLocaleString()
                    : "—"}
                </p>
                <p className="text-xl text-gray-400 uppercase tracking-wider font-bold">
                  Verified Graduates
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- Verification Office Contact Section --- */}
      <section className="py-12 sm:py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <motion.div
            className="mb-10 sm:mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-1 w-16 bg-indigo-600 mb-6"></div>
            <h2 className="text-2xl sm:text-4xl lg:text-6xl font-black text-gray-900 mb-3 sm:mb-4">
              Contact Verification Office
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-3xl">
              For formal inquiries related to alumni verification, credential
              confirmation, or application status.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-0 shadow-sm">
            {/* Office Information — dark official panel */}
            <motion.div
              className="lg:col-span-2 bg-gray-900 text-white p-6 sm:p-10 lg:p-12 rounded-t-xl sm:rounded-none relative overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-400"></div>

              <h3 className="text-lg sm:text-2xl font-black mb-8 sm:mb-12 uppercase tracking-wider">
                Office Information
              </h3>

              <div className="space-y-6 sm:space-y-8">
                <div className="flex gap-4 border-b border-gray-800 pb-6">
                  <Mail
                    className="w-5 h-5 text-cyan-400 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                      Official Email
                    </p>
                    <p className="text-sm sm:text-base text-gray-300 break-all">
                      {BRAND.contactEmail}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 border-b border-gray-800 pb-6">
                  <Clock
                    className="w-5 h-5 text-cyan-400 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                      Processing Window
                    </p>
                    <p className="text-sm sm:text-base text-gray-300">
                      2–5 Business Days
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Shield
                    className="w-5 h-5 text-cyan-400 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                      Scope of Assistance
                    </p>
                    <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                      Alumni verification, document review clarification, and
                      institutional recognition matters only.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 sm:mt-12 pt-6 border-t border-gray-800 flex items-center gap-2 text-xs text-gray-400">
                <CheckCircle2
                  className="w-4 h-4 text-cyan-400 shrink-0"
                  aria-hidden="true"
                />
                Replies are sent only to the email address you submit below.
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.form
              className="lg:col-span-3 bg-white border border-t-0 lg:border-t lg:border-l-0 border-gray-200 p-6 sm:p-10 lg:p-12 rounded-b-xl sm:rounded-none space-y-5"
              onSubmit={handleContactSubmit}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2"
                  >
                    Full Legal Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="As it appears on your degree"
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 text-base border-2 border-gray-200 focus:outline-none focus:border-indigo-600 transition-colors"
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 text-base border-2 border-gray-200 focus:outline-none focus:border-indigo-600 transition-colors"
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2"
                >
                  Subject of Inquiry
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  placeholder="e.g. Verification status, document resubmission"
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 text-base border-2 border-gray-200 focus:outline-none focus:border-indigo-600 transition-colors"
                  value={contactForm.subject}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, subject: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows="6"
                  placeholder="Provide detailed information regarding your inquiry."
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 text-base border-2 border-gray-200 focus:outline-none focus:border-indigo-600 transition-colors resize-y min-h-[140px] sm:min-h-[180px]"
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={contactSubmitting}
                  className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-indigo-600 text-white font-bold text-xs sm:text-sm tracking-wide uppercase hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {contactSubmitting ? "Submitting…" : "Submit Inquiry"}
                </button>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Your information is used solely for verification
                  correspondence — never shared or published.
                </p>
              </div>
            </motion.form>
          </div>
        </div>
      </section>
    </div>
  );
};

// Helper Components
const StatItem = ({ number, label }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
    className="text-center bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 hover:bg-indigo-600 hover:text-white transition-colors duration-300 group"
  >
    <div className="text-3xl sm:text-4xl lg:text-6xl font-black text-gray-900 group-hover:text-white mb-3">
      {number}
    </div>
    <div className="text-xs font-bold text-gray-600 group-hover:text-white uppercase tracking-[0.2em]">
      {label}
    </div>
  </motion.div>
);

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <motion.div
    className="bg-gray-50 p-6 sm:p-10 border-l-4 border-indigo-600 hover:bg-indigo-600 hover:border-cyan-400 group transition-all duration-300"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
  >
    <Icon
      className="w-9 h-9 text-indigo-600 group-hover:text-white mb-6 group-hover:scale-110 transition-all"
      aria-hidden="true"
    />
    <h3 className="font-black text-xl text-gray-900 group-hover:text-white mb-4 uppercase tracking-wider">
      {title}
    </h3>
    <p className="text-gray-600 group-hover:text-white/90 leading-relaxed">
      {desc}
    </p>
  </motion.div>
);
const ProcessCard = ({ step, title, desc }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
    className="bg-white p-8 hover:bg-gray-900 group transition-all duration-300"
  >
    {/* Step Number */}
    <div className="text-6xl font-black text-indigo-600 group-hover:text-cyan-400 mb-6 transition-colors">
      {step}
    </div>

    {/* Content */}
    <div className="h-1 w-12 bg-indigo-600 group-hover:bg-cyan-400 mb-6 transition-colors"></div>
    <h3 className="text-xl font-black text-gray-900 group-hover:text-white mb-4 uppercase tracking-wider">
      {title}
    </h3>
    <p className="text-gray-600 group-hover:text-gray-300 leading-relaxed">
      {desc}
    </p>
  </motion.div>
);
const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border-b-2 border-gray-100 overflow-hidden hover:bg-gray-50 transition-colors">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-5 sm:px-8 py-5 sm:py-6 flex justify-between items-center gap-4 sm:gap-8"
      >
        <span className="font-bold text-gray-900 text-lg">{question}</span>
        <span className="text-indigo-600 text-2xl font-black flex-shrink-0">
          {open ? "−" : "+"}
        </span>
      </button>

      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-5 sm:px-8 pb-5 sm:pb-6 text-gray-600 leading-relaxed text-base sm:text-lg">
          {answer}
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
