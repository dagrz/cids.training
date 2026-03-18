// infra/lib/cids-stack.ts
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DatabaseConstruct } from './database-construct';
import { ApiConstruct } from './api-construct';
import { FrontendConstruct } from './frontend-construct';
import { EmailConstruct } from './email-construct';

interface CidsStackProps extends StackProps {
  isProd: boolean;
  domainName?: string;
  hostedZoneId?: string;
  certificateArn?: string;
  fromEmail?: string;
}

export class CidsStack extends Stack {
  constructor(scope: Construct, id: string, props: CidsStackProps) {
    super(scope, id, props);

    const db = new DatabaseConstruct(this, 'Database', {
      isProd: props.isProd,
    });

    const frontend = new FrontendConstruct(this, 'Frontend', {
      domainName: props.domainName,
      hostedZoneId: props.hostedZoneId,
      certificateArn: props.certificateArn,
      isProd: props.isProd,
    });

    // SES email identity with DKIM + MAIL FROM
    if (props.domainName && props.hostedZoneId) {
      new EmailConstruct(this, 'Email', {
        domainName: props.domainName,
        hostedZoneId: props.hostedZoneId,
        mailSubdomain: 'mail',
      });
    }

    new ApiConstruct(this, 'Api', {
      table: db.table,
      pdfBucket: frontend.bucket,
      fromEmail: props.fromEmail || 'noreply@cids.training',
      domain: props.domainName,
    });
  }
}
