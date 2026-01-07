import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MarketingNav } from "@/components/MarketingNav";
import { PageTransition } from "@/components/PageTransition";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Heart, Target, Users, Sparkles } from "lucide-react";
import { Link } from "wouter";

const values = [
  {
    icon: Heart,
    title: "Horse-First Philosophy",
    description:
      "Every feature we build is designed with the well-being and care of horses as our top priority.",
  },
  {
    icon: Target,
    title: "Simplicity & Efficiency",
    description:
      "We believe powerful software should be intuitive. No complicated workflows or endless training required.",
  },
  {
    icon: Users,
    title: "Community-Driven",
    description:
      "We listen to our users and actively incorporate feedback to continuously improve the platform.",
  },
  {
    icon: Sparkles,
    title: "Innovation",
    description:
      "We leverage cutting-edge technology like AI to provide insights and automation that save you time.",
  },
];

export default function About() {
  return (
    <>
      <MarketingNav />
      <PageTransition>
        <div className="min-h-screen pt-24 pb-16">
          {/* Hero Section */}
          <section className="container mx-auto px-4 mb-20">
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-6">
                  About{" "}
                  <span className="text-gradient">EquiProfile</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground">
                  We're on a mission to revolutionize horse management with
                  technology that empowers horse owners, trainers, and
                  equestrian professionals.
                </p>
              </div>
            </ScrollReveal>
          </section>

          {/* Mission Section */}
          <section className="container mx-auto px-4 mb-20">
            <ScrollReveal>
              <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6 text-center">
                    Our Mission
                  </h2>
                  <p className="text-lg text-muted-foreground text-center mb-6">
                    To provide horse owners and equestrian professionals with a
                    comprehensive, easy-to-use platform that centralizes horse
                    management, improves care quality, and enhances the bond
                    between horses and their caretakers.
                  </p>
                  <p className="text-lg text-muted-foreground text-center">
                    We believe that better data leads to better decisions, and
                    better decisions lead to happier, healthier horses. That's
                    why we've built EquiProfile—to give you the tools and
                    insights you need to provide exceptional care.
                  </p>
                </div>
              </Card>
            </ScrollReveal>
          </section>

          {/* Story Section */}
          <section className="container mx-auto px-4 mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <ScrollReveal direction="left">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6">
                    Our Story
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
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
                      trainers, and stable managers worldwide. We're proud to
                      be part of the equestrian community and committed to
                      continuously improving our platform based on your
                      feedback.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="text-6xl font-bold text-primary mb-4">
                        5,000+
                      </div>
                      <div className="text-xl font-semibold mb-2">
                        Happy Users
                      </div>
                      <div className="text-muted-foreground">
                        Trusting EquiProfile for their horse management needs
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Values Section */}
          <section className="container mx-auto px-4 mb-20">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-center mb-12">
                Our Values
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {values.map((value, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <Card className="p-6 h-full text-center hover:shadow-lg transition-all duration-300 card-hover">
                    <div className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-4">
                      <value.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {value.description}
                    </p>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="container mx-auto px-4">
            <ScrollReveal>
              <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2">
                <div className="text-center max-w-2xl mx-auto">
                  <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
                    Join Our Community
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Be part of a growing community of horse enthusiasts who are
                    transforming the way they manage their equine companions.
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <Link href="/register">
                      <Button size="lg" className="text-lg">
                        Get Started Free
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button size="lg" variant="outline" className="text-lg">
                        Contact Us
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          </section>
        </div>
      </PageTransition>
    </>
  );
}
