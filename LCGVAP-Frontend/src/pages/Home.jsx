import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import HeroSection from "./home/HeroSection";
import ProcessSection from "./home/ProcessSection";
import FeaturedGraduatesSection from "./home/FeaturedGraduatesSection";
import UniversitiesSection from "./home/UniversitiesSection";
import GuidelinesSection from "./home/GuidelinesSection";
import VerifyCallout from "./home/VerifyCallout";
import ContactSection from "./home/ContactSection";
import { DEFAULT_FAQS } from "./home/homeContent";

/**
 * Home page: owns data fetching and the contact form state.
 * Every section is presentational and lives in ./home/.
 */
const Home = () => {
  const [slides, setSlides] = useState([]);
  const [graduates, setGraduates] = useState([]);
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

  const guidelineItems = faqs.length > 0 ? faqs : DEFAULT_FAQS;

  // Handle Verification Office contact submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();

    const { name, email, subject, message } = contactForm;
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Some fields are empty",
        text: "Fill in your name, email address, subject and message, then send again.",
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
        title: "Message sent",
        text: "The verification office will reply within 2–5 business days.",
      });
      setContactForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      Swal.fire({
        icon: "error",
        title: "Message not sent",
        text: "The server could not be reached. Check your connection and send again.",
      });
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <>
      <HeroSection slides={slides} stats={stats} statsLoading={loading} />
      <ProcessSection />
      <FeaturedGraduatesSection graduates={graduates} />
      <UniversitiesSection />
      <GuidelinesSection items={guidelineItems} />
      <VerifyCallout />
      <ContactSection
        form={contactForm}
        onChange={setContactForm}
        onSubmit={handleContactSubmit}
        submitting={contactSubmitting}
      />
    </>
  );
};

export default Home;
