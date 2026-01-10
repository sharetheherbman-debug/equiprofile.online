import { MarketingNav } from "@/components/MarketingNav";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";

export default function PrivacyPage() {
  return (
    <>
      <MarketingNav />
      <PageTransition>
        <div className="min-h-screen bg-background py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
              <p className="text-muted-foreground mb-12">Last updated: January 10, 2026</p>

              <div className="space-y-8 prose prose-slate dark:prose-invert max-w-none">
                <section>
                  <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
                  <p>
                    EquiProfile ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
                    explains how we collect, use, and protect your personal information in accordance with the UK GDPR 
                    and the Data Protection Act 2018.
                  </p>
                  <p>
                    If you do not agree with this policy, please do not use our Service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
                  
                  <h3 className="text-xl font-semibold mb-2 mt-4">Personal Information</h3>
                  <p>We collect information you provide, including:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Name and email address</li>
                    <li>Account credentials</li>
                    <li>Payment information (processed securely via Stripe)</li>
                    <li>Horse profiles and related data</li>
                    <li>Health records and training information</li>
                    <li>Documents you upload</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-2 mt-4">Automatically Collected Information</h3>
                  <p>We automatically collect:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Device and browser information</li>
                    <li>IP address</li>
                    <li>Usage data (pages viewed, features used)</li>
                    <li>Cookies and similar technologies</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">3. Legal Basis for Processing (UK GDPR)</h2>
                  <p>We process your personal data on the following legal bases:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Contract:</strong> Processing necessary to provide the Service</li>
                    <li><strong>Consent:</strong> Where you have given explicit consent</li>
                    <li><strong>Legitimate Interests:</strong> For improving our Service and business operations</li>
                    <li><strong>Legal Obligation:</strong> Where required by law</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">4. How We Use Your Information</h2>
                  <p>We use your information to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide and maintain the Service</li>
                    <li>Process transactions and manage subscriptions</li>
                    <li>Send transactional emails and reminders</li>
                    <li>Respond to your enquiries</li>
                    <li>Improve and optimize the Service</li>
                    <li>Detect and prevent fraud</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">5. Information Sharing</h2>
                  <p>
                    We do not sell your personal information. We may share information with:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Service Providers:</strong> Such as Stripe for payment processing and cloud hosting providers</li>
                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                    <li><strong>With Your Consent:</strong> When you explicitly agree</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">6. Data Security</h2>
                  <p>
                    We implement appropriate technical and organizational measures to protect your data, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Secure password hashing</li>
                    <li>Regular security assessments</li>
                    <li>Access controls and authentication</li>
                    <li>Regular backups</li>
                  </ul>
                  <p className="mt-3">
                    However, no method of transmission over the Internet is completely secure. We cannot guarantee 
                    absolute security.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">7. Data Retention</h2>
                  <p>
                    We retain your personal information for as long as necessary to provide the Service and comply 
                    with legal obligations. You can request deletion of your account and data at any time.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">8. Your Rights Under UK GDPR</h2>
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Access:</strong> Request a copy of your personal data</li>
                    <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
                    <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                    <li><strong>Restriction:</strong> Request restriction of processing</li>
                    <li><strong>Data Portability:</strong> Receive your data in a machine-readable format</li>
                    <li><strong>Object:</strong> Object to processing of your data</li>
                    <li><strong>Withdraw Consent:</strong> Where processing is based on consent</li>
                  </ul>
                  <p className="mt-3">
                    To exercise these rights, contact us at: <a href="mailto:support@equiprofile.com" className="text-primary hover:underline">support@equiprofile.com</a>
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">9. Cookies</h2>
                  <p>We use cookies and similar technologies to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Maintain your login session</li>
                    <li>Remember your preferences</li>
                    <li>Analyze usage patterns</li>
                  </ul>
                  <p className="mt-3">
                    You can control cookies through your browser settings.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">10. International Data Transfers</h2>
                  <p>
                    Your information may be processed in countries outside the UK. We ensure appropriate safeguards 
                    are in place for such transfers in accordance with UK GDPR requirements.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">11. Children's Privacy</h2>
                  <p>
                    The Service is not intended for children under 13 years of age. We do not knowingly collect 
                    personal information from children under 13.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">12. Changes to This Policy</h2>
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of material changes via 
                    email or through the Service. The "Last updated" date indicates when this policy was last revised.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">13. Contact Us</h2>
                  <p>
                    For questions about this Privacy Policy or to exercise your rights, contact us at:
                  </p>
                  <p>
                    Email: <a href="mailto:support@equiprofile.com" className="text-primary hover:underline">support@equiprofile.com</a>
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">14. Supervisory Authority</h2>
                  <p>
                    If you have concerns about how we handle your personal data, you have the right to lodge a 
                    complaint with the Information Commissioner's Office (ICO), the UK's supervisory authority for 
                    data protection.
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
