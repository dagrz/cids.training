import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const sns = new SNSClient({});

export interface MessagingService {
  send(phone: string, message: string): Promise<void>;
}

export class SmsService implements MessagingService {
  async send(phone: string, message: string): Promise<void> {
    await sns.send(
      new PublishCommand({
        PhoneNumber: phone,
        Message: message,
      })
    );
  }
}

export function getMessagingService(channel: 'sms' | 'whatsapp'): MessagingService {
  // WhatsApp implementation will be added when Meta Business API is approved
  return new SmsService();
}
