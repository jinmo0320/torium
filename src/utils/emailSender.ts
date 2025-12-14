import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
} from "@aws-sdk/client-ses";
import * as dotenv from "dotenv";
dotenv.config();

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.SES_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.SES_SECRET_ACCESS_KEY || "",
  },
});

export class EmailSender {
  static async sendMail(email: string, code: string): Promise<boolean> {
    const senderEmail = process.env.SES_SENDER_EMAIL;
    const expirationMinutes = process.env.EXPIRATION_MINUTES || 5;

    if (!senderEmail) {
      console.error(
        "SES_SENDER_EMAIL is not configured in environment variables."
      );
      return false;
    }

    const params: SendEmailCommandInput = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
              <html>
                  <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                      <h2>인증 코드 안내</h2>
                      <p>안녕하세요. 회원님의 인증 코드는 다음과 같습니다:</p>
                      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center;">
                          <h1 style="color: #333; margin: 0;">${code}</h1>
                      </div>
                      <p>이 코드는 <strong>${expirationMinutes}분 이내</strong>에 사용해야 합니다.</p>
                      <p>감사합니다.</p>
                  </body>
              </html>
            `,
          },
          Text: {
            Charset: "UTF-8",
            Data: `회원님의 인증 코드는 ${code} 입니다. ${expirationMinutes}분 이내에 입력해주세요.`,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "[Torium] 인증 코드 발송",
        },
      },
      Source: `"Torium 인증센터" ${senderEmail}`,
    };

    try {
      const command = new SendEmailCommand(params);
      const result = await sesClient.send(command);
      console.log(
        `Email sent successfully to ${email}. Message ID: ${result.MessageId}`
      );
      return true;
    } catch (error) {
      console.error(`Error sending email to ${email}:`, error);
      return false;
    }
  }
}
