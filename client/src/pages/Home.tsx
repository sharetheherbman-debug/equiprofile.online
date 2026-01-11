import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketingNav } from "@/components/MarketingNav";
import { PageTransition } from "@/components/PageTransition";
import { ScrollReveal, Stagger, StaggerItem } from "@/components/ScrollReveal";
import { Footer } from "@/components/Footer";
import { Link } from "wouter";
import { 
  Heart, 
  Calendar, 
  CloudSun, 
  FileText, 
  Check, 
  ChevronRight,
  Sparkles,
  Activity,
  Utensils,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Heart,
      title: "Health Records",
      description: "Track vaccinations, vet visits, medications, and medical history with automated reminders."
    },
    {
      icon: Activity,
      title: "Training Management",
      description: "Plan sessions, log progress, and track performance with detailed analytics."
    },
    {
      icon: Utensils,
      title: "Feeding Schedules",
      description: "Create custom feeding plans with nutrition tracking and meal reminders."
    },
    {
      icon: Calendar,
      title: "Calendar & Events",
      description: "Never miss appointments with integrated scheduling and notifications."
    },
    {
      icon: CloudSun,
      title: "AI Weather Analysis",
      description: "Get intelligent riding recommendations based on real-time weather conditions."
    },
    {
      icon: FileText,
      title: "Document Storage",
      description: "Securely store all important papers, records, and certificates in one place."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Thompson",
      role: "Dressage Rider",
      content: "EquiProfile has completely transformed how I manage my horses. The health tracking and reminders have been invaluable!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Stable Manager",
      content: "Managing 20+ horses used to be overwhelming. EquiProfile makes it simple and organized. Highly recommend!",
      rating: 5,
    },
    {
      name: "Emma Rodriguez",
      role: "Eventing Trainer",
      content: "The training logs and analytics are fantastic. I can see progress clearly and share updates with clients easily.",
      rating: 5,
    },
  ];

  return (
    <>
      <MarketingNav />
      <PageTransition>
        <div className="min-h-screen">
          {/* Hero Section */}
          <section className="relative min-h-[90vh] flex items-center overflow-hidden">
            {/* Full-width hero image with dark overlay and proper positioning */}
            <div className="absolute inset-0">
              <img 
                src="/images/hero-horse.jpg" 
                alt="Professional horse management" 
                className="w-full h-full object-cover object-center"
                style={{ objectPosition: "50% 40%" }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/50" />
            </div>
            
            <div className="container relative z-10 py-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl"
              >
                <Badge className="mb-6 inline-flex items-center gap-1 bg-primary/90">
                  <Sparkles className="w-3 h-3" />
                  7-Day Free Trial
                </Badge>
                
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 text-white">
                  Professional Horse Management Made{" "}
                  <span className="text-accent-400">Simple</span>
                </h1>
                
                <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                  The complete digital platform for horse owners, trainers, and equestrian professionals. 
                  Track health records, manage training, and provide exceptional care—all in one place.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                    <Button size="lg" className="text-lg w-full sm:w-auto">
                      {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/features">
                    <Button size="lg" variant="outline" className="text-lg w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20">
                      Explore Features
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Cancel anytime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Free support</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* New CTA Section - Everything in One Place */}
          <section className="py-20 bg-gradient-to-b from-primary/5 to-white">
            <div className="container">
              <ScrollReveal>
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-4xl font-bold font-serif mb-4">
                    Everything in <span className="text-gradient">One Place</span>
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Stop juggling spreadsheets, paper records, and multiple apps. 
                    EquiProfile brings your entire equine operation together.
                  </p>
                </div>
              </ScrollReveal>

              <Stagger className="grid md:grid-cols-3 gap-8">
                <StaggerItem>
                  <Card className="text-center p-6 bg-white rounded-xl shadow-md card-hover border-2">
                    <CardContent className="pt-6">
                      <div className="text-5xl font-bold text-primary mb-2">50,000+</div>
                      <div className="text-lg font-semibold mb-2">Horses Managed</div>
                      <p className="text-muted-foreground">Trusted by equine professionals worldwide</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
                
                <StaggerItem>
                  <Card className="text-center p-6 bg-white rounded-xl shadow-md card-hover border-2">
                    <CardContent className="pt-6">
                      <div className="text-5xl font-bold text-primary mb-2">98%</div>
                      <div className="text-lg font-semibold mb-2">Customer Satisfaction</div>
                      <p className="text-muted-foreground">Rated excellent by horse owners and trainers</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
                
                <StaggerItem>
                  <Card className="text-center p-6 bg-white rounded-xl shadow-md card-hover border-2">
                    <CardContent className="pt-6">
                      <div className="text-5xl font-bold text-primary mb-2">15 hours</div>
                      <div className="text-lg font-semibold mb-2">Saved Per Month</div>
                      <p className="text-muted-foreground">Average time saved on admin and paperwork</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              </Stagger>
            </div>
          </section>

          {/* Features Section - Redesigned with Image */}
          <section className="py-20 lg:py-32">
            <div className="container">
              <ScrollReveal>
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <Badge className="mb-4" variant="secondary">Features</Badge>
                  <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                    Everything You Need for{" "}
                    <span className="text-gradient">Complete Care</span>
                  </h2>
                  <p className="text-lg md:text-xl text-muted-foreground">
                    From health tracking to AI-powered insights, EquiProfile provides all the tools 
                    you need to keep your horses healthy, happy, and performing their best.
                  </p>
                </div>
              </ScrollReveal>

              {/* Image with overlapping features */}
              <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto mb-12">
                <ScrollReveal direction="left">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <img 
                      src="/images/training.jpg" 
                      alt="Professional horse care and training" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <h3 className="text-2xl font-bold mb-2">Professional Tools</h3>
                      <p className="text-white/90">Built for serious equestrians who demand excellence</p>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal direction="right">
                  <div className="space-y-6">
                    {features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex gap-4 items-start">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <feature.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                          <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollReveal>
              </div>

              {/* Remaining features in a cleaner grid */}
              <Stagger className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {features.slice(3).map((feature, index) => (
                  <StaggerItem key={index}>
                    <div className="flex flex-col items-center text-center p-6 rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <feature.icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>

              <ScrollReveal delay={0.3}>
                <div className="text-center mt-12">
                  <Link href="/features">
                    <Button size="lg" variant="outline">
                      View All Features
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-20 lg:py-32 bg-muted/30">
            <div className="container">
              <ScrollReveal>
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <Badge className="mb-4" variant="secondary">Testimonials</Badge>
                  <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                    Loved by Horse Owners Worldwide
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    See what our community has to say about EquiProfile
                  </p>
                </div>
              </ScrollReveal>

              <Stagger className="grid md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <StaggerItem key={index}>
                    <Card className="h-full">
                      <CardHeader>
                        <div className="flex gap-1 mb-4">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                          ))}
                        </div>
                        <CardDescription className="text-base leading-relaxed">
                          "{testimonial.content}"
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </section>

          {/* Pricing CTA */}
          <section className="py-20 lg:py-32">
            <div className="container">
              <ScrollReveal>
                <Card className="p-8 md:p-12 lg:p-16 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2">
                  <div className="text-center max-w-3xl mx-auto">
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                      Simple, Transparent Pricing
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8">
                      Start with a 7-day free trial. Plans start at just £7.99/month. 
                      No credit card required to get started.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Link href="/pricing">
                        <Button size="lg" className="text-lg w-full sm:w-auto">
                          View Pricing
                        </Button>
                      </Link>
                      <Link href="/register">
                        <Button size="lg" variant="outline" className="text-lg w-full sm:w-auto">
                          Start Free Trial
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-20 lg:py-32 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground">
            <div className="container">
              <ScrollReveal>
                <div className="text-center max-w-3xl mx-auto">
                  <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                    Ready to Transform Your Horse Care?
                  </h2>
                  <p className="text-lg md:text-xl text-primary-foreground/90 mb-8">
                    Join thousands of horse owners who trust EquiProfile to manage their equine companions. 
                    Start your free trial today—no credit card required.
                  </p>
                  <Link href="/register">
                    <Button size="lg" className="bg-background text-foreground hover:bg-background/90 text-lg">
                      Start Your Free Trial
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Footer */}
          <Footer />
        </div>
      </PageTransition>
    </>
  );
}
