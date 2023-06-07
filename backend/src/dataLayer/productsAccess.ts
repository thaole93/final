import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { ProductItem } from '../models/ProductItem'
import { UpdateProductRequest } from "../requests/UpdateProductRequest";
import { s3Helper } from '../fileStorage/s3Helper';

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('ProductsAccess')

export class ProductsAccess {

  docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient();
  productTable: string = 'Products';
  indexName: string = 'CreatedAtIndex';

  async getProductsForUser(userId: string): Promise<ProductItem[]> {
    const result = await this.docClient.query({
      TableName: this.productTable,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      }
    }).promise();

    if (result.Count !== 0) {
      for (const record of result.Items) {
        const productUrl = s3Helper.getReadSignedUrl(record.productId);
        record.productUrl = productUrl;
      }
    }

    return result.Items as ProductItem[];
  }

  async createProduct(item: ProductItem): Promise<ProductItem> {
    await this.docClient.put({
      TableName: this.productTable,
      Item: item
    }).promise();

    return item;
  }

  async getProductById(productId: string): Promise<ProductItem> {
    const result = await this.docClient.query({
      TableName: this.productTable,
      IndexName: this.indexName,
      KeyConditionExpression: "productId = :productId",
      ExpressionAttributeValues: {
        ":productId": productId
      }
    }).promise();

    if (result.Count == 0) {
      logger.error('Not found product id ' + productId);
      throw new Error('Not found product id ' + productId);
    }

    const item = result.Items[0] as ProductItem;
    item.productUrl = s3Helper.getReadSignedUrl(productId);
    return item;
  }

  async updateProduct(productId: string, userId: string, item: UpdateProductRequest): Promise<String> {
    await this.docClient.update({
      TableName: this.productTable,
      Key: {
        productId: productId,
        userId: userId
      },
      UpdateExpression: " SET #name = :name , releaseDate = :releaseDate, "
        + "price = :price, currency = :currency, description = :description, released = :released",
      ExpressionAttributeValues: {
        ":name": item.name || null,
        ":releaseDate": item.releaseDate || null,
        ":price": item.price || null,
        ":currency": item.currency || null,
        ":description": item.description || null,
        ":released": item.released || null
      },
      ExpressionAttributeNames: {
        "#name": "name"
      }
    }).promise();
    return "updated Product " + productId;
  }

  async deleteItem(productId: string, userId: string): Promise<any> {
    return this.docClient.delete({
      TableName: this.productTable,
      Key: {
        productId: productId,
        userId: userId
      }
    }).promise();
  }
}