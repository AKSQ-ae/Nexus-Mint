import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Dynamic branding (configurable via environment variables)
const BRAND_COMPANY = Deno.env.get("BRAND_COMPANY_NAME") ?? "Your Company";
const BRAND_BASE_URL = Deno.env.get("BRAND_BASE_URL") ?? "https://yourcompany.com";
const FROM_EMAIL = Deno.env.get("BRAND_FROM_EMAIL") ?? `notifications@${new URL(BRAND_BASE_URL).hostname}`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  template: 'welcome' | 'investment_confirmation' | 'kyc_approved' | 'property_update' | 'milestone_achieved';
  data?: Record<string, any>;
}

const templates = {
  welcome: (data: any) => ({
    subject: "Welcome to Nexus Mint!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome to Nexus Mint</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">The Future of Real Estate Investment</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${data?.name || 'there'}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for joining Nexus Mint! You're now part of a revolutionary platform that's making real estate investment accessible through blockchain tokenization.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Complete your profile setup</li>
              <li>Verify your identity (KYC)</li>
              <li>Explore available properties</li>
              <li>Make your first investment</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data?.dashboardUrl || 'https://nexusmint.com/dashboard'}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Get Started
            </a>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">
            If you have any questions, feel free to contact our support team.
          </p>
        </div>
      </div>
    `
  }),

  investment_confirmation: (data: any) => ({
    subject: `Investment Confirmation - ${data?.propertyTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Investment Confirmed!</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Investment Details</h2>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0; color: #666;">Property:</td>
                <td style="padding: 10px 0; color: #333; font-weight: bold;">${data?.propertyTitle}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0; color: #666;">Token Amount:</td>
                <td style="padding: 10px 0; color: #333; font-weight: bold;">${data?.tokenAmount}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0; color: #666;">Investment Amount:</td>
                <td style="padding: 10px 0; color: #333; font-weight: bold;">$${data?.amount?.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666;">Transaction ID:</td>
                <td style="padding: 10px 0; color: #333; font-weight: bold;">${data?.transactionId}</td>
              </tr>
            </table>
          </div>
          <p style="color: #666; line-height: 1.6;">
            Your investment has been successfully processed and your tokens will be available in your portfolio shortly.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data?.portfolioUrl || 'https://nexusmint.com/portfolio'}" 
               style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Portfolio
            </a>
          </div>
        </div>
      </div>
    `
  }),

  kyc_approved: (data: any) => ({
    subject: "KYC Verification Approved",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">KYC Approved!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">You can now start investing</p>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Congratulations ${data?.name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Your identity verification has been successfully completed. You now have full access to all investment opportunities on Nexus Mint.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Benefits:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Access to all property investments</li>
              <li>Higher investment limits</li>
              <li>Priority access to new listings</li>
              <li>Advanced portfolio analytics</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data?.propertiesUrl || 'https://nexusmint.com/properties'}" 
               style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Browse Properties
            </a>
          </div>
        </div>
      </div>
    `
  }),

  property_update: (data: any) => ({
    subject: `Update: ${data?.propertyTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3b82f6; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Property Update</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">${data?.propertyTitle}</h2>
          <p style="color: #666; line-height: 1.6;">
            ${data?.updateMessage || 'There\'s a new update for one of your investment properties.'}
          </p>
          ${data?.metrics ? `
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Performance Metrics:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${Object.entries(data.metrics).map(([key, value]) => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; color: #666;">${key}:</td>
                  <td style="padding: 10px 0; color: #333; font-weight: bold;">${value}</td>
                </tr>
              `).join('')}
            </table>
          </div>
          ` : ''}
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data?.propertyUrl || 'https://nexusmint.com/properties'}" 
               style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Property
            </a>
          </div>
        </div>
      </div>
    `
  }),

  milestone_achieved: (data: any) => ({
    subject: `Milestone Achieved: ${data?.milestone}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🎉 Milestone Achieved!</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Congratulations ${data?.name}!</h2>
          <p style="color: #666; line-height: 1.6;">
            You've reached a new milestone: <strong>${data?.milestone}</strong>
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #333; margin-top: 0;">${data?.milestone}</h3>
            ${data?.reward ? `<p style="color: #f59e0b; font-weight: bold; font-size: 18px;">Reward: ${data.reward}</p>` : ''}
            ${data?.description ? `<p style="color: #666;">${data.description}</p>` : ''}
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data?.dashboardUrl || 'https://nexusmint.com/dashboard'}" 
               style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Dashboard
            </a>
          </div>
        </div>
      </div>
    `
  }),
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, template, data }: EmailRequest = await req.json();

    if (!to || !template) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, template" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const templateFn = templates[template];
    if (!templateFn) {
      return new Response(
        JSON.stringify({ error: "Invalid template" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailContent = templateFn(data);

    // Replace any remaining hard-coded brand tokens in subject/html
    const subject = emailContent.subject.replace(/Nexus Mint/g, BRAND_COMPANY);
    const htmlWithBrand = emailContent.html
      .replace(/Nexus Mint/g, BRAND_COMPANY)
      .replace(/nexusmint\.com/g, new URL(BRAND_BASE_URL).hostname);

    const emailResponse = await resend.emails.send({
      from: `${BRAND_COMPANY} <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html: htmlWithBrand,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);