// Copyright (c) 2025-2026 Amarktai Network. All rights reserved.
import { Link } from "wouter";
import { MarketingLayout } from "@/components/MarketingLayout";
import { PageBanner } from "@/components/PageBanner";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Heart,
  BookOpen,
  Trophy,
  Users,
  Brain,
  ClipboardList,
  TrendingUp,
  CheckCircle2,
  School,
  Sparkles,
  Star,
  ArrowRight,
  Mail,
} from "lucide-react";

const studentFeatures = [
  {
    icon: Heart,
    title: "Your Own Horse to Manage",
    description:
      "Every student is paired with a horse — virtual or real. Record feeds, log health observations, manage turnout schedules, and develop the instincts that only come from genuine daily responsibility.",
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: ClipboardList,
    title: "Structured Daily Routines",
    description:
      "Follow professional yard routines covering mucking out, grooming, tack checks, and health inspections. Build the discipline and attention to detail that top yards expect.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: BookOpen,
    title: "Equine Study Hub",
    description:
      "Dive into guided learning covering anatomy, nutrition, common ailments, first aid, and stable management — structured around real BHS and Pony Club syllabi to complement your studies.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: TrendingUp,
    title: "Training & Progress Tracking",
    description:
      "Log every flatwork session, jumping lesson, and lunge workout. Track your riding hours, monitor skill development over time, and share detailed summaries with trainers and parents.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Brain,
    title: "AI-Powered Learning Support",
    description:
      "Ask questions about equine care and get clear, knowledgeable answers instantly. From understanding lameness signs to calculating feed ratios — your AI tutor is always available.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Trophy,
    title: "Achievements & Portfolios",
    description:
      "Earn recognition for milestones — first solo health check, 100 logged care tasks, consistent training streaks. Build a verifiable portfolio for assessments, interviews, and qualifications.",
    color: "from-cyan-500 to-teal-500",
  },
];

const schoolBenefits = [
  {
    title: "Curriculum-Aligned Learning",
    description:
      "Map student activities directly to your syllabus — BHS stages, Pony Club badges, NVQ modules, or your own bespoke programme. Every task contributes to measurable learning outcomes.",
  },
  {
    title: "Cohort & Horse Management",
    description:
      "Assign horses to students, organise groups by level or class, set differentiated tasks, and monitor who's engaged — all from a single instructor dashboard.",
  },
  {
    title: "Automated Progress Reports",
    description:
      "Generate detailed, data-driven reports for parents, inspectors, and accreditation bodies. Evidence student progress with real activity logs, not just instructor notes.",
  },
  {
    title: "School Pricing on Request",
    description:
      "We offer tailored pricing for riding schools, colleges, and training centres. Contact us to discuss a plan that works for your student numbers and budget.",
  },
];

export default function Students() {
  return (
    <MarketingLayout>
      <PageBanner
        title="For Students"
        subtitle="Professional equine management tools built for the next generation of horsemen and horsewomen"
        imageSrc="/images/hero/image6.jpg"
        imagePosition="center"
      />

      <div className="min-h-screen bg-[#0a1628] bg-gradient-to-br from-[#0a1628] via-[#0f1f45] to-[#0a1628]">
        {/* Hero Intro */}
        <section className="container mx-auto px-4 pt-16 pb-12">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4f5fd6]/15 border border-[#4f5fd6]/30 mb-6">
              <GraduationCap className="w-5 h-5 text-[#8b9cf7]" />
              <span className="text-sm font-medium text-[#8b9cf7]">
                Student Programme — £5/month
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-white mb-6 tracking-tight">
              Where Serious Equestrian{" "}
              <span className="bg-gradient-to-r from-[#8b9cf7] to-cyan-400 bg-clip-text text-transparent">
                Learning Begins
              </span>
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
              EquiProfile gives every student their own professional-grade
              dashboard — the same tools used by working yards, adapted for
              learners. Manage a horse, track your training, study equine
              theory, and build a portfolio that proves your knowledge is more
              than classroom deep.
            </p>
          </motion.div>
        </section>

        {/* Virtual vs Real Horse */}
        <section className="container mx-auto px-4 py-12">
          <motion.div
            className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-gradient-to-br from-[#4f5fd6]/10 to-violet-500/10 border border-[#4f5fd6]/20 rounded-2xl p-8 hover:border-[#4f5fd6]/40 transition-colors duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center mb-5">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Start with a Virtual Horse
              </h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                No yard access? No problem. Begin with a realistic simulated
                horse that responds to your care decisions. Practice feeding
                plans, spot early health concerns, and develop professional
                routines — all before setting foot in a stable. Ideal for
                building confidence and core knowledge from anywhere.
              </p>
              <ul className="space-y-2">
                {[
                  "Realistic daily care simulation",
                  "Learn at your own pace, risk-free",
                  "Master fundamentals before the real thing",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-8 hover:border-emerald-500/40 transition-colors duration-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mb-5">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Work with a Real Horse
              </h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                At a riding school or training yard? Your instructor assigns
                you a real horse to manage through EquiProfile. Log every
                feed, record health checks after each session, and track
                genuine training progress — building the kind of verifiable
                experience that qualifications and employers look for.
              </p>
              <ul className="space-y-2">
                {[
                  "Hands-on care with real accountability",
                  "Instructor-assigned and supervised",
                  "Build a verified experience portfolio",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </section>

        {/* Student Features Grid */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-white mb-4 tracking-tight">
              Tools That Develop{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Real Horsemen
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Not a watered-down demo — a professional management platform
              designed to teach through doing, from first-time handlers to
              competition-level riders
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentFeatures.map((feature, index) => (
              <motion.article
                key={index}
                className="bg-[#0f2040]/60 backdrop-blur-md border border-white/10 rounded-xl p-7 hover:border-white/25 transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + index * 0.08 }}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Who Is This For */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-white mb-4 tracking-tight">
                Designed for the{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  Whole Equestrian Journey
                </span>
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Whether you're mucking out for the first time or preparing for
                professional qualifications — EquiProfile meets you where you are
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: GraduationCap,
                  title: "Students & Young Riders",
                  description:
                    "Own your learning. Log daily care, track riding hours, study equine theory, and build a portfolio that shows what you can actually do — not just what you've been told. From Pony Club to BHS Stage exams, EquiProfile keeps you organised and motivated.",
                },
                {
                  icon: School,
                  title: "Riding Schools & Colleges",
                  description:
                    "Give every student a structured, measurable learning path without adding admin burden. Assign horses, set care tasks that align to your syllabus, and generate progress evidence your inspectors and parents will value.",
                },
                {
                  icon: Users,
                  title: "Parents & Trainers",
                  description:
                    "See exactly what your child or student is learning — not vague updates, but real data. Care logs, training records, achievement milestones, and progress summaries that give you confidence their time in the saddle and on the yard is time well spent.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-[#0f2040]/60 backdrop-blur-md border border-white/10 rounded-xl p-7 text-center hover:border-white/25 transition-colors duration-300"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center mx-auto mb-5">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* For Schools Section */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <div className="bg-gradient-to-br from-[#4f5fd6]/10 to-indigo-500/5 border border-[#4f5fd6]/20 rounded-2xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-10 items-start">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4f5fd6]/15 border border-[#4f5fd6]/30 mb-5">
                    <School className="w-4 h-4 text-[#8b9cf7]" />
                    <span className="text-xs font-medium text-[#8b9cf7] uppercase tracking-wider">
                      For Riding Schools
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold font-serif text-white mb-4 tracking-tight">
                    Equip Your{" "}
                    <span className="text-[#8b9cf7]">Entire Yard</span>
                  </h2>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    EquiProfile transforms how riding schools deliver equine
                    education. Replace paper worksheets and informal assessments
                    with a professional digital platform your students will
                    actually want to use — and your inspectors will be
                    impressed by.
                  </p>
                  <p className="text-gray-400 leading-relaxed mb-6">
                    Individual student plans start at just{" "}
                    <span className="text-white font-semibold">£5/month</span>.
                    For schools and academies enrolling multiple students, we
                    offer tailored pricing to fit your budget. Get in touch and
                    we'll build a plan around your needs.
                  </p>
                  <Link href="/contact">
                    <Button className="bg-[#4f5fd6] hover:bg-[#4554c4] text-white px-6 py-3 rounded-lg group">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Us for School Pricing
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {schoolBenefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/5"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#8b9cf7] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">
                          {benefit.title}
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 py-16 pb-24">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#4f5fd6]/20 to-cyan-500/20 rounded-3xl blur-3xl" />
              <div className="relative backdrop-blur-md bg-white/5 border-2 border-white/20 rounded-3xl p-8 md:p-12 hover:bg-white/10 hover:border-white/30 transition-all duration-500">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 mb-6">
                    <Star className="w-5 h-5 text-amber-400" />
                    <Star className="w-5 h-5 text-amber-400" />
                    <Star className="w-5 h-5 text-amber-400" />
                    <Star className="w-5 h-5 text-amber-400" />
                    <Star className="w-5 h-5 text-amber-400" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4 text-white">
                    Your Equestrian Career{" "}
                    <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                      Starts Here
                    </span>
                  </h2>
                  <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto">
                    The riders who stand out aren't just talented — they're
                    knowledgeable, organised, and dedicated. EquiProfile gives
                    you the tools to prove all three.
                  </p>
                  <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                    Start your free 7-day trial today. Just £5/month after that
                    — less than a single riding lesson.
                  </p>
                  <Link href="/register?plan=student">
                    <Button
                      size="lg"
                      className="text-lg px-10 py-6 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white border-0 shadow-2xl shadow-indigo-500/20 hover:scale-105 transition-transform group"
                    >
                      Start Your Free Trial
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </MarketingLayout>
  );
}
