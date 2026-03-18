// infra/lib/email-construct.ts
import { Construct } from 'constructs';
import * as ses from 'aws-cdk-lib/aws-ses';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { CfnOutput } from 'aws-cdk-lib';

interface EmailConstructProps {
  domainName: string;
  hostedZoneId: string;
  mailSubdomain?: string;
}

export class EmailConstruct extends Construct {
  public readonly identity: ses.EmailIdentity;

  constructor(scope: Construct, id: string, props: EmailConstructProps) {
    super(scope, id);

    const mailDomain = props.mailSubdomain
      ? `${props.mailSubdomain}.${props.domainName}`
      : props.domainName;

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'Zone', {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.domainName,
    });

    // Create SES email identity with DKIM
    this.identity = new ses.EmailIdentity(this, 'Identity', {
      identity: ses.Identity.publicHostedZone(hostedZone),
      mailFromDomain: mailDomain,
    });

    new CfnOutput(this, 'SesIdentityArn', {
      value: this.identity.emailIdentityArn,
      description: 'SES Email Identity ARN',
    });
  }
}
