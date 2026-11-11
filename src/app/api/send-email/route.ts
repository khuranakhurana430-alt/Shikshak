import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    // 1. Initialize Resend with your API key from .env.local
    const resend = new Resend(process.env.RESEND_API_KEY);

    // 2. Get the data sent from the frontend
    const body = await request.json();
    const { teacherEmail, studentName, teacherName } = body;

    if (!teacherEmail || !studentName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Send the email
    const data = await resend.emails.send({
      // Resend provides onboarding@resend.dev for free testing.
      from: "Shikshak <onboarding@resend.dev>", 
      to: [teacherEmail],
      subject: "New Student Request on Shikshak!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #4f46e5;">Hello ${teacherName || "Teacher"},</h2>
          <p style="font-size: 16px; color: #334155;">You have a new demo request from <strong>${studentName}</strong> on Shikshak.</p>
          <p style="font-size: 16px; color: #334155;">Please log in to your dashboard to view their details and start a conversation.</p>
          <a href="https://shikshak-beta.vercel.app/dashboard/teacher" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: bold;">Go to Dashboard</a>
        </div>
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}