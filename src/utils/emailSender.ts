import nodemailer from "nodemailer";

export class EmailSender {
  static async sendMail(email: string, code: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_SENDER_USER,
        pass: process.env.EMAIL_SENDER_PASSWORD,
      },
    });

    const content = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Email</title>
    </head>
    <body>
        <h2>이메일 인증</h2>
        <p>안녕하세요, ${email}님!</p>
        <p>아래의 인증 코드를 사용하여 이메일 인증을 완료하세요:</p>
        <h3 style="color: blue;">${code}</h3>
        <p>감사합니다!</p>
    </body>
    </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_SENDER_USER,
      to: email,
      subject: "Verification Email",
      html: content,
    });
  }
}
