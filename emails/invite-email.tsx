import { Button, Heading, Section, Text } from "@react-email/components";
import { siteConfig } from "../lib/siteconfig";
import { EmailLayout } from "./components/email-layout";

interface InviteEmailProps {
  inviterName: string;
  workspaceName: string;
  inviteLink: string;
}

export function InviteEmail({
  inviterName,
  workspaceName,
  inviteLink,
}: InviteEmailProps) {
  return (
    <EmailLayout
      preview={`${inviterName} invited you to join ${workspaceName} on ${siteConfig.name}`}
    >
      <Heading style={heading}>You&apos;ve been invited!</Heading>

      <Text style={paragraph}>
        <strong>{inviterName}</strong> has invited you to join{" "}
        <strong>{workspaceName}</strong> on Proppi.
      </Text>

      <Section style={inviteBox}>
        <Text style={workspaceLabel}>Workspace</Text>
        <Text style={workspaceNameStyle}>{workspaceName}</Text>
        <Text style={invitedBy}>Invited by {inviterName}</Text>
      </Section>

      <Text style={paragraph}>
        Proppi is an AI-powered real estate photo editor that helps teams
        create stunning property listings with virtual staging, lighting
        enhancements, and more.
      </Text>

      <Section style={buttonContainer}>
        <Button href={inviteLink} style={button}>
          Accept Invitation
        </Button>
      </Section>

      <Text style={note}>
        This invitation link will expire in 7 days. If you weren&apos;t
        expecting this invitation, you can safely ignore this email.
      </Text>

      <Text style={signature}>
        Best,
        <br />
        The Proppi Team
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

const inviteBox = {
  backgroundColor: "#f6f9fc",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
  border: "1px solid #E5E7EB",
};

const workspaceLabel = {
  color: "#6B7280",
  fontSize: "12px",
  fontWeight: "500" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 8px",
};

const workspaceNameStyle = {
  color: "#1A1A1A",
  fontSize: "20px",
  fontWeight: "600" as const,
  margin: "0 0 8px",
};

const invitedBy = {
  color: "#6B7280",
  fontSize: "14px",
  margin: "0",
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

const note = {
  color: "#6B7280",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "24px 0 0",
};

const signature = {
  color: "#1A1A1A",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "32px 0 0",
};

export default InviteEmail;
