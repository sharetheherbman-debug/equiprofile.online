import { MarketingNav } from "@/components/MarketingNav";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <>
      <MarketingNav />
      <PageTransition>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-24">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
              <p className="text-muted-foreground mb-8">Last updated: January 5, 2026</p>

              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>1. Acceptance of Terms</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      By accessing and using EquiProfile ("the Service"), you accept and agree to be bound by the
                      terms and provision of this agreement. If you do not agree to these Terms of Service,
                      please do not use the Service.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>2. Description of Service</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      EquiProfile provides a comprehensive horse management platform that includes features for:
                    </p>
                    <ul>
                      <li>Horse profile management and tracking</li>
                      <li>Health records and vaccination tracking</li>
                      <li>Training session management</li>
                      <li>Feeding schedules and nutrition plans</li>
                      <li>Document storage and organization</li>
                      <li>Calendar and event management</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>3. User Accounts and Registration</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      To use certain features of the Service, you must register for an account. When you register, you agree to:
                    </p>
                    <ul>
                      <li>Provide accurate, current, and complete information</li>
                      <li>Maintain and promptly update your account information</li>
                      <li>Maintain the security of your password and accept all risks of unauthorized access</li>
                      <li>Immediately notify us of any unauthorized use of your account</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>4. Trial Period and Subscriptions</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      EquiProfile offers a 7-day free trial period for new users. After the trial period:
                    </p>
                    <ul>
                      <li>An active subscription is required to continue using premium features</li>
                      <li>Subscription plans are available on a monthly or yearly basis</li>
                      <li>Payment is due at the start of each billing cycle</li>
                      <li>You can cancel your subscription at any time</li>
                      <li>Refunds are handled on a case-by-case basis</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>5. User Content and Data</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      You retain all rights to the data and content you upload to the Service. By using the Service, you grant us:
                    </p>
                    <ul>
                      <li>A license to store, process, and display your content as necessary to provide the Service</li>
                      <li>You are responsible for maintaining backups of your data</li>
                      <li>We reserve the right to remove content that violates these terms</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>6. Acceptable Use</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      You agree not to use the Service to:
                    </p>
                    <ul>
                      <li>Violate any laws or regulations</li>
                      <li>Infringe on the rights of others</li>
                      <li>Transmit harmful or malicious code</li>
                      <li>Attempt to gain unauthorized access to the Service</li>
                      <li>Interfere with or disrupt the Service</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>7. Intellectual Property</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      The Service and its original content, features, and functionality are owned by EquiProfile
                      and are protected by international copyright, trademark, patent, trade secret, and other
                      intellectual property laws.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>8. Disclaimer of Warranties</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER
                      EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR
                      ERROR-FREE.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>9. Limitation of Liability</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      TO THE FULLEST EXTENT PERMITTED BY LAW, EQUIPROFILE SHALL NOT BE LIABLE FOR ANY INDIRECT,
                      INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR
                      USE OF THE SERVICE.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>10. Termination</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      We may terminate or suspend your account and access to the Service immediately, without
                      prior notice or liability, for any reason, including if you breach these Terms.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>11. Changes to Terms</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      We reserve the right to modify these terms at any time. We will notify users of any material
                      changes via email or through the Service. Your continued use of the Service after such
                      changes constitutes acceptance of the new terms.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>12. Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p>
                      If you have any questions about these Terms of Service, please contact us at:
                    </p>
                    <p>
                      <strong>Email:</strong> support@equiprofile.online<br />
                      <strong>Website:</strong> https://equiprofile.online
                    </p>
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
