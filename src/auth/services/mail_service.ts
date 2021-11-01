import { injectable } from 'inversify';
import * as nodemailer from 'nodemailer';
import { Twilio } from 'twilio';

import { User } from '../../users/entities/users_entity';

@injectable()
export class MailService {
  private _transporter: nodemailer.Transporter;
  private readonly emailUser = process.env.EMAIL_FOR_MAIL;
  private readonly passwordEmail = process.env.PASSWORD_FOR_MAIL;
  private twilio: Twilio;

  constructor() {
    this._transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.emailUser,
        pass: this.passwordEmail,
      },
    });
    this.twilio = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  public async sendConfirmation(user: User, token) {
    const confirmLink = `${process.env.CONFIRM_LINK}?token=${token}`;
    await this._transporter.sendMail({
      from: `"Music Shop" <${process.env.EMAIL_FOR_MAIL}>`,
      to: user.email,
      subject: 'Verify User',
      html: `
        <h3>Hello, ${user.username}!</h3>
        <p>Please use this <a href="${confirmLink}">link</a> to confirm your account</p>
        `,
    });
    return true;
  }

  public async sendSmsConfirmation() {
    this.twilio.messages
      .create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.MY_NUMBER,
        body: 'You just sent an SMS from TypeScript using Twilio!',
      })
      .then((message) => console.log(message.sid));
  }
}
