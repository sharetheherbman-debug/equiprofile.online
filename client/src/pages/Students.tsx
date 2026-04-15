// Copyright (c) 2025-2026 Amarktai Network. All rights reserved.
import { Link } from "wouter";
import { MarketingLayout } from "@/components/MarketingLayout";
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
  ArrowRight,
  Monitor,
  MessageCircle,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const studentFeatures = [
  {
    icon: BookOpen,
    title: "Structured Lesson Pathways",
    description:
      "Follow 15 professional pathways covering horse care, rider skills, stable management, and more — each with objectives, knowledge checks, and progress tracking.",
  },
  {
    icon: Brain,
    title: "AI-Powered Tutor",
    description:
      "Ask questions about equine care and get clear, knowledgeable answers instantly. From lameness signs to feed ratios — your AI tutor is always ready to help.",
  },
  {
    icon: Sparkles,
    title: "Virtual Horse Care Simulation",
    description:
      "Practice with a realistic simulated horse that responds to your care decisions. Build confidence and core knowledge before setting foot in a stable.",
  },
  {
    icon: Monitor,
    title: "Scenario-Based Training",
    description:
      "Handle simulated emergencies, make feeding decisions, and develop the critical thinking skills that employers and examiners look for.",
  },
  {
    icon: TrendingUp,
    title: "Progress & Competency Tracking",
    description:
      "Track your development with detailed competency maps. See strengths, identify areas for improvement, and share verifiable progress reports.",
  },
  {
    icon: ClipboardList,
    title: "Assignments & Feedback",
    description:
      "Receive assignments from your teacher, submit your work, and get detailed feedback and marks. Build evidence of learning for qualifications.",
  },
  {
    icon: Trophy,
    title: "Achievements & Portfolios",
    description:
      "Earn recognition for milestones and build a verifiable portfolio for assessments, interviews, and qualifications.",
  },
  {
    icon: MessageCircle,
    title: "Teacher Connection",
    description:
      "Stay connected with your instructor through messaging, receive resources, and get personalised feedback on your lesson progress.",
  },
];

const schoolBenefits = [
  {
    title: "Curriculum-Aligned Content",
    description:
      "Map student activities to your syllabus — BHS stages, Pony Club badges, NVQ modules, or your own programme. Every task contributes to measurable outcomes.",
  },
  {
    title: "Student & Group Management",
    description:
      "Assign horses to students, organise groups by level, set differentiated tasks, and monitor engagement from a single dashboard.",
  },
  {
    title: "Automated Progress Reports",
    description:
      "Generate data-driven reports for parents, inspectors, and accreditation bodies. Evidence progress with real activity logs, not just notes.",
  },
  {
    title: "Flexible School Pricing",
    description:
      "Tiered plans from £49/month for up to 10 students, scaling to £199/month for 50. All plans include a 7-day free trial.",
  },
];

export default function Students() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="bg-[#f8f6f3] pt-28 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            {...fadeUp}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2e6da4]/10 border border-[#2e6da4]/20 mb-6">
              <GraduationCap className="w-5 h-5 text-[#2e6da4]" />
              <span className="text-sm font-medium text-[#2e6da4]">
                Student Plan — From £8/month
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-[#1a3a5c] mb-6 tracking-tight">
              Learn Horsemanship{" "}
              <span className="text-[#3a9d8f]">the Smart Way</span>
            </h1>
            <p className="text-lg md:text-xl text-[#1a3a5c]/70 leading-relaxed max-w-2xl mx-auto mb-10">
              95+ structured lessons, AI-powered tutoring, and hands-on
              simulation — everything a student needs to build real equine
              knowledge, from beginner to advanced.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register?plan=student">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-[#2e6da4] hover:bg-[#1a3a5c] text-white rounded-lg group"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border-[#1a3a5c]/20 text-[#1a3a5c] hover:bg-[#1a3a5c]/5 rounded-lg"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-y border-gray-100">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            className="max-w-4xl mx-auto grid grid-cols-3 gap-6 md:gap-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {[
              { value: "95+", label: "Structured Lessons" },
              { value: "15", label: "Learning Pathways" },
              { value: "4", label: "Learner Levels" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl md:text-5xl font-bold font-serif text-[#1a3a5c] mb-1">
                  {stat.value}
                </p>
                <p className="text-sm md:text-base text-[#1a3a5c]/60">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="bg-[#f8f6f3] py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#1a3a5c] mb-4 tracking-tight">
              Everything You Need to Learn
            </h2>
            <p className="text-lg text-[#1a3a5c]/60 max-w-2xl mx-auto">
              A complete learning platform designed to teach through doing
              — from first-time handlers to competition-level riders
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {studentFeatures.map((feature, index) => (
              <motion.article
                key={index}
                className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.06 }}
              >
                <div className="w-12 h-12 rounded-xl bg-[#2e6da4]/10 flex items-center justify-center mb-4 group-hover:bg-[#2e6da4]/15 transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-[#2e6da4]" />
                </div>
                <h3 className="text-base font-semibold text-[#1a3a5c] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#1a3a5c]/60 leading-relaxed">
                  {feature.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Virtual vs Real Horse */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#1a3a5c] mb-4 tracking-tight">
              Learn Your Way
            </h2>
            <p className="text-lg text-[#1a3a5c]/60 max-w-2xl mx-auto">
              Start with a virtual horse at home or work with a real horse at
              your yard — EquiProfile supports both
            </p>
          </motion.div>

          <motion.div
            className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="bg-[#f8f6f3] rounded-2xl p-8 border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-[#4a9eca]/15 flex items-center justify-center mb-5">
                <Sparkles className="w-7 h-7 text-[#4a9eca]" />
              </div>
              <h3 className="text-xl font-semibold font-serif text-[#1a3a5c] mb-3">
                Start with a Virtual Horse
              </h3>
              <p className="text-[#1a3a5c]/60 leading-relaxed mb-5">
                No yard access? No problem. Begin with a realistic simulated
                horse that responds to your care decisions. Practice feeding
                plans, spot early health concerns, and develop professional
                routines — all from anywhere.
              </p>
              <ul className="space-y-3">
                {[
                  "Realistic daily care simulation",
                  "Learn at your own pace, risk-free",
                  "Master fundamentals before the real thing",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-[#1a3a5c]/70">
                    <CheckCircle2 className="w-4 h-4 text-[#3a9d8f] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#f8f6f3] rounded-2xl p-8 border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-[#3a9d8f]/15 flex items-center justify-center mb-5">
                <Heart className="w-7 h-7 text-[#3a9d8f]" />
              </div>
              <h3 className="text-xl font-semibold font-serif text-[#1a3a5c] mb-3">
                Work with a Real Horse
              </h3>
              <p className="text-[#1a3a5c]/60 leading-relaxed mb-5">
                At a riding school or training yard? Your instructor assigns
                you a real horse to manage through EquiProfile. Log feeds,
                record health checks, and track genuine progress — building
                verifiable experience.
              </p>
              <ul className="space-y-3">
                {[
                  "Hands-on care with real accountability",
                  "Instructor-assigned and supervised",
                  "Build a verified experience portfolio",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-[#1a3a5c]/70">
                    <CheckCircle2 className="w-4 h-4 text-[#3a9d8f] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="bg-[#f8f6f3] py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#1a3a5c] mb-4 tracking-tight">
                Who Is EquiProfile For?
              </h2>
              <p className="text-lg text-[#1a3a5c]/60 max-w-2xl mx-auto">
                Whether you're just starting out or preparing for professional
                qualifications — EquiProfile meets you where you are
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: GraduationCap,
                  title: "Students & Young Riders",
                  description:
                    "Study equine theory, practise care routines, track your riding hours, and build a portfolio that proves what you can actually do. From Pony Club to BHS Stage exams, stay organised and motivated.",
                },
                {
                  icon: School,
                  title: "Riding Schools & Colleges",
                  description:
                    "Give every student a structured, measurable learning path. Assign horses, set tasks aligned to your syllabus, and generate evidence-based progress reports your inspectors will value.",
                },
                {
                  icon: Users,
                  title: "Parents & Trainers",
                  description:
                    "See exactly what your child or student is learning — real data, not vague updates. Care logs, training records, achievement milestones, and progress summaries you can trust.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm"
                >
                  <div className="w-14 h-14 rounded-full bg-[#1a3a5c]/10 flex items-center justify-center mx-auto mb-5">
                    <item.icon className="w-7 h-7 text-[#1a3a5c]" />
                  </div>
                  <h3 className="text-lg font-semibold font-serif text-[#1a3a5c] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#1a3a5c]/60 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* School Benefits */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-[#1a3a5c] rounded-2xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-10 items-start">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 mb-5">
                    <School className="w-4 h-4 text-[#4a9eca]" />
                    <span className="text-xs font-medium text-[#4a9eca] uppercase tracking-wider">
                      For Riding Schools
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold font-serif text-white mb-4 tracking-tight">
                    Equip Your Entire Yard
                  </h2>
                  <p className="text-white/70 leading-relaxed mb-4">
                    Replace paper worksheets and informal assessments with a
                    professional digital learning platform your students will
                    actually want to use — and your inspectors will be
                    impressed by.
                  </p>
                  <p className="text-white/70 leading-relaxed mb-6">
                    Individual student plans start at{" "}
                    <span className="text-white font-semibold">£8/month</span>.
                    School plans from{" "}
                    <span className="text-white font-semibold">£49/month</span>{" "}
                    for up to 10 students.
                  </p>
                  <Link href="/pricing?type=school">
                    <Button className="bg-white text-[#1a3a5c] hover:bg-white/90 px-6 py-3 rounded-lg group font-semibold">
                      <School className="w-4 h-4 mr-2" />
                      View School Pricing
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {schoolBenefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#3a9d8f] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">
                          {benefit.title}
                        </h4>
                        <p className="text-xs text-white/60 leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#f8f6f3] py-20 pb-28">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#1a3a5c] mb-4 tracking-tight">
              Ready to Start Learning?
            </h2>
            <p className="text-lg text-[#1a3a5c]/60 mb-4 max-w-2xl mx-auto">
              The riders who stand out aren't just talented — they're
              knowledgeable, organised, and dedicated. EquiProfile gives you the
              tools to become all three.
            </p>
            <p className="text-[#1a3a5c]/50 mb-8 max-w-xl mx-auto">
              Start your free 7-day trial today. Just £8/month after that —
              less than a single riding lesson.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register?plan=student">
                <Button
                  size="lg"
                  className="text-lg px-10 py-6 bg-[#2e6da4] hover:bg-[#1a3a5c] text-white rounded-lg shadow-lg hover:shadow-xl transition-all group"
                >
                  Start Your Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 py-6 border-[#1a3a5c]/20 text-[#1a3a5c] hover:bg-[#1a3a5c]/5 rounded-lg"
                >
                  Compare Plans
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  );
}
