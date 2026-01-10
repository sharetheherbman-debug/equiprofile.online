import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MarketingNav } from "@/components/MarketingNav";
import { PageTransition } from "@/components/PageTransition";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Mail, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    company: "", // honeypot field
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Message sent successfully!", {
          description: "We'll get back to you as soon as possible.",
        });
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          company: "",
        });
      } else {
        toast.error("Failed to send message", {
          description: data.error || "Please try again later.",
        });
      }
    } catch (error) {
      toast.error("Network error", {
        description: "Failed to send message. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  return (
    <>
      <MarketingNav />
      <PageTransition>
        <div className="min-h-screen pt-24 pb-16">
          {/* Hero Section */}
          <section className="container mx-auto px-4 mb-12">
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-6">
                  Get in <span className="text-gradient">Touch</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground">
                  Have a question or need help? We're here for you. Send us a
                  message and we'll respond as soon as possible.
                </p>
              </div>
            </ScrollReveal>
          </section>

          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Contact Form */}
              <ScrollReveal className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Send us a message</CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you within 24
                      hours.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">
                            Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">
                            Email <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">
                          Subject <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="subject"
                          placeholder="How can we help?"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">
                          Message <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="message"
                          placeholder="Tell us more about your inquiry..."
                          rows={6}
                          value={formData.message}
                          onChange={handleChange}
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      {/* Honeypot field - hidden from users */}
                      <div className="hidden">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          type="text"
                          value={formData.company}
                          onChange={handleChange}
                          tabIndex={-1}
                          autoComplete="off"
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </ScrollReveal>

              {/* Contact Information */}
              <ScrollReveal delay={0.2} className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Send us an email anytime
                      </p>
                      <a
                        href="mailto:support@equiprofile.com"
                        className="text-sm text-primary hover:underline"
                      >
                        support@equiprofile.com
                      </a>
                    </div>
                  </div>
                </Card>

                {WHATSAPP_NUMBER && (
                  <Card className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">WhatsApp</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Chat with us on WhatsApp
                        </p>
                        <a
                          href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {WHATSAPP_NUMBER}
                        </a>
                      </div>
                    </div>
                  </Card>
                )}

                <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
                  <h3 className="font-semibold mb-2">Response Time</h3>
                  <p className="text-sm text-muted-foreground">
                    We typically respond to all inquiries within 24 hours during
                    business days. For urgent matters, please email us directly.
                  </p>
                </Card>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </PageTransition>
    </>
  );
}
