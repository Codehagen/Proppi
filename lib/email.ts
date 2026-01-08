import { Resend } from "resend";
import { InviteEmail } from "../emails/invite-email";
import { WelcomeEmail } from "../emails/welcome-email";
import { siteConfig } from "./siteconfig";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, name: string) {
  const { data, error } = await resend.emails.send({
    from: siteConfig.email.from,
    to,
    subject: `Welcome to ${siteConfig.name}!`,
    react: WelcomeEmail({ name }),
  });

  if (error) {
    console.error("Failed to send welcome email:", error);
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }

  return data;
}

export async function sendInviteEmail(
  to: string,
  inviterName: string,
  workspaceName: string,
  inviteLink: string
) {
  const { data, error } = await resend.emails.send({
    from: siteConfig.email.from,
    to,
    subject: `${inviterName} invited you to join ${workspaceName} on ${siteConfig.name}`,
    react: InviteEmail({ inviterName, workspaceName, inviteLink }),
  });

  if (error) {
    console.error("Failed to send invite email:", error);
    throw new Error(`Failed to send invite email: ${error.message}`);
  }

  return data;
}
