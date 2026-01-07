import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketingNav } from "@/components/MarketingNav";
import { PageTransition } from "@/components/PageTransition";
import { ScrollReveal, Stagger, StaggerItem } from "@/components/ScrollReveal";
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

  const stats = [
    { value: "5,000+", label: "Active Users" },
    { value: "15,000+", label: "Horses Managed" },
    { value: "99.9%", label: "Uptime" },
    { value: "4.9/5", label: "User Rating" },
  ];

  return (
    <>
      <MarketingNav />
      <PageTransition>
        <div className="min-h-screen">
          {/* Hero Section */}
          <section className="relative pt-24 lg:pt-32 pb-16 lg:pb-24 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
            
            <div className="container relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Badge className="mb-6 inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    14-Day Free Trial
                  </Badge>
                  
                  <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6">
                    Professional Horse Management Made{" "}
                    <span className="text-gradient">Simple</span>
                  </h1>
                  
                  <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
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
                      <Button size="lg" variant="outline" className="text-lg w-full sm:w-auto">
                        Explore Features
                      </Button>
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
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

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                    <img 
                      src="/images/hero-horse.jpg" 
                      alt="Professional horse care" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  </div>
                  {/* Floating card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-xl border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">Health Tracking</div>
                        <div className="text-sm text-muted-foreground">Never miss a checkup</div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-12 border-y bg-muted/30">
            <div className="container">
              <ScrollReveal>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm md:text-base text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Features Section */}
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

              <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <StaggerItem key={index}>
                    <Card className="h-full card-hover">
                      <CardHeader>
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                          <feature.icon className="w-7 h-7 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
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
                      Start with a 14-day free trial. Plans start at just $9/month. 
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
          <footer className="py-12 lg:py-16 border-t bg-card">
            <div className="container">
              <div className="grid md:grid-cols-4 gap-8 mb-8">
                <div>
                  <div className="text-2xl font-bold font-serif mb-4">
                    <span className="text-gradient">EquiProfile</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Professional horse management for the modern equestrian.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">Product</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link href="/features"><a className="hover:text-foreground transition-colors">Features</a></Link></li>
                    <li><Link href="/pricing"><a className="hover:text-foreground transition-colors">Pricing</a></Link></li>
                    <li><Link href="/dashboard"><a className="hover:text-foreground transition-colors">Dashboard</a></Link></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">Company</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link href="/about"><a className="hover:text-foreground transition-colors">About</a></Link></li>
                    <li><Link href="/contact"><a className="hover:text-foreground transition-colors">Contact</a></Link></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">Legal</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                    <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t pt-8 text-center text-sm text-muted-foreground">
                <p>© {new Date().getFullYear()} EquiProfile. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </PageTransition>
    </>
  );
}
