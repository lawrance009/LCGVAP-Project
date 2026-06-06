import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import getFileUrl from '../utils/getFileUrl';
import api from '../services/api';
import FeaturedUniversitiesSection from '../components/FeaturedUniversitiesSection';

// Fallback FAQs shown only when the admin has not published any yet.
const DEFAULT_FAQS = [
    {
        question: "What documents are required for alumni verification?",
        answer: "Applicants must submit an official degree certificate and valid government-issued identification. Additional documentation may be requested if institutional confirmation is required."
    },
    {
        question: "How long does the verification process take?",
        answer: "Verification timelines depend on documentation completeness and institutional validation procedures. Applicants are notified electronically once a decision has been made."
    },
    {
        question: "How is personal identity information protected?",
        answer: "Identity information, including passport details and date of birth, is securely stored and used strictly for verification purposes. Access is restricted to authorized administrative personnel."
    },
    {
        question: "What does verified alumni status provide?",
        answer: "Verified status confirms institutional graduation and grants access to official alumni recognition within the portal and associated network privileges."
    },
    {
        question: "Can an application be resubmitted if rejected?",
        answer: "Yes. Applicants may resubmit documentation if prior submissions were incomplete or insufficient. Updated documentation must meet verification requirements."
    }
];

const Home = () => {
    const [slides, setSlides] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [graduates, setGraduates] = useState([]);
    const [currentGraduate, setCurrentGraduate] = useState(0);
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ verified: null, universities: null, departments: null });
    const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [contactSubmitting, setContactSubmitting] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            // allSettled so one failing endpoint never blanks the whole page.
            const [slidesRes, graduatesRes, faqsRes, statsRes] = await Promise.allSettled([
                api.get('/slides/public'),
                api.get('/graduates-showcase/featured'),
                api.get('/faq/published'),
                api.get('/users/stats/public')
            ]);

            if (slidesRes.status === 'fulfilled') setSlides(slidesRes.value.data || []);
            if (graduatesRes.status === 'fulfilled') setGraduates(graduatesRes.value.data || []);
            if (faqsRes.status === 'fulfilled') setFaqs(faqsRes.value.data || []);
            if (statsRes.status === 'fulfilled') setStats(statsRes.value.data || {});

            setLoading(false);
        };

        fetchAllData();
    }, []);

    // Auto-advance slides
    useEffect(() => {
        if (slides.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

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

    // Fallback static slide if no slides exist
    const heroContent = slides.length > 0 ? slides[currentSlide] : {
        title: "Verified Graduates",
        subtitle: "Veterans & Alumni",
        description: "The official Liberian Cyprus Graduates Veteran Alumni Portal. Ensuring institutional integrity and preserving academic identity through secure verification.",
        image_url: null
    };

    // Handle Verification Office contact submission
    const handleContactSubmit = async (e) => {
        e.preventDefault();

        const { name, email, subject, message } = contactForm;
        if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing information',
                text: 'Please complete all fields before submitting.',
                confirmButtonColor: '#4f46e5'
            });
            return;
        }

        setContactSubmitting(true);
        try {
            await api.post('/faq/submit', {
                question: `[Contact Inquiry] ${subject}\n\nFrom: ${name}\n\n${message}`,
                category: 'Contact',
                submitted_by_email: email
            });
            Swal.fire({
                icon: 'success',
                title: 'Inquiry submitted',
                text: 'Our verification office will respond within 2–5 business days.',
                confirmButtonColor: '#4f46e5'
            });
            setContactForm({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error('Error submitting inquiry:', error);
            Swal.fire({
                icon: 'error',
                title: 'Submission failed',
                text: 'Something went wrong. Please try again later.',
                confirmButtonColor: '#4f46e5'
            });
        } finally {
            setContactSubmitting(false);
        }
    };



    return (
        <div className="overflow-hidden bg-white relative" style={{
            backgroundImage: `linear-gradient(rgba(229, 231, 235, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(229, 231, 235, 0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}>

            {/* ================= TOP INSTITUTIONAL BANNER ================= */}
            <motion.div
                className="bg-indigo-600 text-white py-3 px-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                <div className="container mx-auto flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm tracking-wider font-medium">
                    <span className="flex-shrink-0">🇱🇷</span>
                    <span className="uppercase text-center">Official Liberian Cyprus Graduates Alumni Portal</span>
                    <span className="flex-shrink-0">🇨🇾</span>
                </div>
            </motion.div>

            {/* ================= HERO SECTION ================= */}
            <section className="relative bg-white">
                <div className="container mx-auto px-6 py-16 sm:py-24 lg:py-32 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* LEFT CONTENT */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Badge */}
                        <motion.div 
                            className="inline-flex items-center gap-2 mb-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="h-px w-8 bg-indigo-600"></div>
                            <span className="text-xs font-bold tracking-[0.2em] text-indigo-600 uppercase">
                                Government-Grade Verification
                            </span>
                        </motion.div>

                        {/* Heading */}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-8">
                            Verified<br/>
                            Graduates.
                        </h1>

                        <div className="h-1 w-24 bg-indigo-600 mb-8"></div>

                        {/* Description */}
                        <p className="text-xl text-gray-600 leading-relaxed mb-12 max-w-lg">
                            Secure verification system protecting academic identity and institutional integrity for all alumni.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/register"
                                className="px-10 py-5 bg-indigo-600 !text-white font-bold text-sm tracking-wide uppercase hover:bg-indigo-700 transition-all duration-200"
                            >
                                Get Verified
                            </Link>

                            <Link
                                to="/directory"
                                className="px-10 py-5 border-2 border-gray-900 text-gray-900 font-bold text-sm tracking-wide uppercase hover:bg-gray-900 hover:text-white transition-all duration-200"
                            >
                                Explore Directory
                            </Link>
                        </div>
                    </motion.div>

                    {/* RIGHT IMAGE */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="relative"
                    >
                        <div className="relative aspect-[4/3] overflow-hidden">
                            {/* If No Slides From Admin */}
                            {slides.length === 0 && (
                                <img
                                    src="/hero-image.jpg"
                                    alt="LCGVAP Graduates"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80";
                                    }}
                                />
                            )}

                            {/* If Slides Exist */}
                            {slides.length > 0 && slides[currentSlide]?.image_url && (
                                <img
                                    src={getFileUrl(slides[currentSlide].image_url)}
                                    alt={slides[currentSlide].title || "LCGVAP Slide"}
                                    className="w-full h-full object-cover transition-opacity duration-700"
                                />
                            )}
                        </div>

                        {/* Accent Element */}
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-cyan-400 -z-10"></div>
                    </motion.div>

                </div>
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
                            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                        }}
                    >
                        <StatItem number={stats.verified != null ? stats.verified.toLocaleString() : '—'} label="Graduates" />
                        <StatItem number={stats.universities != null ? stats.universities.toLocaleString() : '—'} label="Universities" />
                        <StatItem number={stats.departments != null ? stats.departments.toLocaleString() : '—'} label="Departments" />
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

                            <p className="text-xl text-gray-600 leading-relaxed mb-12">
                                Institutional integrity is paramount. LCGVAP provides a secure, immutable record of academic achievement for all graduates.
                            </p>

                            {/* Credibility Stats */}
                            <div className="grid grid-cols-2 gap-6 sm:gap-12">
                                <div className="border-l-4 border-indigo-600 pl-4 sm:pl-6">
                                    <h4 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-2">100%</h4>
                                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">
                                        Verified Records
                                    </p>
                                </div>

                                <div className="border-l-4 border-cyan-400 pl-4 sm:pl-6">
                                    <h4 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-2">Secure</h4>
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
                                icon="🛡️"
                                title="Institutional Integrity"
                                desc="Directly connected to university databases ensuring authenticated records and verified credentials."
                            />

                            <FeatureCard
                                icon="🔒"
                                title="Secure Identity"
                                desc="Passport and DOB anchored identity prevents fraud and impersonation."
                            />

                            <FeatureCard
                                icon="🚀"
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
                            A structured workflow ensuring authenticity, compliance, and institutional record integrity.
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
                                transition: { staggerChildren: 0.1 }
                            }
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
                            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-gray-900 mb-4">Featured Alumni</h2>
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
                                            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-4">{graduates[currentGraduate].name}</h3>
                                            <p className="text-indigo-600 font-bold text-lg sm:text-xl mb-8 uppercase tracking-wider">{graduates[currentGraduate].degree_type}</p>
                                            
                                            <div className="space-y-3 mb-8 text-gray-600">
                                                <p className="text-lg"><span className="font-bold text-gray-900">Department:</span> {graduates[currentGraduate].department}</p>
                                                <p className="text-lg"><span className="font-bold text-gray-900">University:</span> {graduates[currentGraduate].university}</p>
                                            </div>

                                            {graduates[currentGraduate].featured_story && (
                                                <p className="text-gray-700 leading-relaxed text-lg mb-6">{graduates[currentGraduate].featured_story}</p>
                                            )}
                                            {graduates[currentGraduate].bio && (
                                                <p className="text-gray-600 leading-relaxed">{graduates[currentGraduate].bio}</p>
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
                                        className={`h-2 transition-all ${idx === currentGraduate ? 'bg-indigo-600 w-12' : 'bg-gray-300 w-2'}`}
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
                            Official guidance regarding alumni verification, identity validation, and institutional recognition.
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
                                Submit your academic credentials for official review and institutional recognition within the portal.
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
                                    {stats.verified != null ? stats.verified.toLocaleString() : '—'}
                                </p>
                                <p className="text-xl text-gray-400 uppercase tracking-wider font-bold">Verified Graduates</p>
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
                            For formal inquiries related to alumni verification, credential confirmation, or application status.
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-6 sm:gap-12 lg:gap-16">

                        {/* Office Information */}
                        <div className="bg-gray-50 p-4 sm:p-10 lg:p-12 rounded-xl sm:rounded-none">
                            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-6 sm:mb-10 uppercase tracking-wider">
                                Office Information
                            </h3>

                            <div className="space-y-5 sm:space-y-8 text-gray-600">
                                <div>
                                    <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Official Email</p>
                                    <p className="text-base sm:text-lg break-all">lcgvapliberiancyprusgraduatesv@gmail.com</p>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Processing Window</p>
                                    <p className="text-base sm:text-lg">2–5 Business Days</p>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Scope of Assistance</p>
                                    <p className="text-base sm:text-lg">Alumni verification, document review clarification, and institutional recognition matters only.</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <form className="space-y-4 sm:space-y-6" onSubmit={handleContactSubmit}>
                            <input
                                type="text"
                                placeholder="Full Legal Name"
                                className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base border-2 border-gray-200 focus:outline-none focus:border-indigo-600 transition-colors"
                                value={contactForm.name}
                                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                required
                            />

                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base border-2 border-gray-200 focus:outline-none focus:border-indigo-600 transition-colors"
                                value={contactForm.email}
                                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                required
                            />

                            <input
                                type="text"
                                placeholder="Subject of Inquiry"
                                className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base border-2 border-gray-200 focus:outline-none focus:border-indigo-600 transition-colors"
                                value={contactForm.subject}
                                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                                required
                            />

                            <textarea
                                rows="6"
                                placeholder="Provide detailed information regarding your inquiry."
                                className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base border-2 border-gray-200 focus:outline-none focus:border-indigo-600 transition-colors resize-y min-h-[160px] sm:min-h-[200px]"
                                value={contactForm.message}
                                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                required
                            />

                            <button
                                type="submit"
                                disabled={contactSubmitting}
                                className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-indigo-600 text-white font-bold text-xs sm:text-sm tracking-wide uppercase hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {contactSubmitting ? 'Submitting…' : 'Submit Inquiry'}
                            </button>
                        </form>

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
            visible: { opacity: 1, y: 0 }
        }}
        className="text-center bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 hover:bg-indigo-600 hover:text-white transition-colors duration-300 group"
    >
        <div className="text-3xl sm:text-4xl lg:text-6xl font-black text-gray-900 group-hover:text-white mb-3">
            {number}
        </div>
        <div className="text-xs font-bold text-gray-600 group-hover:text-white uppercase tracking-[0.2em]">{label}</div>
    </motion.div>
);

const FeatureCard = ({ icon, title, desc }) => (
    <motion.div
        className="bg-gray-50 p-6 sm:p-10 border-l-4 border-indigo-600 hover:bg-indigo-600 hover:border-cyan-400 group transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
    >
        <div className="text-3xl mb-6 group-hover:scale-110 transition-transform">{icon}</div>
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
            visible: { opacity: 1, y: 0 }
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
                <span className="font-bold text-gray-900 text-lg">
                    {question}
                </span>
                <span className="text-indigo-600 text-2xl font-black flex-shrink-0">
                    {open ? '−' : '+'}
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
