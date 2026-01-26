import { MarketingNav } from "@/components/MarketingNav";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";

export default function TermsPage() {
  return (
    <>
      <MarketingNav />
      <PageTransition>
        <div className="min-h-screen bg-background py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
              <p className="text-muted-foreground mb-12">Last updated: January 10, 2026</p>

              <div className="space-y-8 prose prose-slate dark:prose-invert max-w-none">
                <section>
                  <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
                  <p>
                    By accessing and using EquiProfile ("the Service"), you agree to be bound by these Terms of Service. 
                    If you do not agree to these terms, please do not use the Service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">2. Description of Service</h2>
                  <p>
                    EquiProfile provides a comprehensive horse management platform including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Horse profile management and tracking</li>
                    <li>Health records and vaccination tracking</li>
                    <li>Training session management</li>
                    <li>Feeding schedules and nutrition plans</li>
                    <li>Document storage and organisation</li>
                    <li>Calendar and event management</li>
                    <li>Weather information integration</li>
                    <li>AI-powered chat assistance (powered by OpenAI)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">3. User Accounts</h2>
                  <p>
                    To use the Service, you must register for an account. You agree to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide accurate and current information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Accept responsibility for all activities under your account</li>
                    <li>Notify us immediately of any unauthorized access</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">4. Trial Period and Subscriptions</h2>
                  <p>
                    EquiProfile offers a 7-day free trial for new users. After the trial, you may choose from the following subscription plans:
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-2 mt-4">Subscription Plans</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Standard Plan:</strong> £10/month or £100/year - includes core features with usage-based AI features</li>
                    <li><strong>Stable Plan:</strong> £30/month or £300/year - includes unlimited AI features and priority support</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-2 mt-4">Subscription Terms</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>The 7-day free trial provides full access to all features</li>
                    <li>You will not be charged during the trial period</li>
                    <li>After the trial, an active subscription is required to continue using premium features</li>
                    <li>Subscriptions automatically renew at the end of each billing period</li>
                    <li>You can cancel at any time from your account settings</li>
                    <li>Cancellations take effect at the end of the current billing period</li>
                    <li>When your subscription expires, you retain read-only access to your data but cannot add or edit content</li>
                    <li>No refunds are provided for partial subscription periods unless required by law</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">5. User Content and Data</h2>
                  <p>
                    You retain ownership of all data you upload. By using the Service, you grant us a licence to 
                    store, process, and display your content as necessary to provide the Service.
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-2 mt-4">Data Storage</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Your data is stored securely in our database</li>
                    <li>Documents and images may be stored locally or on secure cloud storage (Amazon S3)</li>
                    <li>All data is encrypted in transit and at rest</li>
                    <li>You are responsible for maintaining backups of your data</li>
                    <li>We perform regular backups but recommend you keep your own copies of critical documents</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-2 mt-4">Data Retention</h3>
                  <p>
                    Your data remains accessible whilst your account is active. If you delete your account, 
                    your data will be permanently deleted within 30 days, except where we are required by law to retain it.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">6. Acceptable Use</h2>
                  <p>You agree not to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Infringe on intellectual property rights</li>
                    <li>Transmit malicious code or harmful content</li>
                    <li>Attempt unauthorized access to the Service</li>
                    <li>Interfere with or disrupt the Service</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">7. AI Features and Third-Party Services</h2>
                  <p>
                    EquiProfile uses third-party services to provide certain features:
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-2 mt-4">OpenAI Integration</h3>
                  <p>
                    Our AI chat feature is powered by OpenAI's API. When you use the AI chat:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Your queries and relevant horse data may be sent to OpenAI for processing</li>
                    <li>OpenAI processes this data in accordance with their privacy policy and terms</li>
                    <li>OpenAI has stated they do not use API data to train their models</li>
                    <li>We do not share personally identifiable information beyond what's necessary for the AI to function</li>
                    <li>You can review OpenAI's privacy policy at: <a href="https://openai.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">openai.com/privacy</a></li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-2 mt-4">Weather Services</h3>
                  <p>
                    Weather information is provided by third-party weather APIs. Location data (if provided) 
                    is used solely to retrieve relevant weather information for your horses' locations.
                  </p>

                  <h3 className="text-xl font-semibold mb-2 mt-4">Payment Processing</h3>
                  <p>
                    All payments are processed securely by Stripe. We do not store your payment card details. 
                    Stripe's processing is subject to their terms and privacy policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">8. Intellectual Property</h2>
                  <p>
                    The Service and its original content, features, and functionality are owned by EquiProfile 
                    and protected by international copyright, trademark, and other intellectual property laws.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">9. Limitation of Liability</h2>
                  <p>
                    To the fullest extent permitted by law, EquiProfile shall not be liable for any indirect, 
                    incidental, special, consequential, or punitive damages arising from your use of the Service.
                  </p>
                  <p className="mt-3">
                    The Service is provided for informational and management purposes. It is not a substitute for 
                    professional veterinary advice. Always consult qualified professionals for your horses' health 
                    and wellbeing.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">10. Termination</h2>
                  <p>
                    We may terminate or suspend your access to the Service at any time for any reason, including 
                    breach of these Terms. Upon termination, your right to use the Service will immediately cease.
                  </p>
                  <p className="mt-3">
                    You may terminate your account at any time through your account settings. Upon termination, 
                    you will lose access to the Service and your data will be scheduled for deletion in accordance 
                    with our data retention policies.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">11. Governing Law</h2>
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of England and Wales, 
                    without regard to conflict of law provisions.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">12. Changes to Terms</h2>
                  <p>
                    We reserve the right to modify these Terms at any time. We will notify you of any material 
                    changes via email or through the Service. Your continued use after such changes constitutes 
                    acceptance of the new Terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">13. Contact Us</h2>
                  <p>
                    If you have questions about these Terms, please contact us at:
                  </p>
                  <p>
                    Email: <a href="mailto:support@equiprofile.online" className="text-primary hover:underline">support@equiprofile.online</a>
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </PageTransition>
    </>
  );
}
