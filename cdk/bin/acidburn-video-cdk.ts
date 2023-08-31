#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SlipSocketStack } from '@slip-sockets/stack'

const { TARGET_URL, JWT_SECRET } = process.env

if (!TARGET_URL) {
  throw new Error('ENV var TARGET_URL needs to be set')
}

if (!JWT_SECRET) {
  throw new Error('ENV var JWT_SECRET needs to be set')
}

const app = new cdk.App();
new SlipSocketStack(app, 'acidburn-video-production', {
  domain: 'ws.acidburn.video',
  targetUrl: TARGET_URL,
  jwtSecret: JWT_SECRET,
  tags: {
    Name: 'acidburn-video-production',
  },
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

new SlipSocketStack(app, 'acidburn-video-staging', {
  domain: 'ws-staging.acidburn.video',
  targetUrl: TARGET_URL,
  jwtSecret: JWT_SECRET,
  tags: {
    Name: 'acidburn-video-staging',
  },
 env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
