import { Channel, connect, Connection } from 'amqplib'
import { EventEmitter } from 'events'
import config from '../config'
import Consumer from './consumer'
import { Producer } from './producer'

class RabbitClient {
	private producer: Producer
	private consumer: Consumer

	private connection: Connection
	private producerChannel: Channel
	private consumerChannel: Channel

	private static instance: RabbitClient
	private isInitialized = false

	private eventEmitter: EventEmitter

	async initialize() {
		if (this.isInitialized) {
			return
		}
		try {
			this.connection = await connect(config.rabbitMQ.url)

			this.producerChannel = await this.connection.createChannel()
			this.consumerChannel = await this.connection.createChannel()

			const { queue: replyQueueName } = await this.consumerChannel.assertQueue(
				'',
				{ exclusive: true },
			)

			this.eventEmitter = new EventEmitter()

			this.consumer = new Consumer(
				this.consumerChannel,
				replyQueueName,
				this.eventEmitter,
			)
			this.producer = new Producer(
				this.producerChannel,
				replyQueueName,
				this.eventEmitter,
			)

			this.consumer.consumeMessages()
			this.isInitialized = true
		} catch (err) {
			console.log('rabbitMQ error ....', err)
		}
	}

	async produce(data: any) {
		if (!this.isInitialized) {
			await this.initialize()
		}
		return await this.producer.produceMessage(data)
	}

	public static getInstance() {
		if (!RabbitClient.instance) {
			RabbitClient.instance = new RabbitClient()
		}
		return RabbitClient.instance
	}
}

export default RabbitClient.getInstance()
