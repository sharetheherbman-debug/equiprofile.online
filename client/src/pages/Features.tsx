import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/MarketingLayout";
import { PageBanner } from "@/components/PageBanner";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { detailedFeatures } from "@/content/features";

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Features() {
  return (
    <MarketingLayout>
      <div className="min-h-screen bg-black text-white">
        {/* Page Banner */}
        <PageBanner
          title="Powerful Features for Modern Horse Management"
          subtitle="Everything you need to manage your horses efficiently, all in one place"
          imageSrc="/images/stable.jpg"
          imagePosition="center"
        />

        {/* Feature Sections with Alternating Layout */}
        <div className="py-20">
          {detailedFeatures.map((section, index) => {
            const Icon = section.icon;
            const isImageRight = section.imagePosition === "right";

            return (
              <motion.section
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUpVariants}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`py-16 ${index % 2 === 1 ? "bg-gray-900/30" : ""}`}
              >
                <div className="container mx-auto px-4">
                  <div
                    className={`max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                      isImageRight ? "" : "lg:grid-flow-dense"
                    }`}
                  >
                    {/* Content */}
                    <div className={`${isImageRight ? "" : "lg:col-start-2"}`}>
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${section.gradient} bg-opacity-20 border border-white/20 mb-6`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        {section.title}
                      </h2>
                      <p className="text-lg text-gray-300 mb-8">
                        {section.description}
                      </p>

                      <ul className="space-y-4 mb-8">
                        {section.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-start gap-3"
                          >
                            <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {index === 1 && (
                        <Link href="/pricing">
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white group"
                          >
                            Get Started
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      )}
                    </div>

                    {/* Image */}
                    <div
                      className={`relative ${isImageRight ? "" : "lg:col-start-1 lg:row-start-1"}`}
                    >
                      <div className="relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.3)] group">
                        <img
                          src={section.image}
                          alt={section.title}
                          className="w-full h-full object-cover aspect-[4/3]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-b from-black to-gray-900">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUpVariants}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-white">
                Ready to Transform Your
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Horse Management?
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-10">
                Join thousands of equestrians who trust EquiProfile. Start your
                free 7-day trial today—no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="text-lg px-10 py-6 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white group"
                  >
                    Start Free Trial
                    <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-10 py-6 border-white/20 text-white hover:bg-white/10"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
