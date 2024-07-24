import { Channel, ConsumeMessage } from 'amqplib'
import { EventEmitter } from 'stream'

export default class Consumer {
	constructor(
		private channel: Channel,
		private replyQueueName: string,
		private eventEmitter: EventEmitter,
	) {}

	async consumeMessages() {
		console.log('Ready to consume messages')

		this.channel.consume(
			this.replyQueueName,
			(msg: ConsumeMessage) => {
				console.log(' [x] Received', JSON.parse(msg?.content.toString()))
				this.eventEmitter.emit(msg.properties.correlationId.toString(), msg)
			},
			{
				noAck: true,
			},
		)
	}
}
