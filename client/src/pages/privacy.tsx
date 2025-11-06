import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600">Last updated: November 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              At desk.ai, operated by Guenther & Schwarz GbR ("we," "our," or
              "us"), we are committed to protecting your privacy and ensuring
              the security of your personal information. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our screen habit tracking application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Information We Collect
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              2.1 Personal Information
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may collect the following personal information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-6">
              <li>Email address (for account creation and communication)</li>
              <li>Name (optional, for personalization)</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Account preferences and settings</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              2.2 Usage Data
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect information about how you use our application:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-6">
              <li>Screen time data and usage patterns</li>
              <li>Application usage statistics</li>
              <li>Device information (operating system, browser type)</li>
              <li>IP address and general location data</li>
              <li>Crash reports and error logs</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              2.3 Technical Data
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We automatically collect certain technical information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Device identifiers and hardware information</li>
              <li>Network connection information</li>
              <li>Application performance metrics</li>
              <li>Security and authentication logs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                <strong>Service Provision:</strong> To provide and maintain our
                screen habit tracking service
              </li>
              <li>
                <strong>Personalization:</strong> To customize your experience
                and provide relevant insights
              </li>
              <li>
                <strong>Analytics:</strong> To analyze usage patterns and
                improve our application
              </li>
              <li>
                <strong>Communication:</strong> To send important updates,
                security alerts, and support messages
              </li>
              <li>
                <strong>Payment Processing:</strong> To process subscription
                payments and manage billing
              </li>
              <li>
                <strong>Security:</strong> To protect against fraud, abuse, and
                security threats
              </li>
              <li>
                <strong>Legal Compliance:</strong> To comply with applicable
                laws and regulations
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Data Sharing and Disclosure
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third
              parties. We may share your information in the following
              circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                <strong>Service Providers:</strong> With trusted third-party
                service providers who assist us in operating our service (e.g.,
                Stripe for payments, cloud hosting providers)
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to
                protect our rights and safety
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with a
                merger, acquisition, or sale of assets
              </li>
              <li>
                <strong>Consent:</strong> With your explicit consent for
                specific purposes
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Data Security
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to
              protect your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication measures</li>
              <li>Secure data centers and infrastructure</li>
              <li>Employee training on data protection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Data Retention
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain your personal information for as long as necessary to
              provide our services and fulfill the purposes outlined in this
              Privacy Policy:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                <strong>Account Data:</strong> Retained while your account is
                active and for a reasonable period after deletion
              </li>
              <li>
                <strong>Usage Data:</strong> Retained for analytics and service
                improvement purposes
              </li>
              <li>
                <strong>Payment Data:</strong> Retained as required by financial
                regulations
              </li>
              <li>
                <strong>Legal Requirements:</strong> Retained as required by
                applicable laws
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Your Rights and Choices
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                <strong>Access:</strong> Request access to your personal
                information
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate
                information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal
                information
              </li>
              <li>
                <strong>Portability:</strong> Request a copy of your data in a
                portable format
              </li>
              <li>
                <strong>Objection:</strong> Object to certain processing
                activities
              </li>
              <li>
                <strong>Withdrawal:</strong> Withdraw consent where processing
                is based on consent
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to enhance your
              experience:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                <strong>Essential Cookies:</strong> Required for basic
                functionality
              </li>
              <li>
                <strong>Analytics Cookies:</strong> Help us understand how users
                interact with our service
              </li>
              <li>
                <strong>Preference Cookies:</strong> Remember your settings and
                preferences
              </li>
              <li>
                <strong>Security Cookies:</strong> Help protect against fraud
                and abuse
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              You can control cookie settings through your browser preferences,
              though disabling certain cookies may affect service functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. International Data Transfers
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in countries
              other than your own. We ensure appropriate safeguards are in place
              to protect your data in accordance with applicable data protection
              laws, including the General Data Protection Regulation (GDPR).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Children's Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our service is not intended for children under the age of 13. We
              do not knowingly collect personal information from children under
              13. If you believe we have collected information from a child
              under 13, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the new Privacy
              Policy on this page and updating the "Last updated" date. We
              encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              12. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data
              practices, please contact:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                desk.ai (operated by Guenther & Schwarz GbR)
                <br />
                <strong>Address:</strong> Allacher Str. 118a, 80997, München
                <br />
                <strong>Email:</strong> contact@desk-ai.app
                <br />
                <strong>Website:</strong> https://desk-ai.app
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              For EU residents, you also have the right to lodge a complaint
              with your local data protection authority or with:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)
                <br />
                Promenade 18, 91522 Ansbach, Germany
                <br />
                <strong>Website:</strong> https://www.lda.bayern.de
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
