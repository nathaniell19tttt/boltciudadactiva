import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const LOGO_STYLE = `
  display:inline-block;
  width:56px;height:56px;
  background:linear-gradient(135deg,#1976D2,#E65100);
  border-radius:50%;
  text-align:center;line-height:56px;
  font-size:24px;color:#fff;font-weight:800;
`;

function buildBaseEmail(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F4F6F9;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F6F9;padding:40px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#1565C0 0%,#1976D2 100%);padding:32px 40px;text-align:center;">
    <div style="${LOGO_STYLE}">CA</div>
    <h1 style="margin:16px 0 4px;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:0.5px;">Ciudad Activa</h1>
    <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;">Conectando talento y oportunidades</p>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:36px 40px;">
    ${body}
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #E8EAED;text-align:center;">
      <p style="margin:0;color:#9E9E9E;font-size:12px;line-height:1.6;">
        © Ciudad Activa – Todos los derechos reservados.<br/>
        Lima Norte, Peru
      </p>
    </div>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export interface EmailPayload {
  to: string | string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  type: 'welcome' | 'verification' | 'password_reset' | 'application_received' | 'application_status' | 'interview_scheduled' | 'custom';
}

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
}

export interface InterviewEmailData {
  companyName: string;
  jobTitle: string;
  dateTime: string;
  location?: string;
  notes?: string;
}

function generateWelcomeEmail(data: WelcomeEmailData): { subject: string; html: string; text: string } {
  const roleText = data.userRole === 'trabajador' ? 'trabajador' : 'empresa';
  const roleGreeting = data.userRole === 'trabajador'
    ? 'Podras encontrar ofertas laborales, postular a vacantes, tomar cursos y participar en eventos.'
    : 'Podras publicar vacantes, encontrar talento y gestionar postulaciones para tu empresa.';

  const html = buildBaseEmail('Bienvenido a Ciudad Activa', `
    <p style="margin:0 0 8px;color:#424242;font-size:16px;">Hola, <strong>${data.userName}</strong>,</p>
    <p style="margin:0 0 24px;color:#424242;font-size:15px;line-height:1.6;">
      ¡Te damos la bienvenida a <strong>Ciudad Activa</strong>! Tu cuenta de ${roleText} ha sido creada exitosamente.
    </p>
    <p style="margin:0 0 24px;color:#424242;font-size:15px;line-height:1.6;">
      ${roleGreeting}
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="https://ciudadactiva.pe/app"
         style="display:inline-block;background:#1976D2;color:#ffffff;text-decoration:none;
                padding:14px 36px;border-radius:27px;font-size:16px;font-weight:700;
                box-shadow:0 4px 12px rgba(25,118,210,0.35);">
        Comenzar ahora
      </a>
    </div>
    <p style="margin:0;color:#9E9E9E;font-size:12px;">
      Si no creaste esta cuenta, puedes ignorar este correo de forma segura.
    </p>
  `);

  return {
    subject: 'Ciudad Activa – ¡Bienvenido!',
    html,
    text: `Hola ${data.userName}, Bienvenido a Ciudad Activa. Tu cuenta ha sido creada exitosamente. Visita ciudadactiva.pe para comenzar.`,
  };
}

function generateVerificationEmail(data: VerificationEmailData): { subject: string; html: string; text: string } {
  const html = buildBaseEmail('Ciudad Activa – Verifica tu correo', `
    <p style="margin:0 0 8px;color:#424242;font-size:16px;">Hola, <strong>${data.userName}</strong>,</p>
    <p style="margin:0 0 24px;color:#424242;font-size:15px;line-height:1.6;">
      Para completar el registro, verifica tu direccion de correo electronico con el siguiente codigo:
    </p>
    <div style="background:#EEF4FF;border:2px solid #1976D2;border-radius:14px;padding:28px;text-align:center;margin:0 0 24px;">
      <span style="font-size:40px;font-weight:900;letter-spacing:10px;color:#1565C0;font-family:monospace;">${data.verificationCode}</span>
    </div>
    <p style="margin:0 0 8px;color:#757575;font-size:13px;">
      Este codigo tiene una vigencia de <strong>10 minutos</strong>.
    </p>
    <p style="margin:0;color:#9E9E9E;font-size:12px;">
      Si no solicitaste este codigo, puedes ignorar este correo de forma segura.
    </p>
  `);

  return {
    subject: 'Ciudad Activa – Codigo de verificacion',
    html,
    text: `Hola ${data.userName}, Tu codigo de verificacion es: ${data.verificationCode}. Este codigo expira en 10 minutos.`,
  };
}

function generatePasswordResetEmail(data: PasswordResetEmailData): { subject: string; html: string; text: string } {
  const html = buildBaseEmail('Ciudad Activa – Recupera tu contrasena', `
    <p style="margin:0 0 8px;color:#424242;font-size:16px;">Hola, <strong>${data.userName}</strong>,</p>
    <p style="margin:0 0 24px;color:#424242;font-size:15px;line-height:1.6;">
      Recibimos una solicitud para restablecer la contrasena de tu cuenta en <strong>Ciudad Activa</strong>.
      Haz clic en el boton a continuacion para crear una nueva contrasena:
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${data.resetUrl}"
         style="display:inline-block;background:#1976D2;color:#ffffff;text-decoration:none;
                padding:14px 36px;border-radius:27px;font-size:16px;font-weight:700;
                box-shadow:0 4px 12px rgba(25,118,210,0.35);">
        Restablecer contrasena
      </a>
    </div>
    <p style="margin:0 0 8px;color:#757575;font-size:13px;">
      Este enlace expira en <strong>24 horas</strong>.
    </p>
    <p style="margin:0;color:#9E9E9E;font-size:12px;">
      Si no solicitaste restablecer tu contrasena, puedes ignorar este correo de forma segura.
    </p>
  `);

  return {
    subject: 'Ciudad Activa – Recupera tu contrasena',
    html,
    text: `Hola ${data.userName}, Haz clic en el siguiente enlace para restablecer tu contrasena: ${data.resetUrl}. Este enlace expira en 24 horas.`,
  };
}

function generateApplicationReceivedEmail(data: ApplicationEmailData): { subject: string; html: string; text: string } {
  const html = buildBaseEmail('Nueva postulacion recibida', `
    <p style="margin:0 0 8px;color:#424242;font-size:16px;">Hola,</p>
    <p style="margin:0 0 24px;color:#424242;font-size:15px;line-height:1.6;">
      <strong>${data.applicantName || 'Un candidato'}</strong> ha aplicado a tu vacante de <strong>${data.jobTitle}</strong>.
    </p>
    <p style="margin:0 0 24px;color:#424242;font-size:15px;line-height:1.6;">
      Ingresa a tu panel de empresa para revisar el perfil y experiencia del candidato.
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="https://ciudadactiva.pe/empresa/postulaciones"
         style="display:inline-block;background:#1976D2;color:#ffffff;text-decoration:none;
                padding:14px 36px;border-radius:27px;font-size:16px;font-weight:700;
                box-shadow:0 4px 12px rgba(25,118,210,0.35);">
        Ver postulacion
      </a>
    </div>
  `);

  return {
    subject: `Ciudad Activa – Nueva postulacion para ${data.jobTitle}`,
    html,
    text: `Nueva postulacion recibida. ${data.applicantName || 'Un candidato'} ha aplicado a tu vacante de ${data.jobTitle}. Revisa en ciudadactiva.pe/empresa/postulaciones`,
  };
}

function generateApplicationStatusEmail(data: ApplicationEmailData, status: 'accepted' | 'rejected'): { subject: string; html: string; text: string } {
  const statusText = status === 'accepted' ? 'ha sido aceptada' : 'no ha sido seleccionada';
  const statusColor = status === 'accepted' ? '#2E7D32' : '#D32F2F';

  const html = buildBaseEmail(`Tu postulacion ${statusText}`, `
    <p style="margin:0 0 8px;color:#424242;font-size:16px;">Hola,</p>
    <p style="margin:0 0 24px;color:#424242;font-size:15px;line-height:1.6;">
      Tu postulacion a <strong>${data.jobTitle}</strong> en <strong>${data.companyName}</strong> ${statusText}.
    </p>
    ${status === 'accepted' ? `
    <p style="margin:0 0 24px;color:#424242;font-size:15px;line-height:1.6;">
      Pronto te contactaran para coordinar los siguientes pasos.
    </p>
    ` : `
    <p style="margin:0 0 24px;color:#424242;font-size:15px;line-height:1.6;">
      Te animamos a seguir explorando nuevas oportunidades en Ciudad Activa.
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="https://ciudadactiva.pe/trabajador/empleos"
         style="display:inline-block;background:#1976D2;color:#ffffff;text-decoration:none;
                padding:14px 36px;border-radius:27px;font-size:16px;font-weight:700;
                box-shadow:0 4px 12px rgba(25,118,210,0.35);">
        Ver mas empleos
      </a>
    </div>
    `}
  `);

  return {
    subject: `Ciudad Activa – Actualizacion sobre tu postulacion`,
    html,
    text: `Tu postulacion a ${data.jobTitle} en ${data.companyName} ${statusText}.`,
  };
}

function generateInterviewEmail(data: InterviewEmailData): { subject: string; html: string; text: string } {
  const html = buildBaseEmail('Entrevista programada', `
    <p style="margin:0 0 8px;color:#424242;font-size:16px;">Hola,</p>
    <p style="margin:0 0 24px;color:#424242;font-size:15px;line-height:1.6;">
      <strong>${data.companyName}</strong> ha programado una entrevista contigo para la vacante de <strong>${data.jobTitle}</strong>.
    </p>
    <div style="background:#EEF4FF;border-radius:14px;padding:24px;margin:0 0 24px;">
      <p style="margin:0 0 12px;color:#1565C0;font-size:14;font-weight:700;">
        Fecha y hora: ${data.dateTime}
      </p>
      ${data.location ? `<p style="margin:0 0 12px;color:#424242;font-size:14;">Ubicacion: ${data.location}</p>` : ''}
      ${data.notes ? `<p style="margin:0;color:#757575;font-size:13;">Notas: ${data.notes}</p>` : ''}
    </div>
    <p style="margin:0;color:#9E9E9E;font-size:12px;">
      Recuerda prepararte para la entrevista. Si necesitas cambiar el horario, contacta a la empresa.
    </p>
  `);

  return {
    subject: `Ciudad Activa – Entrevista programada con ${data.companyName}`,
    html,
    text: `Entrevista programada con ${data.companyName} para ${data.jobTitle}. Fecha: ${data.dateTime}. ${data.location ? `Ubicacion: ${data.location}` : ''}`,
  };
}

async function sendEmailViaResend(
  payload: { to: string | string[]; subject: string; html: string; text: string },
  apiKey: string,
  sender: string,
  senderName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${senderName} <${sender}>`,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || 'Error sending email' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

async function sendEmailViaSendGrid(
  payload: { to: string | string[]; subject: string; html: string; text: string },
  apiKey: string,
  sender: string,
  senderName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const personalizations = Array.isArray(payload.to)
      ? payload.to.map(email => ({ to: [{ email }] }))
      : [{ to: [{ email: payload.to }] }];

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations,
        from: { email: sender, name: senderName },
        subject: payload.subject,
        content: [
          { type: 'text/plain', value: payload.text },
          { type: 'text/html', value: payload.html },
        ],
      }),
    });

    if (!response.ok) {
      const result = await response.json();
      return { success: false, error: result.errors?.[0]?.message || 'Error sending email' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

async function sendEmailViaMailgun(
  payload: { to: string | string[]; subject: string; html: string; text: string },
  apiKey: string,
  domain: string,
  sender: string,
  senderName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const to = Array.isArray(payload.to) ? payload.to.join(',') : payload.to;
    const formData = new URLSearchParams();
    formData.append('from', `${senderName} <${sender}>`);
    formData.append('to', to);
    formData.append('subject', payload.subject);
    formData.append('html', payload.html);
    formData.append('text', payload.text);

    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${apiKey}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || 'Error sending email' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

async function sendEmailViaBrevo(
  payload: { to: string | string[]; subject: string; html: string; text: string },
  apiKey: string,
  sender: string,
  senderName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const to = Array.isArray(payload.to)
      ? payload.to.map(email => ({ email }))
      : [{ email: payload.to }];

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: sender },
        to,
        subject: payload.subject,
        htmlContent: payload.html,
        textContent: payload.text,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || 'Error sending email' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const apiKey = Deno.env.get("EMAIL_API_KEY") ?? "";
    const domain = Deno.env.get("EMAIL_DOMAIN") ?? "";
    const sender = Deno.env.get("EMAIL_SENDER") ?? "noreply@ciudadactiva.pe";
    const senderName = Deno.env.get("EMAIL_SENDER_NAME") ?? "Ciudad Activa";

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Email service not configured. Set EMAIL_API_KEY environment variable." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Detect provider from API key format
    const detectProvider = (): 'resend' | 'sendgrid' | 'mailgun' | 'brevo' => {
      const key = apiKey.toLowerCase();
      if (key.startsWith('re_')) return 'resend';
      if (key.startsWith('sg.')) return 'sendgrid';
      if (key.length === 36 && key.includes('-')) {
        // Mailgun API keys are UUIDs
        return 'mailgun';
      }
      if (key.startsWith('xkeysib-')) return 'brevo';
      return 'resend'; // Default to Resend
    };

    const body = await req.json();
    const { to, type, data, customSubject, customHtml, customText } = body as {
      to: string | string[];
      type: EmailPayload['type'];
      data?: any;
      customSubject?: string;
      customHtml?: string;
      customText?: string;
    };

    let emailContent: { subject: string; html: string; text: string };

    switch (type) {
      case 'welcome':
        emailContent = generateWelcomeEmail(data as WelcomeEmailData);
        break;
      case 'verification':
        emailContent = generateVerificationEmail(data as VerificationEmailData);
        break;
      case 'password_reset':
        emailContent = generatePasswordResetEmail(data as PasswordResetEmailData);
        break;
      case 'application_received':
        emailContent = generateApplicationReceivedEmail(data as ApplicationEmailData);
        break;
      case 'application_status':
        const status = data.status as 'accepted' | 'rejected';
        emailContent = generateApplicationStatusEmail(data as ApplicationEmailData, status);
        break;
      case 'interview_scheduled':
        emailContent = generateInterviewEmail(data as InterviewEmailData);
        break;
      case 'custom':
        if (!customSubject || !customHtml) {
          return new Response(
            JSON.stringify({ success: false, error: "Custom emails require subject and html" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        emailContent = {
          subject: customSubject,
          html: buildBaseEmail(customSubject, customHtml),
          text: customText || customSubject,
        };
        break;
      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid email type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const provider = detectProvider();
    let result: { success: boolean; error?: string };

    switch (provider) {
      case 'sendgrid':
        result = await sendEmailViaSendGrid(
          { to, ...emailContent },
          apiKey,
          sender,
          senderName
        );
        break;
      case 'mailgun':
        result = await sendEmailViaMailgun(
          { to, ...emailContent },
          apiKey,
          domain,
          sender,
          senderName
        );
        break;
      case 'brevo':
        result = await sendEmailViaBrevo(
          { to, ...emailContent },
          apiKey,
          sender,
          senderName
        );
        break;
      default: // resend
        result = await sendEmailViaResend(
          { to, ...emailContent },
          apiKey,
          sender,
          senderName
        );
    }

    if (!result.success) {
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully", provider }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
