import { SESClient, SendTemplatedEmailCommand } from '@aws-sdk/client-ses';
import { Logger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  readonly client: SESClient;
  readonly logger = new Logger(EmailService.name);
  readonly VERIFIED_EMAIL: string;
  readonly TO_EMAIL: string;
  constructor(private readonly config: ConfigService) {
    this.client = new SESClient({
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.config.get<string>('AWS_SECRET_KEY') || '',
      },
      region: this.config.get<string>('REGION'),
    });
    this.VERIFIED_EMAIL = this.config.get<string>('EMAIL_FROM') || '';
    this.TO_EMAIL = this.config.get<string>('EMAIL_TO') || '';
  }

  async sendEmail(template: string, data: any) {
    const params = {
      Destination: {
        ToAddresses: [this.TO_EMAIL],
      },
      Source: this.VERIFIED_EMAIL,
      Template: template,
      TemplateData: JSON.stringify(data),
      ReplyToAddresses: [this.VERIFIED_EMAIL],
      ConfigurationSetName: 'rendering-failure',
    };
    this.logger.log('Email Params => ' + JSON.stringify(params));
    const command = new SendTemplatedEmailCommand(params);
    try {
      const mail = await this.client.send(command);
      console.log('Mail Operation =>', JSON.stringify(mail));
      return JSON.stringify(mail);
    } catch (e) {
      this.logger.error(e);
    }
  }
}
