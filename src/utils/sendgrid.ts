import { Logger } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';
import * as dotenv from 'dotenv';
import EMAIL_CONFIRMATION_TEMPLATE from './email-template/email-confirmation';
dotenv.config();

SendGrid.setApiKey(process.env.send_grid_api);
const SendEmail = (token: string) => {
  const logger = new Logger('SendEmail');

  const msg = {
    to: 'severeignx27@gmail.com', // Change to your recipient
    from: 'instagive2021@gmail.com', // Change to your verified sender
    subject: 'ConnectLink Email Confirmation',
    text: 'and easy to do anywhere, even with Node.js',
    html: `${EMAIL_CONFIRMATION_TEMPLATE(token)}`,
  };
  SendGrid.send(msg)
    .then(() => {
      console.log('Email sent');
    })
    .catch((error) => {
      console.error(error);
    });
};

export default SendEmail;
