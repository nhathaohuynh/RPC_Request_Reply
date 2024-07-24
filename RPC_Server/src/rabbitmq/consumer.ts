import { Channel, ConsumeMessage } from 'amqplib'
import MessageHanler from '../messageHandler'

export default class Consumer {
	constructor(private channel: Channel, private rpcQueue: string) {}

	async consumeMessages() {
		this.channel.consume(
			this.rpcQueue,
			async (msg: ConsumeMessage) => {
				const { correlationId, replyTo } = msg.properties

				const operation = msg.properties.headers.function

				if (!correlationId || !replyTo) {
					console.log('Missing some properties')
				} else {
					await MessageHanler.handler(
						operation,
						JSON.parse(msg.content.toString()),
						correlationId,
						replyTo,
					)
				}
			},
			{
				noAck: true,
			},
		)
	}
}
