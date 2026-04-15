import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MarketingLayout } from "@/components/MarketingLayout";
import { Mail, MessageCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fadeUp: Record<string, any> = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to send message. Please try again.");
      } else {
        toast.success("Message sent successfully!", {
          description: "We'll get back to you as soon as possible.",
        });

        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      }
    } catch {
      toast.error(
        "An error occurred. Please check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-[#f8f6f3]">
        {/* Hero Section */}
        <section className="pt-28 pb-12 md:pt-32 md:pb-16">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-serif font-bold text-[#1a3a5c] mb-4"
            >
              Get in{" "}
              <span className="bg-gradient-to-r from-[#2e6da4] to-[#3a9d8f] bg-clip-text text-transparent">
                Touch
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-[#1a3a5c]/60 leading-relaxed"
            >
              Have a question or need help? We're here for you. Send us a
              message and we'll respond as soon as possible.
            </motion.p>
          </div>
        </section>

        {/* Contact Info Cards — three side by side */}
        <section className="pb-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <motion.div
                custom={1}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="bg-white rounded-2xl p-6 shadow-sm border border-[#1a3a5c]/5 hover:shadow-md transition-shadow duration-300 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#2e6da4]/10 mb-4">
                  <Mail className="w-5 h-5 text-[#2e6da4]" />
                </div>
                <h3 className="font-semibold text-[#1a3a5c] mb-1">Email</h3>
                <p className="text-sm text-[#1a3a5c]/50 mb-3">
                  Send us an email anytime
                </p>
                <a
                  href="mailto:support@equiprofile.online"
                  className="text-sm font-medium text-[#2e6da4] hover:text-[#4a9eca] transition-colors"
                >
                  support@equiprofile.online
                </a>
              </motion.div>

              <motion.div
                custom={2}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="bg-white rounded-2xl p-6 shadow-sm border border-[#1a3a5c]/5 hover:shadow-md transition-shadow duration-300 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#3a9d8f]/10 mb-4">
                  <MessageCircle className="w-5 h-5 text-[#3a9d8f]" />
                </div>
                <h3 className="font-semibold text-[#1a3a5c] mb-1">WhatsApp</h3>
                <p className="text-sm text-[#1a3a5c]/50 mb-3">
                  Chat with us instantly
                </p>
                <a
                  href="https://wa.me/447347258089"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#3a9d8f] hover:text-[#2e8a7e] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  +44 7347 258089
                </a>
              </motion.div>

              <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="bg-white rounded-2xl p-6 shadow-sm border border-[#1a3a5c]/5 hover:shadow-md transition-shadow duration-300 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#4a9eca]/10 mb-4">
                  <Clock className="w-5 h-5 text-[#4a9eca]" />
                </div>
                <h3 className="font-semibold text-[#1a3a5c] mb-1">
                  Response Time
                </h3>
                <p className="text-sm text-[#1a3a5c]/50">
                  We reply within 24 hours on business days. For urgent matters,
                  use WhatsApp.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="pb-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-[#1a3a5c]/5 p-8 md:p-10"
            >
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#1a3a5c] mb-2">
                Send us a{" "}
                <span className="bg-gradient-to-r from-[#2e6da4] to-[#3a9d8f] bg-clip-text text-transparent">
                  message
                </span>
              </h2>
              <p className="text-[#1a3a5c]/50 mb-8">
                Fill out the form below and we'll get back to you within 24
                hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-[#1a3a5c]"
                    >
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="bg-[#f8f6f3] border-[#1a3a5c]/10 text-[#1a3a5c] placeholder:text-[#1a3a5c]/30 focus:border-[#2e6da4] focus:ring-[#2e6da4]/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-[#1a3a5c]"
                    >
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="bg-[#f8f6f3] border-[#1a3a5c]/10 text-[#1a3a5c] placeholder:text-[#1a3a5c]/30 focus:border-[#2e6da4] focus:ring-[#2e6da4]/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="subject"
                    className="text-sm font-medium text-[#1a3a5c]"
                  >
                    Subject <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subject"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="bg-[#f8f6f3] border-[#1a3a5c]/10 text-[#1a3a5c] placeholder:text-[#1a3a5c]/30 focus:border-[#2e6da4] focus:ring-[#2e6da4]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="message"
                    className="text-sm font-medium text-[#1a3a5c]"
                  >
                    Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="bg-[#f8f6f3] border-[#1a3a5c]/10 text-[#1a3a5c] placeholder:text-[#1a3a5c]/30 focus:border-[#2e6da4] focus:ring-[#2e6da4]/20 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-[#2e6da4] to-[#3a9d8f] hover:from-[#1a3a5c] hover:to-[#2e6da4] text-white font-semibold shadow-lg shadow-[#2e6da4]/20 transition-all duration-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </motion.div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="pb-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-2xl shadow-sm border border-[#1a3a5c]/5 p-8 md:p-12 text-center"
            >
              <svg
                className="w-10 h-10 text-[#3a9d8f]/40 mx-auto mb-6"
                fill="currentColor"
                viewBox="0 0 32 32"
              >
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>
              <blockquote className="text-xl md:text-2xl font-serif text-[#1a3a5c] mb-6 leading-relaxed">
                "The best way to predict the future is to create it. At
                EquiProfile, we're creating a future where horse care is
                simpler, smarter, and more connected."
              </blockquote>
              <p className="text-[#1a3a5c]/40 font-medium">
                — The EquiProfile Team
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
