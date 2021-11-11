import * as AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_ID,
  secretAccessKey: process.env.S3_ACCESS_KEY,
  signatureVersion: 'v4',
  region: 'eu-central-1',
});

const signedUrlMiddleware = async (keyValue) => {
  return s3.getSignedUrl('getObject', {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: keyValue,
    Expires: 1800,
  });
};

export = signedUrlMiddleware;
