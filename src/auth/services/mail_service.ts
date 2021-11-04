import { injectable } from 'inversify';
import { Twilio } from 'twilio';

@injectable()
export class MailService {
  private twilio: Twilio;

  constructor() {
    this.twilio = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  public async sendSmsConfirmation(user) {
    this.twilio.verify
      .services(process.env.VERIFY_SERVICE_SID)
      .verifications.create({
        to: '+' + user.phoneNumber,
        channel: 'sms',
      })
      .then((verification) =>
        console.log(`Sent verification: '${verification.sid}'`)
      )
      .catch((err) => console.log(err));
  }

  public async checkCodeVerification(phoneNumber, code) {
    return this.twilio.verify
      .services(process.env.VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: '+' + phoneNumber,
        code: code,
      })
      .then((check) => {
        if (check.status === 'approved') {
          return { confirm: true };
        }
        return { confirm: false };
      })
      .catch((err) => {
        console.log(err.message);
        return { confirm: false };
      });
  }
}
