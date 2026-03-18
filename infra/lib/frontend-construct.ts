// infra/lib/frontend-construct.ts
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { RemovalPolicy } from 'aws-cdk-lib';
import path from 'path';

interface FrontendConstructProps {
  domainName?: string;
  hostedZoneId?: string;
  certificateArn?: string;
  isProd: boolean;
}

export class FrontendConstruct extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: FrontendConstructProps) {
    super(scope, id);

    this.bucket = new s3.Bucket(this, 'SiteBucket', {
      removalPolicy: props.isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: !props.isProd,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    const oai = new cloudfront.OriginAccessIdentity(this, 'OAI');
    this.bucket.grantRead(oai);

    const distributionProps: cloudfront.DistributionProps = {
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket, { originAccessIdentity: oai }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responsePagePath: '/index.html',
          responseHttpStatus: 200,
        },
      ],
    };

    // Add domain + certificate if provided
    if (props.domainName && props.certificateArn) {
      const certificate = acm.Certificate.fromCertificateArn(this, 'Cert', props.certificateArn);
      Object.assign(distributionProps, {
        domainNames: [props.domainName, `www.${props.domainName}`],
        certificate,
      });
    }

    const distribution = new cloudfront.Distribution(this, 'Distribution', distributionProps);

    // Deploy frontend build output
    new s3deploy.BucketDeployment(this, 'DeployFrontend', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../frontend/out'))],
      destinationBucket: this.bucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // Route53 record if domain provided
    if (props.domainName && props.hostedZoneId) {
      const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'Zone', {
        hostedZoneId: props.hostedZoneId,
        zoneName: props.domainName,
      });

      new route53.ARecord(this, 'AliasRecord', {
        zone: hostedZone,
        target: route53.RecordTarget.fromAlias(
          new route53targets.CloudFrontTarget(distribution)
        ),
      });

      new route53.ARecord(this, 'WwwAliasRecord', {
        zone: hostedZone,
        recordName: 'www',
        target: route53.RecordTarget.fromAlias(
          new route53targets.CloudFrontTarget(distribution)
        ),
      });
    }
  }
}
