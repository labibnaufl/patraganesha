import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import dns from "dns";
import util from "util";

const lookupAsync = util.promisify(dns.lookup);

/**
 * Creates dynamic transporter to workaround a Node.js issue where raw UDP DNS queries
 * (queryA) to smtp.gmail.com time out on certain network configs, even though standard OS
 * DNS lookup works. Resolves the IP first and connects directly.
 */
async function getTransporter() {
  const defaultHost = process.env.SMTP_HOST || "smtp.gmail.com";
  let host = defaultHost;

  try {
    const { address } = await lookupAsync(defaultHost);
    host = address;
  } catch (err) {
    console.warn("SMTP DNS lookup failed, falling back to original host", err);
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      servername: defaultHost, // Crucial for TLS certificate validation when using an IP
    },
  });
}

/**
 * Generate a verification token and store it in the database.
 * Token expires in 24 hours.
 */
export async function generateVerificationToken(
  email: string,
): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Delete any existing tokens for this email
  await prisma.verification.deleteMany({
    where: { identifier: email },
  });

  // Create new token
  await prisma.verification.create({
    data: {
      identifier: email,
      value: token,
      expiresAt: expires,
    },
  });

  return token;
}

/**
 * Send verification email with a link to confirm the email address.
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<void> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

  const transporter = await getTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verifikasi Email - PATRA Digital Hub",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">PATRA Digital Hub</h1>
          <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Himpunan Mahasiswa Teknik Perminyakan ITB</p>
        </div>
        
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px;">
          <h2 style="color: #1a1a2e; font-size: 20px; margin: 0 0 16px 0;">Verifikasi Email Anda</h2>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
            Terima kasih telah mendaftar di PATRA Digital Hub. Silakan klik tombol di bawah untuk memverifikasi email Anda.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationUrl}" 
               style="background: #1a1a2e; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; display: inline-block;">
              Verifikasi Email
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0;">
            Link ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak mendaftar di PATRA Digital Hub, abaikan email ini.
          </p>
        </div>
        
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 32px;">
          &copy; ${new Date().getFullYear()} PATRA Digital Hub. All rights reserved.
        </p>
      </div>
    `,
  });
}
