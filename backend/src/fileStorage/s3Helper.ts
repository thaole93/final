import * as AWS from 'aws-sdk'
import {createLogger} from "../utils/logger";

const logger = createLogger('s3Helper');

export class s3Helper {

  static s3: any = new AWS.S3({ signatureVersion: 'v4' });
  static bucket: string = process.env.ATTACHMENT_S3_BUCKET;
  static expireTime = parseInt(process.env.SIGNED_URL_EXPIRATION);

  static getPutSignedUrl(productId: string, contentType: string): string {
    const signedUrl = this.s3.getSignedUrl('putObject', {
      Bucket: this.bucket,
      Key: `${productId}.png`,
      Expires: this.expireTime,
      ContentType: contentType
    });
    logger.info('Generated signed url for put operation ' + signedUrl)
    return signedUrl;
  }


  static getReadSignedUrl(productId: string): string {
    const signedUrl = this.s3.getSignedUrl('getObject', {
      Bucket: this.bucket,
      Key: `${productId}.png`,
      Expires: this.expireTime
    });
    logger.info('Generated signed url for get operation ' + signedUrl)
    return signedUrl;
  }

}
