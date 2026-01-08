import { LegalPage, LegalSection } from "@/components/landing/legal-page";

export const metadata = {
  title: "Privacy Policy - Proppi",
  description: "How we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      lastUpdated="January 8, 2026"
      subtitle="How we collect, use, and protect your personal information"
      title="Privacy Policy"
    >
      <LegalSection title="1. Introduction">
        <p>
          Proppi (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is
          committed to protecting your privacy. This Privacy Policy explains how
          we collect, use, disclose, and safeguard your information when you use
          our AI-powered real estate photo enhancement service.
        </p>
        <p>
          By using Proppi, you agree to the collection and use of information
          in accordance with this policy. If you do not agree with our policies,
          please do not use our service.
        </p>
      </LegalSection>

      <LegalSection title="2. Information We Collect">
        <p>We collect information that you provide directly to us:</p>
        <ul className="ml-4 list-disc space-y-2">
          <li>
            <strong>Account Information:</strong> Name, email address, and
            password when you create an account.
          </li>
          <li>
            <strong>Payment Information:</strong> Billing details processed
            securely through our payment provider. We do not store your full
            credit card information.
          </li>
          <li>
            <strong>Images:</strong> Photos you upload for AI enhancement. These
            are processed and stored temporarily to deliver our service.
          </li>
          <li>
            <strong>Usage Data:</strong> Information about how you interact with
            our service, including features used and processing preferences.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How We Use Your Information">
        <p>We use the information we collect to:</p>
        <ul className="ml-4 list-disc space-y-2">
          <li>
            Provide, maintain, and improve our AI photo enhancement service
          </li>
          <li>Process your transactions and send related information</li>
          <li>Send you technical notices, updates, and support messages</li>
          <li>
            Respond to your comments, questions, and customer service requests
          </li>
          <li>Monitor and analyze trends, usage, and activities</li>
          <li>
            Detect, investigate, and prevent fraudulent or unauthorized activity
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Data Storage and Security">
        <p>
          Your data is stored securely on servers located in the European
          Economic Area (EEA). We implement appropriate technical and
          organizational measures to protect your personal information against
          unauthorized access, alteration, disclosure, or destruction.
        </p>
        <p>
          Uploaded images are stored temporarily for processing and delivery.
          You may request deletion of your images at any time through your
          account settings or by contacting us.
        </p>
      </LegalSection>

      <LegalSection title="5. Data Sharing">
        <p>
          We do not sell, trade, or rent your personal information to third
          parties. We may share your information only in the following
          circumstances:
        </p>
        <ul className="ml-4 list-disc space-y-2">
          <li>
            <strong>Service Providers:</strong> With third-party vendors who
            assist us in operating our service (e.g., cloud hosting, payment
            processing).
          </li>
          <li>
            <strong>Legal Requirements:</strong> When required by law or to
            respond to legal process.
          </li>
          <li>
            <strong>Business Transfers:</strong> In connection with a merger,
            acquisition, or sale of assets.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Your Rights (GDPR)">
        <p>
          Under the General Data Protection Regulation (GDPR), you have the
          following rights:
        </p>
        <ul className="ml-4 list-disc space-y-2">
          <li>
            <strong>Access:</strong> Request a copy of your personal data.
          </li>
          <li>
            <strong>Rectification:</strong> Request correction of inaccurate
            data.
          </li>
          <li>
            <strong>Erasure:</strong> Request deletion of your personal data.
          </li>
          <li>
            <strong>Portability:</strong> Request transfer of your data to
            another service.
          </li>
          <li>
            <strong>Objection:</strong> Object to processing of your personal
            data.
          </li>
          <li>
            <strong>Restriction:</strong> Request restriction of processing.
          </li>
        </ul>
        <p>
          To exercise any of these rights, please contact us at{" "}
          <a className="underline" href="mailto:privacy@proppi.tech">
            privacy@proppi.tech
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="7. Cookies">
        <p>
          We use essential cookies to maintain your session and preferences.
          Analytics cookies help us understand how visitors interact with our
          service. You can control cookie preferences through your browser
          settings.
        </p>
      </LegalSection>

      <LegalSection title="8. Data Retention">
        <p>
          We retain your account information for as long as your account is
          active. Uploaded images are retained for 30 days after processing to
          allow for re-downloads, after which they are automatically deleted.
          You may request earlier deletion at any time.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by posting the new Privacy Policy on this page and
          updating the &quot;Last updated&quot; date.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact Us">
        <p>
          If you have any questions about this Privacy Policy or our data
          practices, please contact us at:
        </p>
        <p className="mt-2">
          <strong>Proppi</strong>
          <br />
          Email:{" "}
          <a className="underline" href="mailto:privacy@proppi.tech">
            privacy@proppi.tech
          </a>
          <br />
          General inquiries:{" "}
          <a className="underline" href="mailto:hello@proppi.tech">
            hello@proppi.tech
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
