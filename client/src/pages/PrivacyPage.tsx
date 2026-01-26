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
                    <li>Location data (if provided for weather features)</li>
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
                    <li>Provide AI-powered chat assistance through OpenAI's API</li>
                    <li>Display weather information relevant to your horses' locations</li>
                    <li>Respond to your enquiries</li>
                    <li>Improve and optimise the Service</li>
                    <li>Detect and prevent fraud</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">5. Third-Party Services and Information Sharing</h2>
                  <p>
                    We do not sell your personal information. We may share information with trusted third-party 
                    service providers who assist us in operating the Service:
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-2 mt-4">OpenAI (AI Chat Features)</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>When you use our AI chat feature, your queries and relevant horse data are sent to OpenAI's API for processing</li>
                    <li>OpenAI processes this data to generate responses and does not use API data to train their models</li>
                    <li>We only share the minimum information necessary for the AI to provide relevant assistance</li>
                    <li>OpenAI's privacy policy: <a href="https://openai.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">openai.com/privacy</a></li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-2 mt-4">Stripe (Payment Processing)</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>All payment information is processed securely by Stripe</li>
                    <li>We do not store your payment card details on our servers</li>
                    <li>Stripe's privacy policy: <a href="https://stripe.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a></li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-2 mt-4">Weather APIs</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Location data (if provided) is shared with weather API providers to retrieve relevant weather information</li>
                    <li>This data is used solely for providing weather forecasts and is not stored by us beyond caching for performance</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-2 mt-4">Cloud Storage</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Documents and images may be stored on Amazon S3 or similar secure cloud storage services</li>
                    <li>All stored files are encrypted and access is strictly controlled</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-2 mt-4">Other Sharing Situations</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                    <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">6. Data Storage and Security</h2>
                  <p>
                    We implement appropriate technical and organisational measures to protect your data, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Encryption of data in transit (HTTPS/TLS) and at rest</li>
                    <li>Secure password hashing using industry-standard algorithms</li>
                    <li>Regular security assessments and updates</li>
                    <li>Access controls and authentication requirements</li>
                    <li>Regular automated backups</li>
                    <li>Secure cloud storage with access logging</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold mb-2 mt-4">Data Storage Locations</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Database: Hosted on secure cloud infrastructure</li>
                    <li>Documents and images: Stored locally or on Amazon S3 with encryption</li>
                    <li>Session data: Stored securely with encrypted cookies</li>
                  </ul>

                  <p className="mt-3">
                    However, no method of transmission over the Internet is completely secure. Whilst we strive to 
                    protect your personal information, we cannot guarantee absolute security.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">7. Data Retention</h2>
                  <p>
                    We retain your personal information for as long as necessary to provide the Service and comply 
                    with legal obligations:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Active Accounts:</strong> Data is retained whilst your account remains active</li>
                    <li><strong>Account Deletion:</strong> Upon deletion, personal data is removed within 30 days</li>
                    <li><strong>Legal Requirements:</strong> Some data may be retained longer where required by law (e.g., payment records for tax purposes)</li>
                    <li><strong>Backups:</strong> Data in backups is deleted according to our backup rotation schedule (typically 90 days)</li>
                    <li><strong>AI Conversations:</strong> Chat history with AI is stored in your account and deleted when you delete conversations or your account</li>
                  </ul>
                  <p className="mt-3">
                    You can request deletion of your account and data at any time by contacting us.
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
                    To exercise these rights, contact us at: <a href="mailto:support@equiprofile.online" className="text-primary hover:underline">support@equiprofile.online</a>
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">9. Cookies and Local Storage</h2>
                  <p>We use cookies and local storage technologies to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Maintain your login session securely</li>
                    <li>Remember your preferences and settings</li>
                    <li>Store theme preferences (light/dark mode)</li>
                    <li>Analyse usage patterns to improve the Service</li>
                    <li>Cache data for improved performance</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold mb-2 mt-4">Types of Cookies</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality</li>
                    <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                    <li><strong>Analytics:</strong> Help us understand how you use the Service (if implemented)</li>
                  </ul>

                  <p className="mt-3">
                    You can control cookies through your browser settings. Note that disabling essential cookies 
                    may prevent you from using certain features of the Service.
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
                    Email: <a href="mailto:support@equiprofile.online" className="text-primary hover:underline">support@equiprofile.online</a>
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
