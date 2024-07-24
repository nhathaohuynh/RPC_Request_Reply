import { Channel } from 'amqplib'
import { randomUUID } from 'crypto'
import EventEmitter from 'events'
import config from '../config'

export class Producer {
	constructor(
		private channel: Channel,
		private replyQueueName: string,
		private eventEmitter: EventEmitter,
	) {}

	async produceMessage(data: any) {
		const uuid = randomUUID()

		console.log('the correlationId is: ', uuid)
		this.channel.sendToQueue(
			config.rabbitMQ.queues.rpcQueue,
			Buffer.from(JSON.stringify(data)),
			{
				replyTo: this.replyQueueName,
				correlationId: uuid,
				headers: {
					function: data.operation,
				},
			},
		)

		return new Promise((resolve, reject) => {
			this.eventEmitter.once(uuid, async (msg) => {
				resolve(JSON.parse(msg.content.toString()))
			})
		})

		// this.eventEmitter.once is used to listen for a single occurrence of the event
	}
}
