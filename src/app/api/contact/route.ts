import { NextResponse } from 'next/server';
import { Resend } from 'resend';

/**
 * Resend API Route with Debugging
 * 
 * This route handles contact form submissions. It includes validation,
 * debugging logs, and robust error handling.
 */

// Debug log during module initialization
console.log('API Route Init: RESEND_API_KEY present?', !!process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // 1. Dynamic Check (Useful for debugging env loading issues)
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      console.error('ERROR: RESEND_API_KEY is undefined at runtime.');
      return NextResponse.json(
        { 
          error: 'Email service is not configured. Please add RESEND_API_KEY to your .env.local file and restart your server.',
          debug: { envLoaded: !!process.env.RESEND_API_KEY }
        },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    // 2. Parse and Validate Request Body
    const body = await req.json();
    const { firstName, lastName, email, message } = body;

    // Simple Honeypot / Spam protection (if added to frontend)
    if (body.honeypot) {
      console.warn('Spam detected via honeypot');
      return NextResponse.json({ success: true, message: 'Message filtered' });
    }

    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    console.log(`Sending email from: ${firstName} ${lastName} (${email})`);

    // 3. Send Email
    const { data, error } = await resend.emails.send({
      from: 'ToolWala AI <onboarding@resend.dev>', // Use verified domain in production
      to: 'ganeshmetku0901@gmail.com',
      replyTo: email,
      subject: `New Message: ${firstName} ${lastName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; color: #374151;">${message}</p>
          </div>
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #6b7280; text-align: center;">Sent from ToolWala AI Contact Form</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Email sent successfully:', data?.id);
    return NextResponse.json({ success: true, id: data?.id });

  } catch (error: any) {
    console.error('Unexpected Server Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
