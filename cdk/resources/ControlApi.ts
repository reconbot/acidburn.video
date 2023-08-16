import { Architecture } from "aws-cdk-lib/aws-lambda"
import { Construct } from "constructs"
import {HttpApi } from "@aws-cdk/aws-apigatewayv2-alpha"
import { Aws, Duration } from "aws-cdk-lib"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { RetentionDays } from "aws-cdk-lib/aws-logs"
import { Runtime } from "aws-cdk-lib/aws-lambda"
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha"
import { WebSocket } from "./WebSocket"

export class ControlApi extends Construct {
  url: string

  constructor(scope: Construct, id: string, {
    webSocket,
    jwtSecret,
  }: {
    webSocket: WebSocket
    jwtSecret: string
  }) {
    super(scope, id)

    const eventHandler = new NodejsFunction(this, 'handler', {
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      memorySize: 128,
      architecture: Architecture.ARM_64,
      environment: {
        CALLBACK_URL: webSocket.stage.callbackUrl,
        JWT_SECRET: jwtSecret,
      },
      logRetention: RetentionDays.THREE_MONTHS,
    })

    webSocket.stage.grantManagementApiAccess(eventHandler)

    const api = new HttpApi(this, 'controlApi', {
      apiName: `${Aws.STACK_NAME}-controlApi`,
      defaultIntegration: new HttpLambdaIntegration('DefaultIntegration', eventHandler),
    })
    this.url = api.url!
  }
}

