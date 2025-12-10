import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { 
  Heart, 
  Calendar, 
  CloudSun, 
  FileText, 
  Shield, 
  Users, 
  Check, 
  ChevronRight,
  Sparkles,
  Activity,
  Utensils,
  Clock
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  const features = [
    {
      icon: Heart,
      title: "Health Records",
      description: "Track vaccinations, vet visits, medications, and medical history with document uploads and reminders."
    },
    {
      icon: Calendar,
      title: "Training Scheduler",
      description: "Plan and log training sessions, track progress, and maintain detailed session notes."
    },
    {
      icon: CloudSun,
      title: "AI Weather Analysis",
      description: "Get intelligent riding condition recommendations based on real-time weather data."
    },
    {
      icon: Utensils,
      title: "Feeding Plans",
      description: "Create and manage feeding schedules with nutrition tracking and meal reminders."
    },
    {
      icon: FileText,
      title: "Document Storage",
      description: "Securely store registration papers, insurance documents, and competition records."
    },
    {
      icon: Activity,
      title: "Progress Tracking",
      description: "Monitor your horse's development with comprehensive performance analytics."
    }
  ];

  const pricingPlans = [
    {
      name: "Monthly",
      price: "£7.99",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        "Unlimited horse profiles",
        "Health record management",
        "Training scheduler",
        "AI weather analysis",
        "Document storage (5GB)",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Yearly",
      price: "£79.90",
      period: "/year",
      originalPrice: "£95.88",
      savings: "Save £15.98",
      description: "Best value - 2 months free",
      features: [
        "Everything in Monthly",
        "Priority support",
        "Document storage (20GB)",
        "Advanced analytics",
        "Export reports",
        "API access"
      ],
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-xl">E</span>
            </div>
            <span className="font-serif text-xl font-semibold text-foreground">EquiProfile</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button variant="ghost">Sign In</Button>
                </a>
                <a href={getLoginUrl()}>
                  <Button>Start Free Trial</Button>
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero-horse.jpg')" }}
        >
          <div className="absolute inset-0 hero-gradient" />
        </div>
        
        <div className="container relative z-10 py-20 lg:py-32">
          <div className="max-w-2xl">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Sparkles className="w-3 h-3 mr-1" />
              7-Day Free Trial
            </Badge>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Professional Horse Management Made Simple
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
              The complete digital solution for horse owners and riders. Track health records, 
              schedule training, monitor weather conditions, and manage every aspect of your 
              equine companion's care.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a href={getLoginUrl()}>
                <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90">
                  Start Your Free Trial
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
              <a href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/50 text-white hover:bg-white/10">
                  Explore Features
                </Button>
              </a>
            </div>

            <div className="flex items-center gap-6 mt-10 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-secondary/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4" variant="secondary">Features</Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Complete Horse Care
            </h2>
            <p className="text-muted-foreground text-lg">
              From daily health tracking to advanced AI-powered weather analysis, 
              EquiProfile provides all the tools you need to keep your horses healthy and happy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover border-border/50 bg-card">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="font-serif text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Image Gallery Section */}
      <section className="py-20 lg:py-32">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4" variant="secondary">Why EquiProfile</Badge>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
                Built by Equestrians, for Equestrians
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                We understand the unique challenges of horse ownership. That's why we've created 
                a platform that combines traditional equestrian wisdom with modern technology.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Comprehensive Health Tracking</h3>
                    <p className="text-muted-foreground">Never miss a vaccination or vet appointment with automated reminders.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Smart Weather Integration</h3>
                    <p className="text-muted-foreground">AI-powered analysis tells you the best times to ride based on conditions.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Secure Document Storage</h3>
                    <p className="text-muted-foreground">Keep all important papers organized and accessible from anywhere.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img 
                src="/images/horse-stable.jpg" 
                alt="Horse in stable" 
                className="rounded-lg shadow-lg w-full h-48 object-cover"
              />
              <img 
                src="/images/training.jpg" 
                alt="Horse training" 
                className="rounded-lg shadow-lg w-full h-48 object-cover mt-8"
              />
              <img 
                src="/images/riding-lesson.jpg" 
                alt="Riding lesson" 
                className="rounded-lg shadow-lg w-full h-48 object-cover"
              />
              <img 
                src="/images/stable.jpg" 
                alt="Stable interior" 
                className="rounded-lg shadow-lg w-full h-48 object-cover mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-32 bg-secondary/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4" variant="secondary">Pricing</Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground text-lg">
              Start with a 7-day free trial. No credit card required. 
              Choose the plan that works best for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative card-hover ${plan.popular ? 'border-primary shadow-lg' : 'border-border/50'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="font-serif text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    {plan.originalPrice && (
                      <span className="text-muted-foreground line-through text-lg mr-2">
                        {plan.originalPrice}
                      </span>
                    )}
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                    {plan.savings && (
                      <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                        {plan.savings}
                      </Badge>
                    )}
                  </div>

                  <ul className="space-y-3 text-left mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-accent flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <a href={getLoginUrl()}>
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      Start Free Trial
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-muted-foreground mt-8">
            <Clock className="w-4 h-4 inline mr-2" />
            All plans include a 7-day free trial. Cancel anytime.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 lg:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">About Us</Badge>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
              Passionate About Horses, Dedicated to You
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              EquiProfile was born from a simple idea: horse care should be organized, 
              accessible, and stress-free. Our team of equestrians and technologists 
              have combined their expertise to create the ultimate horse management platform.
            </p>
            
            <div className="grid sm:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-2">250+</h3>
                <p className="text-muted-foreground">Active Users</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-2">1,000+</h3>
                <p className="text-muted-foreground">Horses Managed</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-2">99.9%</h3>
                <p className="text-muted-foreground">Uptime Guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-primary">
        <div className="container text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your Horse Care?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of horse owners who trust EquiProfile to manage their equine companions. 
            Start your free trial today.
          </p>
          <a href={getLoginUrl()}>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Start Your 7-Day Free Trial
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-serif font-bold">E</span>
                </div>
                <span className="font-serif text-lg font-semibold">EquiProfile</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Professional horse management for the modern equestrian.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} EquiProfile. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
