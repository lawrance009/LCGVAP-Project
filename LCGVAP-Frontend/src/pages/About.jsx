import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BRAND } from '../constants/branding';

const objectives = [
  'Centralize and maintain verified records of Liberian graduates from Cyprus.',
  'Promote professional networking and employment opportunities.',
  'Support academic integrity through credential verification.',
  'Preserve the history and achievements of the alumni community.',
  'Strengthen communication and collaboration among members worldwide.',
];

const About = () => (
  <div
    className="bg-white min-h-screen pb-24 relative"
    style={{
      backgroundImage: `linear-gradient(rgba(229, 231, 235, 0.3) 1px, transparent 1px),
                       linear-gradient(90deg, rgba(229, 231, 235, 0.3) 1px, transparent 1px)`,
      backgroundSize: '40px 40px',
    }}
  >
    {/* Hero */}
    <section className="py-16 sm:py-24 lg:py-32 px-6 bg-white border-b-2 border-gray-100">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 mb-6 text-xs font-bold tracking-[0.2em] text-indigo-600 uppercase">
            <span>🇱🇷</span>
            <span>About Us</span>
            <span>🇨🇾</span>
          </div>
          <div className="h-1 w-16 bg-indigo-600 mb-6" />
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-gray-900 mb-8 leading-tight">
            About Us
          </h1>

          {/* VCLGC definition — primary identity */}
          <div className="bg-indigo-50 border-l-4 border-indigo-600 px-6 py-5 sm:px-8 sm:py-6 mb-8 max-w-4xl">
            <p className="text-lg sm:text-xl font-black text-gray-900 leading-snug">
              <span className="text-indigo-600">{BRAND.shortName}</span>
              {' = '}
              {BRAND.fullName}
              <span className="text-gray-600 font-bold"> (the community)</span>
            </p>
          </div>

          <p className="text-base sm:text-lg text-gray-500 font-semibold">
            {BRAND.portalName}
          </p>
        </motion.div>
      </div>
    </section>

    {/* About Us — main copy */}
    <section className="py-16 sm:py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="space-y-6 text-gray-600 text-lg leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p>
            The <strong className="text-gray-900">{BRAND.portalName}</strong> is
            the official digital platform of the <strong className="text-gray-900">{BRAND.fullName} ({BRAND.shortName})</strong>.
            Established to unite, recognize, and empower Liberian graduates who pursued higher education in
            Northern Cyprus, the portal serves as a central hub for alumni engagement, professional networking,
            and academic verification.
          </p>
          <p>
            Our community represents a network of resilient and accomplished individuals who have contributed
            to various sectors both in Liberia and across the world. Through this platform, we aim to preserve
            our collective legacy, strengthen connections among members, and create opportunities for
            collaboration, mentorship, and career advancement.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Mission & Vision */}
    <section className="py-16 sm:py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12">
        <motion.div
          className="bg-white p-8 sm:p-10 border-l-4 border-indigo-600 shadow-sm"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600 mb-4">Our Mission</h2>
          <p className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
            To connect, document, and empower Liberian graduates from Cyprus by providing a secure and
            accessible platform that promotes professional growth, transparency, and community development.
          </p>
        </motion.div>

        <motion.div
          className="bg-white p-8 sm:p-10 border-l-4 border-cyan-500 shadow-sm"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-600 mb-4">Our Vision</h2>
          <p className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
            To build a strong, globally recognized alumni community that fosters excellence, integrity, and
            lifelong engagement among Liberian graduates from Cyprus.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Objectives */}
    <section className="py-16 sm:py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="h-1 w-16 bg-indigo-600 mb-6" />
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-10">Our Objectives</h2>

          <ul className="space-y-5">
            {objectives.map((item, i) => (
              <motion.li
                key={item}
                className="flex items-start gap-4 text-gray-700 text-lg leading-relaxed"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white font-black text-sm flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>

    {/* Closing statement */}
    <section className="py-16 sm:py-24 px-6 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="h-1 w-16 bg-indigo-400 mx-auto mb-8" />
          <p className="text-xl sm:text-2xl lg:text-3xl font-black leading-relaxed text-gray-100">
            The {BRAND.shortName} Alumni Portal is more than a directory—it is a living archive of our achievements,
            a platform for future opportunities, and a symbol of our shared identity as Liberian graduates
            from Cyprus.
          </p>
        </motion.div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 sm:py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6">
            Join the {BRAND.fullName}
          </h2>
          <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
            If you are a Liberian graduate from a university in Northern Cyprus, register today to become
            part of our verified alumni community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-10 py-5 bg-indigo-600 !text-white font-bold text-sm tracking-wide uppercase hover:bg-indigo-700 transition-all"
            >
              Begin Verification
            </Link>
            <Link
              to="/directory"
              className="px-10 py-5 border-2 border-gray-900 text-gray-900 font-bold text-sm tracking-wide uppercase hover:bg-gray-900 hover:text-white transition-all"
            >
              View Directory
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  </div>
);

export default About;
