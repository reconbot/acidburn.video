# Websocket Lambda Channel Server

This CDK project creates a websocket server that allows clients to join channels and publish messages while they're in the channel.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## API

The websocket API has the following api (ts types)

### Incoming Messages (from clients)

- `{ type: "join", channelId: string }` - joins their connection to a channel, you should wait for a `joinSuccess` message before sending `publish` messages
- `{ type: "publish", data: any }` - publishes a data to the joined channel, if you're not part of a channel you'll get a `publishFailure` event, the data will show up as "messages" to other connections in a channel
- `{ type: "ping", data?: any }` - test a connection by sending some data that will be returned on a `pong`

### Outgoing Messages (from the server)

- `{ type: "message", senderId: string, data: any }` - sent to everyone in a channel in response to a `publish` event. the `senderId` is a random string generated per "join" and can be used to identify senders, if someone reconnects or rejoins they will have a new `senderId`.
- `{ type: "pong", data?: any }` - sent to a connection in response to a `ping`
- `{ type: "joinSuccess" }` - sent when you are joined to a channel, after this message you are safe to send messages
- `{ type: "joinFailure" }` - sent when you try to join an invalid channel
- `{ type: "publishFailure", data: string }` - sent when you try to `publish` without joining a channel
- `{ type: "publishSuccess" }` - sent after your `publish` has been sent to all connections in a channel


Due to API gateway limitations connections we can't send protocol level ping events to clients. Timeouts of idle connections are 10, maximum lifetime of a connection is 2 hours. You can use the ping/pong events as a heartbeat to keep connections alive if you desire.

## Database

This will create a DDB table called `Connections`

- partitionKey: connectionId
- sortKey: channelId

It also has a GSI for fetching connections in a channel

- partitionKey: channelId

## Todo

- maybe send heartbeats from the server with step functions

### HTTP Integration
I want to see if we can use api gateway http integration to send events to an http server direclty. Right now I have a velocity template that works for connections but not for anything else (haven't tried yet). The connection fails however even if it posts the correct info. Additionally there is no CDK support at l2, so I need to figure out how to make it in l1 constructs.

```json
// Template Selection Expression \$default
// Template Key $default
{
  "connectionId": "$context.connectionId",
  "domain": "$context.domainName",
  "eventType": "CONNECT"
}
```

Docs
- https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-integration-responses.html
- https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-route-keys-connect-disconnect.html
- https://stackoverflow.com/questions/54001752/aws-websocket-api-gateway-template-selection-expressions-examples

#### Connection template


## Useful commands

- `pnpm run build`   compile typescript to js
- `pnpm run watch`   watch for changes and compile
- `pnpm run test`    perform the jest unit tests
- `pnpm cdk deploy`      deploy this stack to your default AWS account/region
- `pnpm cdk diff`        compare deployed stack with current state
- `pnpm cdk synth`       emits the synthesized CloudFormation template
- `pnpm npx wscat -c wss://ws-2.telley.live`     connect to the websocket with wscat, first deploy might take a few minutes after deploy to respond
