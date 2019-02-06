import { ApolloError } from 'apollo-server-koa';
import { ObjectID } from 'bson';
import { UploadModel } from '../models/upload';

const { Storage } = require('@google-cloud/storage');

const storage = new Storage(process.env.GCLOUD_PROJECT_ID); // proyect ID
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET); // bucket name
const bucketName: string = process.env.GCLOUD_STORAGE_BUCKET;

let publicUrl: string;

const processUpload = async (createReadStream, filename, resolve, reject) => {
  const gcsName: string = Date.now() + filename;
  const file = bucket.file(gcsName);

  const opts = {
    metadata: {
      cacheControl: 'private, max-age=0, no-transform',
    },
  };
  const fileStream = createReadStream();
  const gStream = file.createWriteStream(opts);
  gStream
    .on('error', err => {
      reject(new ApolloError('Error uploading file', 'UPLOAD_ERROR'));
    })
    .on('finish', async err => {
      if (err) {
        throw new ApolloError('Error uploading file', 'UPLOAD_ERROR');
      }

      file.makePublic().then(() => {
        publicUrl = getPublicUrl(gcsName);
        resolve('OK');
      });
    });

  fileStream.pipe(gStream);
};

function getPublicUrl(filename) {
  const finalName: string = encodeURIComponent(filename);
  return `https:// storage.googleapis.com/${bucketName}/${finalName}`;
}

const uploadResolver = {
  Query: {
    uploads: () => UploadModel.find({}),
  },
  Mutation: {
    singleUpload: async (file, documentID) => {
      const { createReadStream, filename, mimetype, encoding } = await file;

      await new Promise((resolve, reject) => {
        processUpload(createReadStream, filename, resolve, reject);
      });

      const uploadNew = new UploadModel({
        id: ObjectID,
        document: documentID,
        filename,
        mimetype,
        encoding,
        publicUrl,
      });
      return UploadModel.create(uploadNew);
    },
  },
};

export default uploadResolver;
