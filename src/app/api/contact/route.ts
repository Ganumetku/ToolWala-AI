import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize with fallback to prevent build/boot crashes if env var is missing
const resendApiKey = process.env.RESEND_API_KEY || 're_placeholder_key';
const resend = new Resend(resendApiKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, message } = body;

    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const date = new Date().toLocaleString();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0;">ToolWala AI</h1>
        </div>
        <h2 style="color: #1e293b; border-bottom: 2px solid #eff6ff; padding-bottom: 10px;">New Contact Form Submission</h2>
        <div style="margin-top: 20px;">
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #2563eb;">${email}</a></p>
          <p><strong>Date/Time:</strong> ${date}</p>
        </div>
        <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h3 style="margin-top: 0; color: #475569; font-size: 16px;">Message:</h3>
          <p style="color: #334155; line-height: 1.6; white-space: pre-wrap; margin-bottom: 0;">${message}</p>
        </div>
        <div style="margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #eaeaea; padding-top: 20px;">
          <p>This email was automatically generated from the ToolWala AI contact form.</p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'ToolWala AI Contact Form <onboarding@resend.dev>', // Update this to your verified domain in production
      to: 'ganeshmetku0901@gmail.com',
      replyTo: email,
      subject: `New Message from ${firstName} ${lastName}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
