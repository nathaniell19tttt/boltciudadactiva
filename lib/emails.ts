import { supabase } from './supabase';

const EMAIL_FUNCTION_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/send-email`;

export type EmailType =
  | 'welcome'
  | 'verification'
  | 'password_reset'
  | 'application_received'
  | 'application_status'
  | 'interview_scheduled'
  | 'custom';

export interface WelcomeEmailData {
  userName: string;
  userRole: 'trabajador' | 'empresa';
}

export interface VerificationEmailData {
  userName: string;
  verificationCode: string;
}

export interface PasswordResetEmailData {
  userName: string;
  resetUrl: string;
}

export interface ApplicationEmailData {
  companyName: string;
  jobTitle: string;
  applicantName?: string;
  status?: 'accepted' | 'rejected';
}

export interface InterviewEmailData {
  companyName: string;
  jobTitle: string;
  dateTime: string;
  location?: string;
  notes?: string;
}

export interface SendEmailResult {
  success: boolean;
  error?: string;
  provider?: string;
}

interface EmailPayload {
  to: string | string[];
  type: EmailType;
  data?: any;
  customSubject?: string;
  customHtml?: string;
  customText?: string;
}

/**
 * Send an email using the Ciudad Activa email service.
 * Requires EMAIL_API_KEY to be configured in the edge function environment.
 */
export async function sendEmail(payload: EmailPayload): Promise<SendEmailResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    const response = await fetch(EMAIL_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Error enviando correo' };
    }

    return {
      success: true,
      provider: result.provider,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error de conexion' };
  }
}

/**
 * Send a welcome email to a new user.
 */
export async function sendWelcomeEmail(
  to: string,
  data: WelcomeEmailData
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    type: 'welcome',
    data,
  });
}

/**
 * Send a verification code email.
 */
export async function sendVerificationEmail(
  to: string,
  data: VerificationEmailData
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    type: 'verification',
    data,
  });
}

/**
 * Send a password reset email.
 */
export async function sendPasswordResetEmail(
  to: string,
  data: PasswordResetEmailData
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    type: 'password_reset',
    data,
  });
}

/**
 * Notify company of new application.
 */
export async function sendApplicationReceivedEmail(
  to: string,
  data: ApplicationEmailData
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    type: 'application_received',
    data,
  });
}

/**
 * Update applicant on application status.
 */
export async function sendApplicationStatusEmail(
  to: string,
  data: ApplicationEmailData & { status: 'accepted' | 'rejected' }
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    type: 'application_status',
    data,
  });
}

/**
 * Send interview scheduled email.
 */
export async function sendInterviewEmail(
  to: string,
  data: InterviewEmailData
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    type: 'interview_scheduled',
    data,
  });
}

/**
 * Send a custom email with your own content (wrapped in Ciudad Activa branding).
 */
export async function sendCustomEmail(
  to: string | string[],
  subject: string,
  htmlContent: string,
  textContent?: string
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    type: 'custom',
    customSubject: subject,
    customHtml: htmlContent,
    customText: textContent,
  });
}
