import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

import { Resend } from 'resend';
import * as Sentry from '@sentry/node';
import { marked } from 'marked';

/**
 * Service that generates a roadmap using Google Gemini and emails it via Resend.
 */
@Injectable()
export class EdubotService {
  private readonly logger = new Logger(EdubotService.name);
  private resend: Resend;
  private readonly ai: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    this.ai = new GoogleGenAI({ apiKey: this.configService.get<string>('GEMINI_API_KEY')! });
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(resendApiKey);

    // Initialize Sentry for this service if a valid DSN is provided
    const sentryDsn = this.configService.get<string>('SENTRY_DSN');
    if (sentryDsn && sentryDsn !== 'your-sentry-dsn' && sentryDsn.startsWith('http')) {
      Sentry.init({
        dsn: sentryDsn,
        tracesSampleRate: 1.0,
      });
    }
  }

  /**
   * Generates an explanation and 1‑week task plan for the given field and technology.
   * Returns the full roadmap text with a split delimiter.
   */
  async generateRoadmap(studentField: string, tech: string): Promise<string> {
    const prompt = `You are an expert educational mentor for EduBot.
Generate a response with two distinct sections separated by the exact delimiter "---ROADMAP_SPLIT---":

SECTION 1 (Mentor Intro Message):
Write a personal, encouraging 2-paragraph note from the EduBot mentor explaining why learning ${tech} is essential and transformational for a student studying ${studentField}.

---ROADMAP_SPLIT---

SECTION 2 (7-Day Action Plan):
Provide a structured 7-day learning roadmap (Day 1 to Day 7) with concrete daily objectives, topics, and practical exercises for learning ${tech}. Use clean Markdown with headers (# Day 1: ...), bold terms, and bullet points.`;    
    const modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-3.5-flash';
    
    let attempts = 3;
    while (attempts > 0) {
      try {
        const result = await this.ai.models.generateContent({
          model: modelName,
          contents: prompt,
        });
        const roadmap = result.text?.trim() ?? 'No response';
        return roadmap;
      } catch (error) {
        // Don't retry quota/rate-limit errors — they won't recover on retry
        const errMsg: string = error?.message || String(error);
        const isQuotaError =
          errMsg.includes('quota') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('429') ||
          error?.status === 429;

        if (isQuotaError) {
          this.logger.error('Gemini API quota exceeded.', errMsg);
          Sentry.captureException(error);
          throw new Error(
            'Gemini API quota exceeded for this key. Please wait for the quota to reset or switch to a different model/key. The free-tier quota resets every 24 hours.',
          );
        }

        attempts--;
        this.logger.warn(`Gemini request failed. ${attempts} attempts remaining. Error: ${errMsg}`);
        if (attempts === 0) {
          this.logger.error('Gemini request failed all retry attempts', error);
          Sentry.captureException(error);
          throw error;
        }
        // Wait 1.5 seconds before retrying
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
    throw new Error('Failed to generate roadmap');
  }

  /**
   * Sends the roadmap via email using Resend.
   * Combines mentor message and roadmap card into a single HTML email sent exactly once.
   */
  async emailRoadmap(to: string, subject: string, body: string): Promise<void> {
    try {
      // Split mentor text intro and roadmap plan
      const parts = body.split('---ROADMAP_SPLIT---');
      const mentorText = parts.length > 1 ? parts[0].trim() : '';
      const roadmapText = parts.length > 1 ? parts[1].trim() : body.trim();

      const mentorHtml = mentorText ? await marked(mentorText, { async: true }) : '';
      const roadmapHtml = await marked(roadmapText, { async: true });

      // Single Unified HTML Template (Mentor Text at top, Banner & Plan directly underneath)
      const formattedHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #0b0f19;
              color: #e2e8f0;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
            }
            .wrapper {
              width: 100%;
              background-color: #0b0f19;
              padding: 40px 15px;
              box-sizing: border-box;
            }
            .container {
              max-width: 680px;
              margin: 0 auto;
            }
            /* Top Mentor Intro Section */
            .mentor-card {
              background-color: #111827;
              border: 1px solid #1f2937;
              border-radius: 16px;
              padding: 28px 32px;
              margin-bottom: 24px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
            }
            .mentor-badge {
              display: inline-block;
              background: rgba(99, 102, 241, 0.15);
              border: 1px solid #6366f1;
              color: #818cf8;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1.2px;
              padding: 4px 12px;
              border-radius: 20px;
              margin-bottom: 14px;
            }
            .mentor-content {
              line-height: 1.7;
              font-size: 15px;
              color: #d1d5db;
            }
            .mentor-content p {
              margin-top: 0;
              margin-bottom: 12px;
            }
            .mentor-content strong {
              color: #f9fafb;
            }

            /* Main EduBot Graphic Banner & Roadmap Plan */
            .card {
              background-color: #131b2e;
              border: 1px solid #1e293b;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
            }
            .header {
              background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
              border-bottom: 1px solid #312e81;
              padding: 32px;
              text-align: left;
            }
            .brand-badge {
              display: inline-block;
              background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
              color: #ffffff;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              padding: 4px 12px;
              border-radius: 20px;
              margin-bottom: 10px;
            }
            .header h1 {
              margin: 0;
              color: #ffffff;
              font-size: 24px;
              font-weight: 700;
              letter-spacing: -0.5px;
            }
            .content {
              padding: 32px;
              line-height: 1.7;
              font-size: 15px;
              color: #cbd5e1;
            }
            .content h1 {
              color: #38bdf8;
              font-size: 20px;
              border-bottom: 1px solid #1e293b;
              padding-bottom: 8px;
              margin-top: 24px;
              margin-bottom: 14px;
            }
            .content h2 {
              color: #818cf8;
              font-size: 17px;
              margin-top: 22px;
              margin-bottom: 10px;
            }
            .content h3 {
              color: #c084fc;
              font-size: 15px;
              margin-top: 18px;
              margin-bottom: 8px;
            }
            .content p {
              margin-top: 0;
              margin-bottom: 16px;
              color: #cbd5e1;
            }
            .content ul, .content ol {
              margin-top: 0;
              margin-bottom: 18px;
              padding-left: 24px;
            }
            .content li {
              margin-bottom: 8px;
              color: #e2e8f0;
            }
            .content strong {
              color: #f8fafc;
            }
            .footer {
              background-color: #0f172a;
              border-top: 1px solid #1e293b;
              padding: 22px 32px;
              text-align: center;
              font-size: 13px;
              color: #64748b;
            }
            .footer strong {
              color: #94a3b8;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              ${mentorHtml ? `
              <!-- TOP: Mentor Text Message -->
              <div class="mentor-card">
                <div class="mentor-badge">💬 MESSAGE FROM YOUR MENTOR</div>
                <div class="mentor-content">
                  ${mentorHtml}
                </div>
              </div>
              ` : ''}

              <!-- DIRECTLY UNDERNEATH: EduBot Roadmap Banner & 7-Day Plan -->
              <div class="card">
                <div class="header">
                  <div class="brand-badge">⚡ EDUBOT AI ROADMAP</div>
                  <h1>Personalized 7-Day Learning Plan</h1>
                </div>
                <div class="content">
                  ${roadmapHtml}
                </div>
                <div class="footer">
                  Generated with ❤️ by <strong>EduBot AI</strong> • Your Personal Learning Companion
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const rawSender = this.configService.get<string>('RESEND_SENDER_EMAIL') || 'onboarding@resend.dev';
      const from = rawSender.includes('<') ? rawSender : `EduBot <${rawSender}>`;

      // SINGLE UNIFIED EMAIL EXECUTION (STRICTLY ONCE)
      await this.resend.emails.send({
        from,
        to,
        subject,
        html: formattedHtml,
      });
    } catch (error) {
      this.logger.error('Resend email failed', error);
      Sentry.captureException(error);
      throw error;
    }
  }
}

