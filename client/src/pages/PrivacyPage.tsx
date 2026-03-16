import { MarketingLayout } from "@/components/MarketingLayout";
import { PageBanner } from "@/components/PageBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <div className="min-h-screen bg-black">
        <PageBanner
          title="Privacy Policy"
          subtitle="How we collect, use, and protect your personal information"
          imageSrc="/images/gallery/23.jpg"
          imagePosition="center"
        />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header with Last Updated */}
            <div className="mb-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold font-serif mb-4 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                EquiProfile Privacy Policy
              </h2>
              <p className="text-gray-400">
                Last updated:{" "}
                <span className="text-white">January 5, 2026</span>
              </p>
            </div>

            <div className="space-y-8">
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">
                    1. Introduction & Data Protection Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none">
                  <p className="text-gray-300">
                    EquiProfile ("we", "our", or "us") is committed to
                    protecting your privacy and ensuring the security of your
                    personal data. This Privacy Policy explains how we collect,
                    use, disclose, and safeguard your information when you use
                    our Service in compliance with the UK General Data
                    Protection Regulation (UK GDPR) and the Data Protection Act
                    2018.
                  </p>
                  <p className="text-gray-300">
                    Please read this privacy policy carefully. If you do not
                    agree with the terms of this privacy policy, please do not
                    access the Service.
                  </p>

                  <h4 className="text-white mt-4 mb-2 font-semibold">
                    Data Protection Summary
                  </h4>
                  <p className="text-gray-300">
                    As a data controller under UK GDPR, we:
                  </p>
                  <ul>
                    <li className="text-gray-300">
                      Only collect data necessary for providing our services
                    </li>
                    <li className="text-gray-300">
                      Process data lawfully, fairly, and transparently
                    </li>
                    <li className="text-gray-300">
                      Keep your data secure using industry-standard encryption
                    </li>
                    <li className="text-gray-300">
                      Respect your data protection rights
                    </li>
                    <li className="text-gray-300">
                      Do not sell your personal information to third parties
                    </li>
                    <li className="text-gray-300">
                      Retain data only as long as necessary
                    </li>
                  </ul>

                  <h4 className="text-white mt-4 mb-2 font-semibold">
                    Data Controller
                  </h4>
                  <p className="text-gray-300">
                    EquiProfile is the data controller responsible for your
                    personal data. For data protection queries, contact us at:
                    support@equiprofile.online
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">
                    2. Information We Collect
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none">
                  <h4 className="text-white mt-4 mb-2 font-semibold">
                    Personal Information
                  </h4>
                  <p className="text-gray-300">
                    We collect information that you voluntarily provide when
                    using the Service, including:
                  </p>
                  <ul>
                    <li className="text-gray-300">Name and email address</li>
                    <li className="text-gray-300">Account credentials</li>
                    <li className="text-gray-300">
                      Payment information (processed securely through Stripe)
                    </li>
                    <li className="text-gray-300">
                      Horse profiles and related data
                    </li>
                    <li className="text-gray-300">
                      Health records and training information
                    </li>
                    <li className="text-gray-300">Documents you upload</li>
                  </ul>

                  <h4 className="text-white mt-4 mb-2 font-semibold">
                    Automatically Collected Information
                  </h4>
                  <p className="text-gray-300">
                    When you access the Service, we automatically collect
                    certain information, including:
                  </p>
                  <ul>
                    <li className="text-gray-300">
                      Device information (browser type, operating system)
                    </li>
                    <li className="text-gray-300">
                      IP address and location data
                    </li>
                    <li className="text-gray-300">
                      Usage data (pages viewed, features used)
                    </li>
                    <li className="text-gray-300">
                      Cookies and similar tracking technologies
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">
                    3. How We Use Your Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none">
                  <p className="text-gray-300">
                    We use the information we collect to:
                  </p>
                  <ul>
                    <li className="text-gray-300">
                      Provide, maintain, and improve the Service
                    </li>
                    <li className="text-gray-300">
                      Process your transactions and manage subscriptions
                    </li>
                    <li className="text-gray-300">
                      Send you transactional emails (account updates, reminders)
                    </li>
                    <li className="text-gray-300">
                      Respond to your comments and questions
                    </li>
                    <li className="text-gray-300">
                      Monitor and analyze usage patterns
                    </li>
                    <li className="text-gray-300">
                      Detect and prevent fraud or abuse
                    </li>
                    <li className="text-gray-300">
                      Comply with legal obligations
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">
                    4. Information Sharing and Disclosure
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none">
                  <p className="text-gray-300">
                    We do not sell your personal information. We may share your
                    information in the following circumstances:
                  </p>
                  <ul>
                    <li className="text-gray-300">
                      <strong>Service Providers:</strong> We use third-party
                      services (Stripe for payments, cloud hosting providers)
                      who process data on our behalf
                    </li>
                    <li className="text-gray-300">
                      <strong>Legal Requirements:</strong> We may disclose
                      information if required by law or in response to valid
                      legal requests
                    </li>
                    <li className="text-gray-300">
                      <strong>Business Transfers:</strong> In the event of a
                      merger, acquisition, or sale of assets, your information
                      may be transferred
                    </li>
                    <li className="text-gray-300">
                      <strong>With Your Consent:</strong> We may share
                      information with your explicit permission
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">5. Data Security</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none">
                  <p className="text-gray-300">
                    We implement appropriate technical and organizational
                    measures to protect your personal information, including:
                  </p>
                  <ul>
                    <li className="text-gray-300">
                      Encryption of data in transit and at rest
                    </li>
                    <li className="text-gray-300">Secure password hashing</li>
                    <li className="text-gray-300">
                      Regular security assessments
                    </li>
                    <li className="text-gray-300">
                      Access controls and authentication
                    </li>
                    <li className="text-gray-300">Secure backup procedures</li>
                  </ul>
                  <p className="text-gray-300">
                    However, no method of transmission over the Internet is 100%
                    secure. While we strive to protect your information, we
                    cannot guarantee absolute security.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">
                    6. Data Retention
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none">
                  <p className="text-gray-300">
                    We retain your personal information for as long as necessary
                    to provide the Service and comply with legal obligations.
                    You can request deletion of your account and data at any
                    time.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">
                    7. Your Data Protection Rights (UK GDPR)
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none">
                  <p className="text-gray-300">
                    Under the UK GDPR, you have the following rights regarding
                    your personal data:
                  </p>

                  <h4 className="text-white mt-4 mb-2 font-semibold">
                    Right of Access (Subject Access Request)
                  </h4>
                  <p className="text-gray-300">
                    You have the right to request a copy of the personal
                    information we hold about you. We will provide this within
                    one month of your request, free of charge.
                  </p>

                  <h4 className="text-white mt-4 mb-2 font-semibold">
                    Right to Rectification
                  </h4>
                  <p className="text-gray-300">
                    You have the right to request correction of inaccurate or
                    incomplete personal information. You can update most
                    information directly through your account settings.
                  </p>

                  <h4 className="text-white mt-4 mb-2 font-semibold">
                    Right to Erasure ("Right to be Forgotten")
                  </h4>
                  <p className="text-gray-300">
                    You have the right to request deletion of your personal
                    information in certain circumstances, including when:
                  </p>
                  <ul>
                    <li className="text-gray-300">
                      The data is no longer necessary for the purpose it was
                      collected
                    </li>
                    <li className="text-gray-300">
                      You withdraw consent and there is no other legal basis for
                      processing
                    </li>
                    <li className="text-gray-300">
                      You object to processing and there are no overriding
                      legitimate grounds
                    </li>
                    <li className="text-gray-300">
                      The data has been unlawfully processed
                    </li>
                  </ul>

                  <h4 className="text-white mt-4 mb-2 font-semibold">
                    Right to Restriction of Processing
                  </h4>
                  <p className="text-gray-300">
                    You have the right to request that we restrict processing of
                    your personal data in certain circumstances, such as when
                    you contest the accuracy of the data.
                  </p>

                  <h4 className="text-white mt-4 mb-2 font-semibold">
                    Right to Data Portability
                  </h4>
                  <p className="text-gray-300">
                    You have the right to receive your personal data in a
                    structured, commonly used, machine-readable format and
                    transmit it to another controller.
                  </p>

                  <h4 className="text-white mt-4 mb-2 font-semibold">
                    Right to Object
                  </h4>
                  <p className="text-gray-300">
                    You have the right to object to processing of your personal
                    data based on legitimate interests or for direct marketing
                    purposes at any time.
                  </p>

                  <h4 className="text-white mt-4 mb-2 font-semibold">
                    Right to Withdraw Consent
                  </h4>
                  <p className="text-gray-300">
                    Where we process your data based on consent, you have the
                    right to withdraw that consent at any time.
                  </p>

                  <h4 className="text-white mt-4 mb-2 font-semibold">
                    Right to Lodge a Complaint
                  </h4>
                  <p className="text-gray-300">
                    You have the right to lodge a complaint with the Information
                    Commissioner's Office (ICO), the UK's data protection
                    supervisory authority:
                  </p>
                  <ul>
                    <li className="text-gray-300">
                      Website:{" "}
                      <a
                        href="https://ico.org.uk"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        https://ico.org.uk
                      </a>
                    </li>
                    <li className="text-gray-300">Helpline: 0303 123 1113</li>
                  </ul>

                  <h4 className="text-white mt-4 mb-2 font-semibold">
                    Exercising Your Rights
                  </h4>
                  <p className="text-gray-300">
                    To exercise any of these rights, please contact us at:
                    <br />
                    <strong>Email:</strong> support@equiprofile.online
                    <br />
                    <strong>WhatsApp:</strong> +44 7347 258089
                  </p>
                  <p className="text-gray-300">
                    We will respond to your request within one month. In some
                    cases, we may need to verify your identity before processing
                    your request.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">
                    8. Cookies Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none">
                  <h4 className="text-white mt-4 mb-2 font-semibold">
                    What Are Cookies?
                  </h4>
                  <p className="text-gray-300">
                    Cookies are small text files stored on your device when you
                    visit our Service. They help us provide you with a better
                    experience by remembering your preferences and settings.
                  </p>

                  <h4 className="text-white mt-4 mb-2 font-semibold">
                    Types of Cookies We Use
                  </h4>

                  <p className="text-gray-300">
                    <strong>Essential Cookies (Strictly Necessary)</strong>
                  </p>
                  <p className="text-gray-300">
                    These cookies are necessary for the Service to function and
                    cannot be disabled. They include:
                  </p>
                  <ul>
                    <li className="text-gray-300">
                      Session cookies to maintain your login state
                    </li>
                    <li className="text-gray-300">
                      Security cookies to prevent fraud and secure access
                    </li>
                    <li className="text-gray-300">
                      Load balancing cookies for optimal performance
                    </li>
                  </ul>

                  <p className="text-gray-300">
                    <strong>Functional Cookies</strong>
                  </p>
                  <p className="text-gray-300">
                    These cookies remember your preferences and choices:
                  </p>
                  <ul>
                    <li className="text-gray-300">
                      Theme preferences (light/dark mode)
                    </li>
                    <li className="text-gray-300">Language settings</li>
                    <li className="text-gray-300">Display preferences</li>
                  </ul>

                  <p className="text-gray-300">
                    <strong>Analytics Cookies</strong>
                  </p>
                  <p className="text-gray-300">
                    These cookies help us understand how visitors use our
                    Service:
                  </p>
                  <ul>
                    <li className="text-gray-300">
                      Usage patterns and popular features
                    </li>
                    <li className="text-gray-300">Performance monitoring</li>
                    <li className="text-gray-300">
                      Error tracking and diagnostics
                    </li>
                  </ul>

                  <h4 className="text-white mt-4 mb-2 font-semibold">
                    Managing Cookies
                  </h4>
                  <p className="text-gray-300">
                    You can control and manage cookies through your browser
                    settings. Most browsers allow you to:
                  </p>
                  <ul>
                    <li className="text-gray-300">View and delete cookies</li>
                    <li className="text-gray-300">Block third-party cookies</li>
                    <li className="text-gray-300">
                      Block cookies from specific sites
                    </li>
                    <li className="text-gray-300">
                      Clear all cookies when you close your browser
                    </li>
                  </ul>

                  <p className="font-semibold mt-4">
                    Please note: Disabling certain cookies may affect the
                    functionality of the Service. Essential cookies cannot be
                    disabled as they are required for the Service to work.
                  </p>

                  <h4 className="text-white mt-4 mb-2 font-semibold">
                    Third-Party Cookies
                  </h4>
                  <p className="text-gray-300">
                    We use limited third-party services that may set cookies:
                  </p>
                  <ul>
                    <li className="text-gray-300">
                      Stripe for payment processing
                    </li>
                    <li className="text-gray-300">
                      Cloud hosting providers for infrastructure
                    </li>
                  </ul>
                  <p className="text-gray-300">
                    These third parties have their own privacy policies and
                    cookie policies.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">
                    9. Children's Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none">
                  <p className="text-gray-300">
                    The Service is not intended for children under 13 years of
                    age. We do not knowingly collect personal information from
                    children under 13. If you believe we have collected
                    information from a child under 13, please contact us
                    immediately.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">
                    10. International Data Transfers
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none">
                  <p className="text-gray-300">
                    Your information may be transferred to and processed in
                    countries other than your country of residence. These
                    countries may have different data protection laws. By using
                    the Service, you consent to such transfers.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">
                    11. Changes to This Privacy Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none">
                  <p className="text-gray-300">
                    We may update this Privacy Policy from time to time. We will
                    notify you of any material changes by email or through a
                    notice on the Service. The "Last updated" date at the top
                    indicates when this policy was last revised.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">12. Contact Us</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none">
                  <p className="text-gray-300">
                    If you have questions or concerns about this Privacy Policy,
                    wish to exercise your data protection rights, or need to
                    report a data protection concern, please contact us:
                  </p>
                  <p className="text-gray-300">
                    <strong>Email:</strong> support@equiprofile.online
                    <br />
                    <strong>WhatsApp:</strong> +44 7347 258089
                    <br />
                    <strong>Website:</strong> https://equiprofile.online
                  </p>
                  <p className="text-gray-300">
                    We aim to respond to all queries within 48 hours and subject
                    access requests within one month as required by UK GDPR.
                  </p>

                  <h4 className="text-white mt-4 mb-2 font-semibold">
                    Supervisory Authority
                  </h4>
                  <p className="text-gray-300">
                    If you are not satisfied with our response or believe we are
                    processing your data unlawfully, you have the right to lodge
                    a complaint with the Information Commissioner's Office
                    (ICO):
                  </p>
                  <p className="text-gray-300">
                    <strong>Information Commissioner's Office</strong>
                    <br />
                    Wycliffe House, Water Lane
                    <br />
                    Wilmslow, Cheshire SK9 5AF
                    <br />
                    <strong>Website:</strong>{" "}
                    <a
                      href="https://ico.org.uk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      https://ico.org.uk
                    </a>
                    <br />
                    <strong>Helpline:</strong> 0303 123 1113
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">
                    13. UK GDPR Compliance & Legal Basis for Processing
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-invert max-w-none">
                  <p className="text-gray-300">
                    We comply with the UK General Data Protection Regulation (UK
                    GDPR) and the Data Protection Act 2018. This Privacy Policy
                    is governed by the laws of England and Wales.
                  </p>

                  <h4 className="text-white mt-4 mb-2 font-semibold">
                    Legal Basis for Processing Your Personal Data
                  </h4>
                  <p className="text-gray-300">
                    Under UK GDPR, we must have a legal basis to process your
                    personal data. We process your data based on:
                  </p>

                  <p className="text-gray-300">
                    <strong>1. Contract Performance</strong>
                  </p>
                  <p className="text-gray-300">
                    Processing necessary to provide the Service you've
                    requested, including:
                  </p>
                  <ul>
                    <li className="text-gray-300">
                      Creating and managing your account
                    </li>
                    <li className="text-gray-300">
                      Providing horse management features
                    </li>
                    <li className="text-gray-300">
                      Processing payments and managing subscriptions
                    </li>
                    <li className="text-gray-300">
                      Communicating about your account and service updates
                    </li>
                  </ul>

                  <p className="text-gray-300">
                    <strong>2. Consent</strong>
                  </p>
                  <p className="text-gray-300">
                    Where you have given explicit consent, such as:
                  </p>
                  <ul>
                    <li className="text-gray-300">Marketing communications</li>
                    <li className="text-gray-300">
                      Optional analytics and tracking
                    </li>
                    <li className="text-gray-300">
                      Specific data processing activities requiring consent
                    </li>
                  </ul>
                  <p className="text-gray-300">
                    You can withdraw your consent at any time through your
                    account settings or by contacting us.
                  </p>

                  <p className="text-gray-300">
                    <strong>3. Legitimate Interests</strong>
                  </p>
                  <p className="text-gray-300">
                    Processing necessary for our legitimate business interests,
                    including:
                  </p>
                  <ul>
                    <li className="text-gray-300">
                      Improving and developing the Service
                    </li>
                    <li className="text-gray-300">
                      Detecting and preventing fraud and security threats
                    </li>
                    <li className="text-gray-300">
                      Understanding how users interact with our Service
                    </li>
                    <li className="text-gray-300">
                      Internal analytics and business intelligence
                    </li>
                  </ul>
                  <p className="text-gray-300">
                    We only rely on legitimate interests when they are not
                    overridden by your data protection rights.
                  </p>

                  <p className="text-gray-300">
                    <strong>4. Legal Obligation</strong>
                  </p>
                  <p className="text-gray-300">
                    Processing required to comply with legal obligations,
                    including:
                  </p>
                  <ul>
                    <li className="text-gray-300">
                      Complying with tax and accounting requirements
                    </li>
                    <li className="text-gray-300">
                      Responding to legal requests and court orders
                    </li>
                    <li className="text-gray-300">
                      Preventing money laundering and fraud
                    </li>
                    <li className="text-gray-300">
                      Maintaining records required by law
                    </li>
                  </ul>

                  <h4 className="text-white mt-4 mb-2 font-semibold">
                    International Data Transfers
                  </h4>
                  <p className="text-gray-300">
                    Your data is primarily stored and processed in the UK. Where
                    we transfer data outside the UK, we ensure appropriate
                    safeguards are in place, including:
                  </p>
                  <ul>
                    <li className="text-gray-300">
                      Standard Contractual Clauses (SCCs) approved by the UK ICO
                    </li>
                    <li className="text-gray-300">
                      Adequacy decisions recognizing equivalent data protection
                    </li>
                    <li className="text-gray-300">
                      Other approved transfer mechanisms under UK GDPR
                    </li>
                  </ul>

                  <h4 className="text-white mt-4 mb-2 font-semibold">
                    Data Protection Officer
                  </h4>
                  <p className="text-gray-300">
                    For data protection queries, contact our team at:
                    support@equiprofile.online
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
