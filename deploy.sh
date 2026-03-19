#!/bin/bash
set -e

PROFILE="cidstraining"
REGION="us-east-2"
DISTRIBUTION_ID="E1RTH1DV7NRWXL"

echo "==> Building frontend..."
cd frontend && npm run build && cd ..

echo "==> Deploying CDK stack..."
cd infra && AWS_PROFILE=$PROFILE npx cdk deploy \
  --context env=dev \
  --context domainName=cids.training \
  --context hostedZoneId=Z02943592ZGQ3HN7ZOIX5 \
  --context certificateArn=arn:aws:acm:us-east-1:845395042897:certificate/4edcadb9-f9c1-485b-9a16-38b932d30de5 \
  --require-approval never && cd ..

echo "==> Invalidating CloudFront cache..."
AWS_PROFILE=$PROFILE aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*" \
  --region $REGION \
  --output text

echo "==> Done. Site live at https://cids.training"
