import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocument, QueryCommandInput } from "@aws-sdk/lib-dynamodb"
import { nanoid } from 'nanoid'
import { Connection } from "../../lib/types"
import { collect, take } from "streaming-iterables"

export class DDBClient {
  client: DynamoDBClient
  ddbDocClient: DynamoDBDocument
  ddbTable: string

  constructor(ddbTable: string) {
    this.client = new DynamoDBClient({})
    this.ddbDocClient = DynamoDBDocument.from(this.client)
    this.ddbTable = ddbTable
  }

  async queryOnce<T = Record<string, any>>(options: QueryCommandInput) {
    const response = await this.ddbDocClient.query({
      Select: 'ALL_ATTRIBUTES',
      ...options,
    })

    const { Items, LastEvaluatedKey, Count } = response
    return {
      items: (Items ?? []) as T[],
      lastEvaluatedKey: LastEvaluatedKey,
      count: Count ?? 0,
    }
  }

  async *query<T>(options: QueryCommandInput) {
    const results = await this.queryOnce<T>(options)
    yield* results.items
    let lastEvaluatedKey = results.lastEvaluatedKey
    while (lastEvaluatedKey) {
      const results = await this.queryOnce<T>({ ...options, ExclusiveStartKey: lastEvaluatedKey })
      yield* results.items
      lastEvaluatedKey = results.lastEvaluatedKey
    }
  }

  async join(item: Omit<Connection, 'ttl' | 'senderId'>) {
    // upsert a connection's channel and ttl
    await this.ddbDocClient.put({
      TableName: this.ddbTable,
      Item: {
        ...item,
        senderId: nanoid(),
        ttl: Math.floor(Date.now() / 1000) + (2 * 61 * 60) // 2 hours connection limit + 1 minute latency allowance
      }
    })
  }

  async disconnect(connectionId: string) {
    for await (const connection of this.query<Connection>({
      TableName: this.ddbTable,
      KeyConditions: {
        connectionId: {
          AttributeValueList: [connectionId],
          ComparisonOperator: 'EQ',
        },
      }
    })) {
      await this.ddbDocClient.delete({
        TableName: this.ddbTable,
        Key: {
          connectionId: connection.connectionId,
          channelId: connection.channelId,
        }
      })
    }
  }

  async getConnectionByConnectionID(connectionId: string): Promise<Connection | null> {
    const connections = this.query<Connection>({
      TableName: this.ddbTable,
      KeyConditions: {
        connectionId: {
          AttributeValueList: [connectionId],
          ComparisonOperator: 'EQ',
        },
      }
    })
    const [item] = await collect(take(1,connections))
    return item ?? null
  }

  itrConnectionsByChannelId(channelId: string) {
    return this.query<Connection>({
      TableName: this.ddbTable,
      IndexName: 'byChannelId',
      KeyConditions: {
        channelId: {
          AttributeValueList: [channelId],
          ComparisonOperator: 'EQ',
        },
      }
    })
  }
}
