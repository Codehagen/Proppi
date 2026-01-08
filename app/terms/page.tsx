import { LegalPage, LegalSection } from "@/components/landing/legal-page";

export const metadata = {
  title: "Terms of Service - AI Studio",
  description: "Terms and conditions for using AI Studio services.",
};

export default function TermsPage() {
  return (
    <LegalPage
      lastUpdated="January 8, 2026"
      subtitle="Please read these terms carefully before using our service"
      title="Terms of Service"
    >
      <LegalSection title="1. Acceptance of Terms">
        <p>
          By accessing or using AI Studio (&quot;the Service&quot;), you agree
          to be bound by these Terms of Service. If you disagree with any part
          of these terms, you may not access the Service.
        </p>
        <p>
          These terms apply to all visitors, users, and others who access or use
          the Service.
        </p>
      </LegalSection>

      <LegalSection title="2. Description of Service">
        <p>
          AI Studio provides AI-powered photo enhancement and video creation
          services for real estate professionals. Our service allows you to
          upload property images, apply AI enhancements, and generate
          professional marketing materials.
        </p>
      </LegalSection>

      <LegalSection title="3. User Accounts">
        <p>
          To use certain features of the Service, you must register for an
          account. You agree to:
        </p>
        <ul className="ml-4 list-disc space-y-2">
          <li>Provide accurate, current, and complete information</li>
          <li>Maintain and promptly update your account information</li>
          <li>Maintain the security of your password and account</li>
          <li>Accept responsibility for all activities under your account</li>
          <li>Notify us immediately of any unauthorized use of your account</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Payment and Pricing">
        <p>
          AI Studio operates on a pay-per-use model. Current pricing is as
          follows:
        </p>
        <ul className="ml-4 list-disc space-y-2">
          <li>
            <strong>Photo Enhancement:</strong> 1000&nbsp;NOK per property (up
            to 20 images)
          </li>
          <li>
            <strong>Video Creation:</strong> 1000&nbsp;NOK per video
          </li>
        </ul>
        <p>
          Prices are subject to change with reasonable notice. All payments are
          processed securely through our payment provider. Payments are
          non-refundable except as outlined in our refund policy.
        </p>
      </LegalSection>

      <LegalSection title="5. Refund Policy">
        <p>
          If you are not satisfied with the results of our AI processing, you
          may request a refund within 24 hours of the processing completion.
          Refund requests should be submitted to{" "}
          <a className="underline" href="mailto:support@aistudio.no">
            support@aistudio.no
          </a>{" "}
          with your order details and reason for dissatisfaction.
        </p>
        <p>
          We reserve the right to deny refund requests that we determine, in our
          sole discretion, to be fraudulent or abusive.
        </p>
      </LegalSection>

      <LegalSection title="6. User Content">
        <p>
          You retain ownership of all images and content you upload to the
          Service.
        </p>
        <p>By uploading content, you grant us a limited license to:</p>
        <ul className="ml-4 list-disc space-y-2">
          <li>Process and enhance your images using our AI technology</li>
          <li>Store your content temporarily to deliver the Service</li>
          <li>Create derivative works (enhanced images) for your use</li>
        </ul>
        <p>
          You represent and warrant that you have all necessary rights to upload
          and use the content, and that your content does not violate any
          third-party rights.
        </p>
      </LegalSection>

      <LegalSection title="7. Intellectual Property">
        <p>
          The Service, including its original content, features, and
          functionality, is owned by AI Studio and is protected by international
          copyright, trademark, and other intellectual property laws.
        </p>
        <p>
          Enhanced images produced by our Service are owned by you, subject to
          any underlying rights in the original images.
        </p>
      </LegalSection>

      <LegalSection title="8. Prohibited Uses">
        <p>You agree not to use the Service to:</p>
        <ul className="ml-4 list-disc space-y-2">
          <li>Upload content that you do not have the right to use</li>
          <li>Upload illegal, harmful, or objectionable content</li>
          <li>
            Attempt to gain unauthorized access to any part of the Service
          </li>
          <li>Interfere with or disrupt the Service or servers</li>
          <li>Use the Service for any fraudulent or deceptive purposes</li>
          <li>Violate any applicable laws or regulations</li>
        </ul>
      </LegalSection>

      <LegalSection title="9. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, AI Studio shall not be liable
          for any indirect, incidental, special, consequential, or punitive
          damages, including loss of profits, data, or other intangible losses,
          resulting from:
        </p>
        <ul className="ml-4 list-disc space-y-2">
          <li>Your use or inability to use the Service</li>
          <li>Any unauthorized access to or use of our servers</li>
          <li>
            Any interruption or cessation of transmission to or from the Service
          </li>
          <li>
            Any bugs, viruses, or other harmful code transmitted through the
            Service
          </li>
        </ul>
        <p>
          Our total liability for any claims under these terms shall not exceed
          the amount you paid us in the 12 months preceding the claim.
        </p>
      </LegalSection>

      <LegalSection title="10. Disclaimer of Warranties">
        <p>
          The Service is provided &quot;as is&quot; and &quot;as available&quot;
          without warranties of any kind, either express or implied, including
          but not limited to implied warranties of merchantability, fitness for
          a particular purpose, and non-infringement.
        </p>
        <p>
          We do not warrant that the Service will be uninterrupted, secure, or
          error-free, or that any defects will be corrected.
        </p>
      </LegalSection>

      <LegalSection title="11. Termination">
        <p>
          We may terminate or suspend your account immediately, without prior
          notice, for any reason, including breach of these Terms. Upon
          termination, your right to use the Service will immediately cease.
        </p>
        <p>
          You may terminate your account at any time by contacting us. Upon
          termination, we will delete your account data in accordance with our
          Privacy Policy.
        </p>
      </LegalSection>

      <LegalSection title="12. Governing Law">
        <p>
          These Terms shall be governed by and construed in accordance with the
          laws of Norway, without regard to its conflict of law provisions. Any
          disputes arising from these Terms shall be resolved in the courts of
          Norway.
        </p>
      </LegalSection>

      <LegalSection title="13. Changes to Terms">
        <p>
          We reserve the right to modify or replace these Terms at any time. If
          a revision is material, we will provide at least 30 days&apos; notice
          prior to any new terms taking effect.
        </p>
        <p>
          By continuing to access or use our Service after revisions become
          effective, you agree to be bound by the revised terms.
        </p>
      </LegalSection>

      <LegalSection title="14. Contact Us">
        <p>
          If you have any questions about these Terms, please contact us at:
        </p>
        <p className="mt-2">
          <strong>AI Studio</strong>
          <br />
          Email:{" "}
          <a className="underline" href="mailto:legal@aistudio.no">
            legal@aistudio.no
          </a>
          <br />
          General inquiries:{" "}
          <a className="underline" href="mailto:hello@aistudio.no">
            hello@aistudio.no
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
