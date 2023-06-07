import { ProductsAccess } from '../dataLayer/productsAccess'
import { ProductItem } from '../models/ProductItem'
import { CreateProductRequest } from '../requests/CreateProductRequest'
import { UpdateProductRequest } from '../requests/UpdateProductRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

import {getUserId} from "../lambda/utils";
import {APIGatewayProxyEvent} from "aws-lambda";
import { s3Helper } from '../fileStorage/s3Helper'

const productAccess = new ProductsAccess();
const logger = createLogger('products')

export async function createProduct(req: CreateProductRequest, 
                                event: APIGatewayProxyEvent): Promise<ProductItem>{
    
    const userId = getUserId(event);
    if(!userId) logger.error('Invalid user with id ' + userId)

    const productId = uuid.v4();
    const item: ProductItem = {
        userId: userId,
        productId: productId,
        name: req.name,
        releaseDate: req.releaseDate,
        price: req.price,
        currency: req.currency,
        description: req.description,
        released: false,
        createdAt: new Date().toISOString()
    }

    logger.info('createProduct ' + item);
    const result = await productAccess.createProduct(item);

    logger.info('produc created: ' + result);
    return result;
}

export async function getProductsForUser(userId: string): Promise<ProductItem[]>{
    const result = await productAccess.getProductsForUser(userId);
    return result;
}

export async function getProductById(productId : string){
    return await productAccess.getProductById(productId);
}

export async function updateProduct(productId: string, userId: string, 
                                updateRequest: UpdateProductRequest): Promise<any>{
    const item = await getProductById(productId);
    if( item.userId !== userId)
    {
        logger.error('User ' + userId + ' do not have permission to update item' + productId);
        throw createError(409, 'User ' + userId + ' do not have permission to update item' + productId);
    }
    return productAccess.updateProduct(productId, userId, updateRequest);
}

export async function deleteProduct(productId: string, userId: string): Promise<any>{
    const item = await getProductById(productId);
    if( item.userId !== userId){
        logger.error('User ' + userId + ' do not have permission to delete item ' + productId);
        throw createError(409, 'User ' + userId + ' do not have permission to delete item ' + productId);
    }
    await productAccess.deleteItem(productId, userId);
}

export async function createProductPresignedUrl(productId: string): Promise<string>{
    return s3Helper.getPutSignedUrl(productId, 'image/png');
}