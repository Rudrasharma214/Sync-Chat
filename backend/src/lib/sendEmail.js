import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv'
dotenv.config({quiet: true});

export const sendEmail = async (to, subject, text) => {
  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    // Configure API key authorization: api-key
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY || "";

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const senderEmail = process.env.BREVO_FROM_EMAIL || "no-reply@example.com";

    const sendSmtpEmail = {
      sender: { email: senderEmail },
      to: [{ email: to }],
      subject,
      textContent: text,
    };

    const resp = await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    // Re-throw for upstream handling; include message for easier debugging
    const err = new Error(
      `Failed to send email via Brevo: ${error && error.message ? error.message : error}`
    );
    err.cause = error;
    throw err;
  }
};
