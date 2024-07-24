import express, { Request, Response } from 'express'
import RabbitClient from './rabbitmq/client'

const app = express()
const port = process.env.PORT || 5000

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.post('/operate', async (req: Request, res: Response) => {
	const data = await RabbitClient.produce(req.body)
	return res.status(200).json(data)
})

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`)
	RabbitClient.initialize()
})
