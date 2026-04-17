import { useRef, useState, type FormEvent } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import { toast } from "sonner";
import {
  Mail,
  Clock,
  Send,
  MessageSquare,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Animation helper                                                   */
/* ------------------------------------------------------------------ */

function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.7, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const initialForm: ContactForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof ContactForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("Please fill in all fields before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "management" }),
      });

      if (!res.ok) throw new Error("Request failed");

      toast.success("Message sent!", {
        description: "We'll get back to you as soon as possible.",
      });
      setForm(initialForm);
    } catch {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  }

  /* shared input classes */
  const inputBase =
    "w-full rounded-xl border border-[#0f1d2e]/10 bg-white px-4 py-3 text-[#0f1d2e] placeholder:text-[#0f1d2e]/30 outline-none transition-all focus:border-[#2e6da4] focus:ring-2 focus:ring-[#2e6da4]/20";

  return (
    <ManagementLayout>
      <div className="min-h-screen">
        {/* ======================== HERO ======================== */}
        <section className="relative min-h-[460px] md:min-h-[520px] flex items-center overflow-hidden">
          <img
            src="/images/hero/image3.jpg"
            alt="Equestrian yard"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070f1c]/88 via-[#0f1d2e]/80 to-[#0a1628]/92" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(26,122,109,0.16)_0%,_transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(46,109,164,0.10)_0%,_transparent_60%)] pointer-events-none" />

          <div className="relative z-10 container mx-auto px-4 pt-32 pb-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-[#c5a55a]/10 border border-[#c5a55a]/20 rounded-full px-4 py-1.5 text-sm font-bold text-[#c5a55a] tracking-widest uppercase mb-5">
                Contact
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-bold font-serif text-white leading-tight max-w-4xl mx-auto">
                Get in Touch
              </h1>
              <p className="mt-6 text-lg md:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed">
                Have a question, need a demo, or just want to say hello? We'd
                love to hear from you.
              </p>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8f9fb] to-transparent" />
        </section>

        {/* ================= FORM + SIDEBAR ================= */}
        <section className="bg-[#f8f9fb] py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-10 max-w-5xl mx-auto">
              {/* ---- FORM ---- */}
              <AnimatedSection className="lg:col-span-2">
                <div className="rounded-2xl border border-[#0f1d2e]/5 bg-white p-8 md:p-10 shadow-sm hover:shadow-xl hover:shadow-[#2e6da4]/5 transition-shadow duration-300">
                  <h2 className="text-2xl font-bold font-serif text-[#0f1d2e] mb-1">
                    Send us a message
                  </h2>
                  <p className="text-sm text-[#0f1d2e]/45 mb-8">
                    Fill in the form below and we'll respond within one business
                    day.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="block text-sm font-semibold text-[#0f1d2e]/70 mb-1.5"
                        >
                          Name
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          placeholder="Your full name"
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          className={inputBase}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="contact-email"
                          className="block text-sm font-semibold text-[#0f1d2e]/70 mb-1.5"
                        >
                          Email
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => update("email", e.target.value)}
                          className={inputBase}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-subject"
                        className="block text-sm font-semibold text-[#0f1d2e]/70 mb-1.5"
                      >
                        Subject
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        placeholder="What's this about?"
                        value={form.subject}
                        onChange={(e) => update("subject", e.target.value)}
                        className={inputBase}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-message"
                        className="block text-sm font-semibold text-[#0f1d2e]/70 mb-1.5"
                      >
                        Message
                      </label>
                      <textarea
                        id="contact-message"
                        rows={6}
                        placeholder="Tell us how we can help…"
                        value={form.message}
                        onChange={(e) => update("message", e.target.value)}
                        className={`${inputBase} resize-none`}
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={submitting}
                      className="bg-[#2e6da4] hover:bg-[#256091] text-white font-bold rounded-full px-8 h-12 shadow-lg shadow-[#2e6da4]/20 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </AnimatedSection>

              {/* ---- SIDEBAR ---- */}
              <AnimatedSection delay={0.15}>
                <div className="space-y-6">
                  {/* WhatsApp card */}
                  <div className="rounded-2xl border border-[#0f1d2e]/5 bg-white p-7 shadow-sm hover:shadow-xl hover:shadow-[#25D366]/5 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl mb-4 shadow-md" style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <h3 className="text-base font-bold font-serif text-[#0f1d2e] mb-1">
                      WhatsApp
                    </h3>
                    <p className="text-sm text-[#0f1d2e]/45 mb-3">
                      Priority support customers can reach us directly:
                    </p>
                    <a
                      href="https://wa.me/447347258089"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#25D366] font-semibold hover:underline text-sm"
                    >
                      +44 7347 258089
                    </a>
                  </div>

                  {/* Email card */}
                  <div className="rounded-2xl border border-[#0f1d2e]/5 bg-white p-7 shadow-sm hover:shadow-xl hover:shadow-[#2e6da4]/5 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#2e6da4] to-[#4a9eca] text-white mb-4 shadow-md shadow-[#2e6da4]/15">
                      <Mail className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold font-serif text-[#0f1d2e] mb-1">
                      Email Us
                    </h3>
                    <p className="text-sm text-[#0f1d2e]/45 mb-3">
                      For general enquiries and support:
                    </p>
                    <a
                      href="mailto:hello@equiprofile.online"
                      className="text-[#2e6da4] font-semibold hover:underline text-sm"
                    >
                      hello@equiprofile.online
                    </a>
                  </div>

                  {/* Response time */}
                  <div className="rounded-2xl border border-[#0f1d2e]/5 bg-white p-7 shadow-sm hover:shadow-xl hover:shadow-[#1a7a6d]/5 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a7a6d] to-[#4eca9d] text-white mb-4 shadow-md shadow-[#1a7a6d]/15">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold font-serif text-[#0f1d2e] mb-1">
                      Response Time
                    </h3>
                    <p className="text-sm text-[#0f1d2e]/45">
                      We typically reply within{" "}
                      <span className="font-bold text-[#0f1d2e]">
                        24 hours
                      </span>{" "}
                      on business days. Priority support customers receive
                      responses within 4 hours.
                    </p>
                  </div>

                  {/* FAQ nudge */}
                  <div className="rounded-2xl border border-[#c5a55a]/25 bg-gradient-to-br from-[#c5a55a]/6 to-[#c5a55a]/3 p-7 hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#c5a55a]/15 border border-[#c5a55a]/25 text-[#c5a55a] mb-4">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold font-serif text-[#0f1d2e] mb-1">
                      Quick Answers
                    </h3>
                    <p className="text-sm text-[#0f1d2e]/45 mb-3">
                      Many common questions are covered in our pricing FAQ.
                    </p>
                    <a
                      href="/pricing#faq"
                      className="text-[#c5a55a] font-semibold hover:underline text-sm inline-flex items-center gap-1"
                    >
                      View FAQ →
                    </a>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ===================== CTA BANNER ===================== */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#070f1c] via-[#0f1d2e] to-[#091524]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_50%,_rgba(197,165,90,0.08)_0%,_transparent_70%)] pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-px bg-gradient-to-r from-transparent via-[#c5a55a]/50 to-transparent" />
          <div className="relative z-10 container mx-auto px-4 text-center">
            <AnimatedSection>
              <blockquote className="text-base md:text-lg italic text-white/40 max-w-2xl mx-auto mb-8 leading-relaxed">
                "Your question matters to us — we're here to help."
              </blockquote>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-white max-w-2xl mx-auto leading-tight">
                Not sure where to start?
              </h2>
              <p className="mt-5 text-white/45 text-lg max-w-xl mx-auto leading-relaxed">
                Try EquiProfile free for 7 days with no commitment. See the platform for yourself.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="/register">
                  <Button
                    size="lg"
                    className="bg-[#c5a55a] hover:bg-[#d4b468] text-[#0f1d2e] font-bold px-10 h-12 rounded-full shadow-2xl shadow-[#c5a55a]/25 border-0 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    Start Free Trial
                  </Button>
                </a>
                <a href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/15 text-white hover:bg-white/[0.07] px-10 h-12 rounded-full"
                  >
                    View Pricing
                  </Button>
                </a>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </div>
    </ManagementLayout>
  );
}
