/**
 * Email service for sending credentials to new users
 * 
 * In production, this should use a proper email service like:
 * - SendGrid
 * - AWS SES
 * - Resend
 * - Or Supabase Edge Functions
 * 
 * For now, this provides a template that can be integrated with any email service
 */

export interface EmailCredentials {
  email: string;
  password: string;
  name: string;
}

/**
 * Generate email HTML template for sending credentials
 */
export function generateCredentialsEmail(credentials: EmailCredentials): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: #f9f9f9;
      padding: 30px;
      border: 1px solid #ddd;
      border-top: none;
      border-radius: 0 0 8px 8px;
    }
    .credentials {
      background: white;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
      border-left: 4px solid #667eea;
    }
    .credential-item {
      margin: 10px 0;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 4px;
    }
    .label {
      font-weight: bold;
      color: #667eea;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #666;
      font-size: 12px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Welcome to MediPro AI</h1>
  </div>
  <div class="content">
    <p>Hello ${credentials.name},</p>
    <p>Your account has been created successfully. Please use the following credentials to log in:</p>
    
    <div class="credentials">
      <div class="credential-item">
        <span class="label">Email:</span> ${credentials.email}
      </div>
      <div class="credential-item">
        <span class="label">Temporary Password:</span> ${credentials.password}
      </div>
    </div>
    
    <p><strong>Important:</strong> Please change your password after first login for security.</p>
    
    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000'}/login" class="button">
        Login Now
      </a>
    </div>
    
    <p>If you have any questions, please contact the administrator.</p>
  </div>
  <div class="footer">
    <p>This is an automated email. Please do not reply.</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text email for sending credentials
 */
export function generateCredentialsEmailText(credentials: EmailCredentials): string {
  return `
Welcome to MediPro AI

Hello ${credentials.name},

Your account has been created successfully. Please use the following credentials to log in:

Email: ${credentials.email}
Temporary Password: ${credentials.password}

Important: Please change your password after first login for security.

Login URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000'}/login

If you have any questions, please contact the administrator.

This is an automated email. Please do not reply.
  `.trim();
}

/**
 * Send credentials email
 * 
 * NOTE: This is a placeholder. In production, integrate with:
 * - SendGrid API
 * - AWS SES
 * - Resend
 * - Nodemailer
 * - Supabase Edge Functions
 * - Or any other email service
 */
export async function sendCredentialsEmail(credentials: EmailCredentials): Promise<boolean> {
  try {
    // TODO: Implement actual email sending
    // Example with Supabase Edge Function:
    // const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    //   },
    //   body: JSON.stringify({
    //     to: credentials.email,
    //     subject: 'Welcome to MediPro AI - Your Login Credentials',
    //     html: generateCredentialsEmail(credentials),
    //     text: generateCredentialsEmailText(credentials)
    //   })
    // });
    
    // For now, just log to console (in production, remove this)
    console.log("Email would be sent to:", credentials.email);
    console.log("Password:", credentials.password);
    
    // Return true for now - in production, check response
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}


