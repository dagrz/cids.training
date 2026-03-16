// infra/lib/database-construct.ts
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { RemovalPolicy } from 'aws-cdk-lib';

export class DatabaseConstruct extends Construct {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: { isProd: boolean }) {
    super(scope, id);

    this.table = new dynamodb.Table(this, 'Subscribers', {
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: props.isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    this.table.addGlobalSecondaryIndex({
      indexName: 'phase-index',
      partitionKey: { name: 'currentPhase', type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: 'signupDate', type: dynamodb.AttributeType.STRING },
    });

    this.table.addGlobalSecondaryIndex({
      indexName: 'phone-index',
      partitionKey: { name: 'phone', type: dynamodb.AttributeType.STRING },
    });
  }
}
