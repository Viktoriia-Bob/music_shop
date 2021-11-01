import * as AWS from 'aws-sdk';
import * as multer from 'multer';
import * as multers3 from 'multer-s3';

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_ID,
  secretAccessKey: process.env.S3_ACCESS_KEY,
});
const UploadMiddleware = multer({
  storage: multers3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + file.originalname);
    },
  }),
});

export = UploadMiddleware;
