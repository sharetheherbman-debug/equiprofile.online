import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketingNav } from "@/components/MarketingNav";
import { PageTransition } from "@/components/PageTransition";
import { ScrollReveal, Stagger, StaggerItem } from "@/components/ScrollReveal";
import { Check } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

const plans = [
  {
    name: "Basic",
    description: "Perfect for individual horse owners",
    monthlyPrice: 9,
    annualPrice: 90,
    popular: false,
    features: [
      "Up to 3 horses",
      "Health records tracking",
      "Training logs",
      "Feeding schedules",
      "Document storage (5GB)",
      "Calendar & reminders",
      "Mobile app access",
      "Email support",
    ],
  },
  {
    name: "Pro",
    description: "For serious equestrians and trainers",
    monthlyPrice: 29,
    annualPrice: 290,
    popular: true,
    features: [
      "Unlimited horses",
      "Everything in Basic",
      "AI weather analysis",
      "Advanced analytics & reports",
      "Document storage (50GB)",
      "Team collaboration (5 users)",
      "Priority support",
      "Custom branding",
      "API access",
    ],
  },
  {
    name: "Enterprise",
    description: "For stables and professional facilities",
    monthlyPrice: 99,
    annualPrice: 990,
    popular: false,
    features: [
      "Unlimited horses & users",
      "Everything in Pro",
      "Document storage (500GB)",
      "Advanced team permissions",
      "Dedicated account manager",
      "24/7 phone support",
      "Custom integrations",
      "Training & onboarding",
      "SLA guarantee",
    ],
  },
];

const faqs = [
  {
    question: "Can I change plans later?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing accordingly.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for Enterprise plans.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! All new accounts get a 14-day free trial of the Pro plan with no credit card required. Cancel anytime before the trial ends.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer:
      "Your data is always yours. You can export all your information at any time, and we'll keep your account active for 30 days after cancellation in case you change your mind.",
  },
  {
    question: "Do you offer discounts for multiple horses?",
    answer:
      "Pro and Enterprise plans include unlimited horses, making them cost-effective for managing large stables. Contact us for volume pricing options.",
  },
  {
    question: "Can I add more team members?",
    answer:
      "Yes! Pro plans include 5 team members, and you can add more for $5/month each. Enterprise plans include unlimited team members.",
  },
];

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual");

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
                  Simple, Transparent{" "}
                  <span className="text-gradient">Pricing</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8">
                  Choose the perfect plan for your needs. All plans include a
                  14-day free trial.
                </p>

                {/* Billing toggle */}
                <div className="inline-flex items-center gap-3 p-1 bg-muted rounded-lg">
                  <button
                    onClick={() => setBillingPeriod("monthly")}
                    className={`px-6 py-2 rounded-md transition-all ${
                      billingPeriod === "monthly"
                        ? "bg-background shadow-sm font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingPeriod("annual")}
                    className={`px-6 py-2 rounded-md transition-all ${
                      billingPeriod === "annual"
                        ? "bg-background shadow-sm font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    Annual
                    <Badge className="ml-2" variant="secondary">
                      Save 17%
                    </Badge>
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* Pricing Cards */}
          <section className="container mx-auto px-4 mb-20">
            <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <StaggerItem key={index}>
                  <Card
                    className={`relative h-full flex flex-col ${
                      plan.popular
                        ? "border-2 border-primary shadow-xl scale-105"
                        : ""
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-0 right-0 flex justify-center">
                        <Badge className="px-4 py-1">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">
                          $
                          {billingPeriod === "monthly"
                            ? plan.monthlyPrice
                            : plan.annualPrice}
                        </span>
                        <span className="text-muted-foreground">
                          /{billingPeriod === "monthly" ? "month" : "year"}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Link href="/register" className="w-full">
                        <Button
                          className="w-full"
                          size="lg"
                          variant={plan.popular ? "default" : "outline"}
                        >
                          Start Free Trial
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </StaggerItem>
              ))}
            </Stagger>
          </section>

          {/* FAQ Section */}
          <section className="container mx-auto px-4">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold font-serif text-center mb-12">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <Card key={index} className="p-6">
                      <h3 className="text-lg font-semibold mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* Contact CTA */}
          <section className="container mx-auto px-4 mt-20">
            <ScrollReveal>
              <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2">
                <div className="text-center max-w-2xl mx-auto">
                  <h2 className="text-3xl font-bold font-serif mb-4">
                    Need a Custom Solution?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Contact our sales team for custom enterprise pricing and
                    features tailored to your organization.
                  </p>
                  <Link href="/contact">
                    <Button size="lg" variant="outline" className="text-lg">
                      Contact Sales
                    </Button>
                  </Link>
                </div>
              </Card>
            </ScrollReveal>
          </section>
        </div>
      </PageTransition>
    </>
  );
}
