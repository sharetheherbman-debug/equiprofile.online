import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/MarketingLayout";
import { PageBanner } from "@/components/PageBanner";
import { Heart, Target, Users, Award, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function AnimatedSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUpVariants}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function About() {
  const values = [
    {
      icon: Heart,
      title: "Horse Welfare First",
      description:
        "Every feature we build is designed with the health and well-being of horses as our top priority.",
      gradient: "from-rose-500 to-pink-500",
    },
    {
      icon: Target,
      title: "Simplicity & Clarity",
      description:
        "Horse management should be easy, not complicated. We create intuitive tools that anyone can use.",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: Users,
      title: "Community-Driven",
      description:
        "We listen to our users and continuously improve based on your feedback and needs.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Award,
      title: "Excellence in Everything",
      description:
        "From security to support, we're committed to delivering the highest quality service.",
      gradient: "from-violet-500 to-purple-500",
    },
  ];

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-[#0a1628] relative overflow-hidden">
        {/* Background Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-[#071428] to-cyan-950/40 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-900/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />

        {/* Page Banner */}
        <PageBanner
          title="About EquiProfile"
          subtitle="We're on a mission to revolutionize horse management with technology that empowers horse owners, trainers, and equestrian professionals."
          imageSrc="/images/aboutus.jpg"
          imagePosition="center"
        />

        <div className="relative z-10">
          {/* Our Story Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <AnimatedSection>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden backdrop-blur-md bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.3)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20" />
                  <img
                    src="/images/gallery/19.jpg"
                    alt="Our Story"
                    className="relative z-10 w-full h-full object-cover object-[center_30%]"
                  />
                </div>
              </AnimatedSection>

              <AnimatedSection>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    Our Story
                  </h2>
                  <div className="space-y-4 text-gray-300">
                    <p>
                      EquiProfile was born from a simple frustration: managing
                      horse information shouldn't be complicated. As horse
                      owners ourselves, we experienced firsthand the challenge
                      of juggling paper records, spreadsheets, and multiple
                      apps.
                    </p>
                    <p>
                      We knew there had to be a better way—a single platform
                      that could handle everything from health records to
                      training logs, from feeding schedules to competition
                      results. So we built it.
                    </p>
                    <p>
                      Today, EquiProfile serves thousands of horse owners,
                      trainers, and stable managers worldwide. We're proud to be
                      part of the equestrian community and committed to
                      continuously improving our platform based on your
                      feedback.
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            </div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-16 bg-[#0f2040]/60">
            <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="relative max-w-6xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 rounded-3xl blur-3xl" />
                <div className="relative backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_50px_rgba(99,102,241,0.3)] group">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        Our Mission
                      </h2>
                      <p className="text-lg text-gray-300 mb-6">
                        To provide horse owners and equestrian professionals
                        with a comprehensive, easy-to-use platform that
                        centralizes horse management, improves care quality, and
                        enhances the bond between horses and their caretakers.
                      </p>
                      <p className="text-lg text-gray-300">
                        We believe that better data leads to better decisions,
                        and better decisions lead to happier, healthier horses.
                        That's why we've built EquiProfile—to give you the tools
                        and insights you need to provide exceptional care.
                      </p>
                    </div>
                    <div className="relative aspect-square rounded-2xl overflow-hidden backdrop-blur-md bg-white/5 border border-white/10 p-4 hover:border-white/20 transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20" />
                      <img
                        src="/images/hero/image4.jpg"
                        alt="Our Mission"
                        className="relative z-10 w-full h-full object-cover rounded-xl object-[center_40%]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
            </div>
          </section>

          {/* Values Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4 text-white">
                  Our{" "}
                  <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    Core Values
                  </span>
                </h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  The principles that guide everything we do at EquiProfile
                </p>
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="relative backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                  >
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.gradient} p-3 mb-4 flex items-center justify-center`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-white">
                      {value.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="py-16 bg-[#0f2040]/60">
            <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6 text-white">
                  Built by{" "}
                  <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    Equestrians
                  </span>
                  , for Equestrians
                </h2>
                <p className="text-lg text-gray-300 mb-8">
                  Our team combines deep equestrian expertise with world-class
                  software engineering. We understand the challenges you face
                  because we've faced them too. From professional trainers to
                  stable managers to competitive riders, our diverse team brings
                  real-world experience to every feature we build.
                </p>
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300">
                  <img
                    src="/images/hero/image5.jpg"
                    alt="Our Team"
                    className="w-full h-full object-cover object-[center_30%]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              </div>
            </AnimatedSection>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="py-16">
            <div className="container mx-auto px-4">
            <AnimatedSection>
              <div className="relative max-w-4xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-3xl blur-3xl" />
                <div className="relative backdrop-blur-md bg-white/5 border-2 border-white/20 rounded-3xl p-8 md:p-12 hover:bg-white/10 hover:border-white/30 transition-all duration-500 hover:shadow-[0_0_60px_rgba(99,102,241,0.4)]">
                  <div className="text-center">
                    <Heart className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
                    <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4 text-white">
                      Join Our Community
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                      Thousands of equestrians trust EquiProfile to manage their
                      horses. Start your free trial today and experience the
                      difference.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link href="/register">
                        <Button
                          size="lg"
                          className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white group"
                        >
                          Start Free Trial
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      <Link href="/contact">
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          Contact Us
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
            </div>
          </section>
        </div>
      </div>
    </MarketingLayout>
  );
}
