import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * Nodemailer API Route for Gmail SMTP
 * 
 * This route replaces Resend with Gmail SMTP using Nodemailer.
 * It includes validation, spam protection, and a clean HTML template.
 */

export async function POST(req: Request) {
  try {
    // 1. Get environment variables
    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // Check if configuration is missing
    if (!smtpEmail || !smtpPassword) {
      console.error('ERROR: SMTP configuration (SMTP_EMAIL or SMTP_PASSWORD) is missing.');
      return NextResponse.json(
        { 
          error: 'Email service configuration missing. Please add SMTP_EMAIL and SMTP_PASSWORD to your .env.local file.',
          status: 'config_error'
        },
        { status: 500 }
      );
    }

    // 2. Parse and Validate Request Body
    const body = await req.json();
    const { firstName, lastName, email, message, honeypot } = body;

    // Simple Honeypot / Spam protection
    if (honeypot) {
      console.warn('Spam detected via honeypot');
      return NextResponse.json({ success: true, message: 'Message filtered' });
    }

    // Basic validation
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // 3. Configure Nodemailer Transporter
    // For Gmail, we use 'smtp.gmail.com'
    // User requested Port 587 with secure: true
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: true, // User specific requirement
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
      tls: {
        // This helps with some Gmail connection issues on port 587 if secure: true is used
        rejectUnauthorized: false
      }
    });

    const fullName = `${firstName} ${lastName}`;
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    console.log(`Attempting to send email via SMTP for: ${fullName} (${email})`);

    // 4. Send Email
    await transporter.sendMail({
      from: `"ToolWala AI" <${smtpEmail}>`,
      to: 'ganeshmetku0901@gmail.com',
      replyTo: email,
      subject: `New Contact Form: ${fullName}`,
      text: `Name: ${fullName}\nEmail: ${email}\nMessage: ${message}\nTime: ${timestamp}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1f2937;">
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 24px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="margin-bottom: 24px;">
              <span style="background-color: #2563eb; color: white; padding: 6px 12px; rounded: 12px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 8px;">New Submission</span>
            </div>
            
            <h2 style="color: #111827; font-size: 24px; font-weight: 800; margin-bottom: 24px; letter-spacing: -0.025em;">You have a new message from ToolWala AI</h2>
            
            <div style="background-color: white; border-radius: 16px; padding: 24px; border: 1px solid #f1f5f9;">
              <div style="margin-bottom: 16px;">
                <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Sender Name</p>
                <p style="margin: 4px 0 0 0; font-weight: 600; color: #0f172a;">${fullName}</p>
              </div>
              
              <div style="margin-bottom: 16px;">
                <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Email Address</p>
                <p style="margin: 4px 0 0 0; font-weight: 600; color: #2563eb;">${email}</p>
              </div>

              <div style="margin-bottom: 16px;">
                <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Submission Time</p>
                <p style="margin: 4px 0 0 0; font-weight: 500; color: #64748b;">${timestamp}</p>
              </div>
              
              <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #f1f5f9;">
                <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 12px;">Message Content</p>
                <div style="background-color: #f8fafc; padding: 16px; border-radius: 12px; color: #334155; line-height: 1.6;">
                  ${message.replace(/\n/g, '<br />')}
                </div>
              </div>
            </div>
            
            <div style="margin-top: 32px; text-align: center;">
              <p style="font-size: 12px; color: #94a3b8;">This email was sent via ToolWala AI SMTP System.</p>
            </div>
          </div>
        </div>
      `,
    });

    console.log('Email sent successfully via Gmail SMTP');
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Unexpected Server Error:', error);
    
    // Check for common SMTP errors
    if (error.code === 'EAUTH') {
      return NextResponse.json(
        { error: 'Authentication failed. Please check your SMTP_PASSWORD (ensure you use an App Password for Gmail).' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
