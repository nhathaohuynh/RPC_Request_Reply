import rabbitClient from './rabbitmq/client'
export default class MessageHanler {
	static async handler(
		operation: string,
		data: any,
		correlationId: string,
		replyTo: string,
	) {
		const reponse = {}

		const { num1, num2 } = data

		console.log('the operation is: ', operation)

		switch (operation) {
			case 'sum':
				reponse['result'] = num1 + num2
				break
			case 'multiply':
				reponse['result'] = num1 * num2
				break
			default:
				reponse['result'] = 'Invalid operation'
		}

		await rabbitClient.produce(reponse, correlationId, replyTo)
	}
}
