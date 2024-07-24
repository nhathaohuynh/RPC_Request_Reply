import { Channel, connect, Connection } from 'amqplib'
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

	async initialize() {
		if (this.isInitialized) {
			return
		}
		try {
			this.connection = await connect(config.rabbitMQ.url)

			this.producerChannel = await this.connection.createChannel()
			this.consumerChannel = await this.connection.createChannel()

			const { queue: rpcQueue } = await this.consumerChannel.assertQueue(
				config.rabbitMQ.queues.rpcQueue,
				{ exclusive: true },
			)

			this.consumer = new Consumer(this.consumerChannel, rpcQueue)
			this.producer = new Producer(this.producerChannel)

			this.consumer.consumeMessages()
			this.isInitialized = true
		} catch (err) {
			console.log('rabbitMQ error ....', err)
		}
	}

	async produce(data: any, corelationId: string, replyTo: string) {
		if (!this.isInitialized) {
			await this.initialize()
		}
		return await this.producer.produceMessage(data, corelationId, replyTo)
	}

	public static getInstance() {
		if (!RabbitClient.instance) {
			RabbitClient.instance = new RabbitClient()
		}
		return RabbitClient.instance
	}
}

export default RabbitClient.getInstance()
