import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { WebSocket } from '../resources/WebSocket';
import { ControlApi } from '../resources/ControlApi';

export class WebsocketCallback extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps & {
    domain?: string,
    targetUrl: string,
    jwtSecret: string,
  }) {
    super(scope, id, props);

    const { domain, targetUrl, jwtSecret } = props

    const webSocket = new WebSocket(this, 'websocket', {
      domain,
      targetUrl,
      jwtSecret,
    })

    const controlApi = new ControlApi(this, 'controller', {
      webSocket,
      jwtSecret,
    })

    new cdk.CfnOutput(this, 'region', {
      value: cdk.Stack.of(this).region
    })
    new cdk.CfnOutput(this, 'websocketUrl', {
      value: domain ? `wss://${domain}/` : webSocket.stage.url,
      description: 'Websocket URL',
    })
    new cdk.CfnOutput(this, 'callbackUrl', {
      value: controlApi.url,
      description: 'External Websocket callback URL',
    })
    new cdk.CfnOutput(this, 'targetUrl', {
      value: targetUrl,
      description: 'Url to send websocket events to'
    })
  }
}
