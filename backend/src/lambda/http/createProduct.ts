import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateProductRequest } from '../../requests/CreateProductRequest'
import { createProduct } from '../../businessLogic/products'
import { createLogger } from '../../utils/logger'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newProduct: CreateProductRequest = JSON.parse(event.body)

    const logger = createLogger('createProduct');

    try {
      const result = await createProduct(newProduct, event);
      return {
        statusCode: 201,
        body: JSON.stringify({
          item: result
        })
      }
    } catch (e) {
      logger.error('createProduct error: ' + e.message);
      return {
        statusCode: e.statusCode,
        body: 'Create item fail'
      }
    }
  }
)

handler.use(
  cors({
    origin: '*',
    credentials: true
  })
)
