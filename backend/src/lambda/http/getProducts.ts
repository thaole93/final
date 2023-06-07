import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

import { getProductsForUser as getProductsForUser } from '../../businessLogic/products'
import { getUserId } from '../utils';

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const logger = createLogger('getProducts');

    try {
      const userId = getUserId(event);
      logger.info('Get list products of user ' + userId);
      const products = await getProductsForUser(userId);
      return {
        statusCode: 200,
        body: JSON.stringify({ items: products })
      }
    } catch (e) {
      logger.error('getProducts error: ' + e.message );
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.message
        })
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
