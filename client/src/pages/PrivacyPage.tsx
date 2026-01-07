import { MarketingNav } from "@/components/MarketingNav";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <>
      <MarketingNav />
      <PageTransition>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-24">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
              <p className="text-muted-foreground mb-8">Last updated: January 5, 2026</p>

              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>1. Introduction</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      EquiProfile ("we", "our", or "us") is committed to protecting your privacy. This Privacy
                      Policy explains how we collect, use, disclose, and safeguard your information when you use
                      our Service.
                    </p>
                    <p>
                      Please read this privacy policy carefully. If you do not agree with the terms of this
                      privacy policy, please do not access the Service.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>2. Information We Collect</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <h4>Personal Information</h4>
                    <p>
                      We collect information that you voluntarily provide when using the Service, including:
                    </p>
                    <ul>
                      <li>Name and email address</li>
                      <li>Account credentials</li>
                      <li>Payment information (processed securely through Stripe)</li>
                      <li>Horse profiles and related data</li>
                      <li>Health records and training information</li>
                      <li>Documents you upload</li>
                    </ul>

                    <h4>Automatically Collected Information</h4>
                    <p>
                      When you access the Service, we automatically collect certain information, including:
                    </p>
                    <ul>
                      <li>Device information (browser type, operating system)</li>
                      <li>IP address and location data</li>
                      <li>Usage data (pages viewed, features used)</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>3. How We Use Your Information</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      We use the information we collect to:
                    </p>
                    <ul>
                      <li>Provide, maintain, and improve the Service</li>
                      <li>Process your transactions and manage subscriptions</li>
                      <li>Send you transactional emails (account updates, reminders)</li>
                      <li>Respond to your comments and questions</li>
                      <li>Monitor and analyze usage patterns</li>
                      <li>Detect and prevent fraud or abuse</li>
                      <li>Comply with legal obligations</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>4. Information Sharing and Disclosure</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      We do not sell your personal information. We may share your information in the following
                      circumstances:
                    </p>
                    <ul>
                      <li><strong>Service Providers:</strong> We use third-party services (Stripe for payments,
                        cloud hosting providers) who process data on our behalf</li>
                      <li><strong>Legal Requirements:</strong> We may disclose information if required by law or
                        in response to valid legal requests</li>
                      <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of
                        assets, your information may be transferred</li>
                      <li><strong>With Your Consent:</strong> We may share information with your explicit permission</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>5. Data Security</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      We implement appropriate technical and organizational measures to protect your personal
                      information, including:
                    </p>
                    <ul>
                      <li>Encryption of data in transit and at rest</li>
                      <li>Secure password hashing</li>
                      <li>Regular security assessments</li>
                      <li>Access controls and authentication</li>
                      <li>Secure backup procedures</li>
                    </ul>
                    <p>
                      However, no method of transmission over the Internet is 100% secure. While we strive to
                      protect your information, we cannot guarantee absolute security.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>6. Data Retention</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      We retain your personal information for as long as necessary to provide the Service and
                      comply with legal obligations. You can request deletion of your account and data at any time.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>7. Your Privacy Rights</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      Depending on your location, you may have certain rights regarding your personal information:
                    </p>
                    <ul>
                      <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                      <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                      <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                      <li><strong>Data Portability:</strong> Request a copy of your data in a machine-readable format</li>
                      <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails</li>
                      <li><strong>Object:</strong> Object to processing of your information</li>
                    </ul>
                    <p>
                      To exercise these rights, please contact us at privacy@equiprofile.online
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>8. Cookies and Tracking</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      We use cookies and similar tracking technologies to:
                    </p>
                    <ul>
                      <li>Maintain your login session</li>
                      <li>Remember your preferences</li>
                      <li>Analyze usage patterns</li>
                      <li>Improve the Service</li>
                    </ul>
                    <p>
                      You can control cookies through your browser settings, but disabling cookies may affect
                      functionality of the Service.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>9. Children's Privacy</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      The Service is not intended for children under 13 years of age. We do not knowingly collect
                      personal information from children under 13. If you believe we have collected information
                      from a child under 13, please contact us immediately.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>10. International Data Transfers</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      Your information may be transferred to and processed in countries other than your country of
                      residence. These countries may have different data protection laws. By using the Service,
                      you consent to such transfers.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>11. Changes to This Privacy Policy</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      We may update this Privacy Policy from time to time. We will notify you of any material
                      changes by email or through a notice on the Service. The "Last updated" date at the top
                      indicates when this policy was last revised.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>12. Contact Us</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      If you have questions or concerns about this Privacy Policy, please contact us at:
                    </p>
                    <p>
                      <strong>Email:</strong> privacy@equiprofile.online<br />
                      <strong>Support:</strong> support@equiprofile.online<br />
                      <strong>Website:</strong> https://equiprofile.online
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>13. GDPR Compliance (European Users)</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      If you are located in the European Economic Area (EEA), we process your personal data based
                      on the following legal grounds:
                    </p>
                    <ul>
                      <li><strong>Contract:</strong> Processing necessary to provide the Service you've requested</li>
                      <li><strong>Consent:</strong> You have given explicit consent</li>
                      <li><strong>Legitimate Interests:</strong> Processing necessary for our legitimate business interests</li>
                      <li><strong>Legal Obligation:</strong> Processing required by law</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </PageTransition>
    </>
  );
}
