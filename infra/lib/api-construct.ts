// infra/lib/api-construct.ts
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';
import { Duration } from 'aws-cdk-lib';
import path from 'path';

interface ApiConstructProps {
  table: dynamodb.Table;
  pdfBucket: s3.Bucket;
  fromEmail: string;
  domain?: string;
  hostedZoneId?: string;
  apiCertificateArn?: string;
}

export class ApiConstruct extends Construct {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    const backendDir = path.join(__dirname, '../../backend');

    // Signup Lambda
    const signupFn = new lambdaNode.NodejsFunction(this, 'SignupFn', {
      entry: path.join(backendDir, 'src/signup/handler.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: Duration.seconds(10),
      environment: {
        TABLE_NAME: props.table.tableName,
        PDF_BUCKET: props.pdfBucket.bucketName,
        PDF_KEY: 'cids-framework-guide.pdf',
        FROM_EMAIL: props.fromEmail,
      },
    });

    props.table.grantReadWriteData(signupFn);
    props.pdfBucket.grantRead(signupFn);
    signupFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ses:SendEmail'],
        resources: ['*'],
      })
    );

    // Nudge Lambda
    const nudgeFn = new lambdaNode.NodejsFunction(this, 'NudgeFn', {
      entry: path.join(backendDir, 'src/nudge/handler.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: Duration.minutes(5),
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });

    props.table.grantReadWriteData(nudgeFn);
    nudgeFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['sns:Publish'],
        resources: ['*'],
      })
    );

    // EventBridge rules for timezone-based nudges (7am local time)
    // Subscribers specify their IANA timezone on signup
    const timezoneSchedules: Array<{ name: string; hour: number; timezones: string[] }> = [
      { name: 'ET', hour: 12, timezones: ['America/New_York', 'America/Detroit', 'US/Eastern'] },
      { name: 'CT', hour: 13, timezones: ['America/Chicago', 'US/Central'] },
      { name: 'MT', hour: 14, timezones: ['America/Denver', 'US/Mountain'] },
      { name: 'PT', hour: 15, timezones: ['America/Los_Angeles', 'US/Pacific'] },
    ];

    for (const tz of timezoneSchedules) {
      new events.Rule(this, `NudgeRule${tz.name}`, {
        schedule: events.Schedule.cron({ hour: String(tz.hour), minute: '0' }),
        targets: [new targets.LambdaFunction(nudgeFn, {
          event: events.RuleTargetInput.fromObject({ targetTimezones: tz.timezones }),
        })],
      });
    }

    // Unsubscribe Lambda
    const unsubscribeFn = new lambdaNode.NodejsFunction(this, 'UnsubscribeFn', {
      entry: path.join(backendDir, 'src/unsubscribe/handler.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: Duration.seconds(10),
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });

    props.table.grantReadWriteData(unsubscribeFn);

    // API Gateway
    this.api = new apigateway.RestApi(this, 'CidsApi', {
      restApiName: 'CIDS API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type'],
      },
    });

    const signup = this.api.root.addResource('signup');
    signup.addMethod('POST', new apigateway.LambdaIntegration(signupFn));

    const unsubscribe = this.api.root.addResource('unsubscribe');
    unsubscribe.addMethod('GET', new apigateway.LambdaIntegration(unsubscribeFn));

    // Custom domain: api.cids.training
    if (props.domain && props.hostedZoneId && props.apiCertificateArn) {
      const apiDomainName = `api.${props.domain}`;

      const certificate = acm.Certificate.fromCertificateArn(
        this, 'ApiCert', props.apiCertificateArn
      );

      const customDomain = this.api.addDomainName('ApiDomain', {
        domainName: apiDomainName,
        certificate,
        endpointType: apigateway.EndpointType.EDGE,
      });

      const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'ApiZone', {
        hostedZoneId: props.hostedZoneId,
        zoneName: props.domain,
      });

      new route53.ARecord(this, 'ApiAliasRecord', {
        zone: hostedZone,
        recordName: 'api',
        target: route53.RecordTarget.fromAlias(
          new route53targets.ApiGatewayDomain(customDomain)
        ),
      });
    }
  }
}
