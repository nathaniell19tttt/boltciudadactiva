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

function buildBase(title: string, body: string): string {
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
        Lima Norte, Perú
      </p>
    </div>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

const OTP_TEMPLATE = buildBase("Ciudad Activa – Código de verificación", `
  <p style="margin:0 0 8px;color:#424242;font-size:16px;">Hola,</p>
  <p style="margin:0 0 24px;color:#424242;font-size:15px;line-height:1.6;">
    Gracias por registrarte en <strong>Ciudad Activa</strong>. Para completar tu registro,
    ingresa el siguiente código de verificación en la aplicación:
  </p>
  <div style="background:#EEF4FF;border:2px solid #1976D2;border-radius:14px;padding:28px;text-align:center;margin:0 0 24px;">
    <span style="font-size:40px;font-weight:900;letter-spacing:10px;color:#1565C0;font-family:monospace;">{{ .Token }}</span>
  </div>
  <p style="margin:0 0 8px;color:#757575;font-size:13px;">
    ⏱ Este código tiene una vigencia de <strong>10 minutos</strong>.
  </p>
  <p style="margin:0;color:#9E9E9E;font-size:12px;">
    Si no solicitaste este código, puedes ignorar este correo de forma segura.
  </p>
`);

const RECOVERY_TEMPLATE = buildBase("Ciudad Activa – Recupera tu contraseña", `
  <p style="margin:0 0 8px;color:#424242;font-size:16px;">Hola,</p>
  <p style="margin:0 0 24px;color:#424242;font-size:15px;line-height:1.6;">
    Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Ciudad Activa</strong>.
    Haz clic en el botón a continuación para crear una nueva contraseña:
  </p>
  <div style="text-align:center;margin:0 0 24px;">
    <a href="{{ .ConfirmationURL }}"
       style="display:inline-block;background:#1976D2;color:#ffffff;text-decoration:none;
              padding:14px 36px;border-radius:27px;font-size:16px;font-weight:700;
              box-shadow:0 4px 12px rgba(25,118,210,0.35);">
      Restablecer contraseña
    </a>
  </div>
  <p style="margin:0 0 8px;color:#757575;font-size:13px;">
    ⏱ Este enlace expira en <strong>24 horas</strong>.
  </p>
  <p style="margin:0;color:#9E9E9E;font-size:12px;">
    Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura.
  </p>
`);

const CONFIRMATION_TEMPLATE = buildBase("Ciudad Activa – Confirma tu registro", `
  <p style="margin:0 0 8px;color:#424242;font-size:16px;">Hola,</p>
  <p style="margin:0 0 24px;color:#424242;font-size:15px;line-height:1.6;">
    ¡Bienvenido a <strong>Ciudad Activa</strong>! Confirma tu dirección de correo electrónico
    haciendo clic en el botón a continuación:
  </p>
  <div style="text-align:center;margin:0 0 24px;">
    <a href="{{ .ConfirmationURL }}"
       style="display:inline-block;background:#1976D2;color:#ffffff;text-decoration:none;
              padding:14px 36px;border-radius:27px;font-size:16px;font-weight:700;
              box-shadow:0 4px 12px rgba(25,118,210,0.35);">
      Confirmar mi cuenta
    </a>
  </div>
  <p style="margin:0;color:#9E9E9E;font-size:12px;">
    Si no creaste una cuenta en Ciudad Activa, puedes ignorar este correo de forma segura.
  </p>
`);

const EMAIL_CHANGE_TEMPLATE = buildBase("Ciudad Activa – Confirma el cambio de correo", `
  <p style="margin:0 0 8px;color:#424242;font-size:16px;">Hola,</p>
  <p style="margin:0 0 24px;color:#424242;font-size:15px;line-height:1.6;">
    Recibimos una solicitud para cambiar la dirección de correo electrónico de tu cuenta en
    <strong>Ciudad Activa</strong>. Confirma el cambio haciendo clic a continuación:
  </p>
  <div style="text-align:center;margin:0 0 24px;">
    <a href="{{ .ConfirmationURL }}"
       style="display:inline-block;background:#1976D2;color:#ffffff;text-decoration:none;
              padding:14px 36px;border-radius:27px;font-size:16px;font-weight:700;
              box-shadow:0 4px 12px rgba(25,118,210,0.35);">
      Confirmar cambio de correo
    </a>
  </div>
  <p style="margin:0;color:#9E9E9E;font-size:12px;">
    Si no solicitaste este cambio, ignora este correo. Tu correo actual no será modificado.
  </p>
`);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing environment variables");
    }

    const adminConfigUrl = `${supabaseUrl}/auth/v1/admin/config`;

    const payload = {
      mailer_subjects_confirmation: "Ciudad Activa – Confirma tu registro",
      mailer_subjects_recovery: "Ciudad Activa – Recupera tu contraseña",
      mailer_subjects_magic_link: "Ciudad Activa – Tu código de acceso",
      mailer_subjects_email_change: "Ciudad Activa – Confirma el cambio de correo",
      mailer_subjects_invite: "Ciudad Activa – Te han invitado",
      mailer_templates_confirmation_content: CONFIRMATION_TEMPLATE,
      mailer_templates_recovery_content: RECOVERY_TEMPLATE,
      mailer_templates_magic_link_content: OTP_TEMPLATE,
      mailer_templates_email_change_content: EMAIL_CHANGE_TEMPLATE,
    };

    const response = await fetch(adminConfigUrl, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        "apikey": serviceRoleKey,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: result }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email templates configured for Ciudad Activa" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
