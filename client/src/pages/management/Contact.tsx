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
          <div className="absolute inset-0 bg-gradient-to-br from-[#070f1c] via-[#0f1d2e] to-[#0a1e35]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(26,122,109,0.16)_0%,_transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(46,109,164,0.10)_0%,_transparent_60%)] pointer-events-none" />
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

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
      </div>
    </ManagementLayout>
  );
}
