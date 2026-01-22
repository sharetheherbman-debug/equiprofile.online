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
                    <li>Document storage and organization</li>
                    <li>Calendar and event management</li>
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
                    EquiProfile offers a 7-day free trial for new users. After the trial:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>An active subscription is required for premium features</li>
                    <li>Plans are available monthly or yearly</li>
                    <li>You can cancel at any time</li>
                    <li>No refunds for partial periods unless required by law</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">5. User Content and Data</h2>
                  <p>
                    You retain ownership of all data you upload. By using the Service, you grant us a license to 
                    store, process, and display your content as necessary to provide the Service.
                  </p>
                  <p>
                    You are responsible for maintaining backups of your data.
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
                  <h2 className="text-2xl font-semibold mb-3">7. Intellectual Property</h2>
                  <p>
                    The Service and its original content, features, and functionality are owned by EquiProfile 
                    and protected by international copyright, trademark, and other intellectual property laws.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">8. Limitation of Liability</h2>
                  <p>
                    To the fullest extent permitted by law, EquiProfile shall not be liable for any indirect, 
                    incidental, special, consequential, or punitive damages arising from your use of the Service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">9. Termination</h2>
                  <p>
                    We may terminate or suspend your access to the Service at any time for any reason, including 
                    breach of these Terms. Upon termination, your right to use the Service will immediately cease.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">10. Governing Law</h2>
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of England and Wales, 
                    without regard to conflict of law provisions.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">11. Changes to Terms</h2>
                  <p>
                    We reserve the right to modify these Terms at any time. We will notify you of any material 
                    changes via email or through the Service. Your continued use after such changes constitutes 
                    acceptance of the new Terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">12. Contact Us</h2>
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
