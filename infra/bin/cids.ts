#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { CidsStack } from '../lib/cids-stack';

const app = new App();
const env = app.node.tryGetContext('env') || 'dev';
const isProd = env === 'prod';

new CidsStack(app, `CidsStack-${env}`, {
  env: { region: 'us-east-2' },
  isProd,
  domainName: app.node.tryGetContext('domainName') || (isProd ? 'cids.training' : undefined),
  hostedZoneId: app.node.tryGetContext('hostedZoneId') || undefined,
  certificateArn: app.node.tryGetContext('certificateArn') || undefined,
  fromEmail: isProd ? 'noreply@cids.training' : 'noreply@cids-dev.training',
});
