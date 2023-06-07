import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { deleteProduct } from '../../businessLogic/products'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const productId = event.pathParameters.productId;

    const logger = createLogger('deleteProduct');
    const userId = getUserId(event);
    try {
      await deleteProduct(productId, userId);
      logger.info('Deleted item ' + productId)
      return {
        statusCode: 200,
        body: ''
      }
    } catch (e) {
      logger.error('deleteProduct error: ' + e.message)
      return {
        statusCode: e.statusCode,
        body: 'Delete item fail'
      }
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      origin: '*',
      credentials: true
    })
  )
