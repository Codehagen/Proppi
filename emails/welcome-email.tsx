import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./components/email-layout";
import { siteConfig } from "../lib/siteconfig";

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  const dashboardUrl = `${siteConfig.url}${siteConfig.links.dashboard}`;

  return (
    <EmailLayout preview={`Welcome to ${siteConfig.name}, ${name}!`}>
      <Heading style={heading}>Welcome to AI Studio!</Heading>

      <Text style={paragraph}>Hi {name},</Text>

      <Text style={paragraph}>
        Thanks for signing up for AI Studio. We&apos;re excited to have you on
        board!
      </Text>

      <Text style={paragraph}>
        With AI Studio, you can transform your real estate photos with
        AI-powered enhancements:
      </Text>

      <Section style={features}>
        <Text style={featureItem}>
          <strong>Virtual Staging</strong> - Add furniture to empty rooms
        </Text>
        <Text style={featureItem}>
          <strong>Lighting Enhancement</strong> - Perfect natural and artificial
          lighting
        </Text>
        <Text style={featureItem}>
          <strong>Decluttering</strong> - Remove personal items and organize
          spaces
        </Text>
        <Text style={featureItem}>
          <strong>Exterior Improvements</strong> - Enhance curb appeal and
          landscaping
        </Text>
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={dashboardUrl}>
          Go to Dashboard
        </Button>
      </Section>

      <Text style={paragraph}>
        If you have any questions, feel free to reach out to our support team.
      </Text>

      <Text style={signature}>
        Best,
        <br />
        The AI Studio Team
      </Text>
    </EmailLayout>
  );
}

// Styles
const heading = {
  color: "#1A1A1A",
  fontSize: "24px",
  fontWeight: "600" as const,
  lineHeight: "32px",
  margin: "0 0 24px",
};

const paragraph = {
  color: "#1A1A1A",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 16px",
};

const features = {
  backgroundColor: "#f6f9fc",
  borderRadius: "8px",
  padding: "20px 24px",
  margin: "24px 0",
};

const featureItem = {
  color: "#1A1A1A",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "8px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#3B9B9B",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600" as const,
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const signature = {
  color: "#1A1A1A",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "32px 0 0",
};

export default WelcomeEmail;
