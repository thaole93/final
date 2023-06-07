import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { updateProduct } from '../../businessLogic/products'
import {ProductItem} from "../../models/ProductItem";
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const logger = createLogger('updateProduct');

    const productId = event.pathParameters.productId;
    const userId = getUserId(event);
    logger.info('UserId: ' + userId);
    const item: ProductItem = JSON.parse(event.body);
    
    try {
      const result = await updateProduct(productId, userId, item);
      return {
        statusCode: 200,
        body: result
      }
    } catch (e) {
      logger.error('updateProduct error: ' + e.message);
      return {
        statusCode: e.statusCode,
        body: 'Update item fail'
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
