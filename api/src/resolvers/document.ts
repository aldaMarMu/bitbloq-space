import { ApolloError } from 'apollo-server-koa';
import { ObjectId } from 'bson';
import { DocumentModel } from '../models/document';
import { ExerciseModel } from '../models/exercise';
import { SubmissionModel } from '../models/submission';
import { UploadModel } from '../models/upload';
import uploadResolver from './upload';

const documentResolver = {
  Mutation: {
    /**
     * Create document: create a new empty document
     * It stores the new document in the database and if there is a image,
     * it uploads to Google Cloud and stores the public URL.
     * args: document information
     */
    createDocument: async (root: any, args: any, context: any) => {
      const documentNew = new DocumentModel({
        id: ObjectId,
        user: context.user.userID,
        title: args.input.title,
        type: args.input.type,
        content: args.input.content,
        description: args.input.description,
        version: args.input.version,
        image: args.input.imageUrl,
      });
      const newDocument = await DocumentModel.create(documentNew);

      if (args.input.image) {
        const imageUploaded = await uploadResolver.Mutation.singleUpload(
          args.input.image,
          newDocument._id,
        );
        return DocumentModel.findOneAndUpdate(
          { _id: documentNew._id },
          { $set: { image: imageUploaded.publicUrl } },
          { new: true },
        );
      } else {
        return newDocument;
      }
    },

    /**
     * Delete document: delete one document of the user logged.
     * It deletes the document passed in the arguments if it belongs to the user logged.
     * This method deletes all the exercises, submissions and uploads related with the document ID.
     * args: document ID
     */
    deleteDocument: async (root: any, args: any, context: any) => {
      const existDocument = await DocumentModel.findOne({
        _id: args.id,
        user: context.user.userID,
      });
      if (existDocument) {
        await UploadModel.deleteMany({ document: existDocument._id });
        await SubmissionModel.deleteMany({ document: existDocument._id });
        await ExerciseModel.deleteMany({ document: existDocument._id });
        return DocumentModel.deleteOne({ _id: args.id }); // delete all the document dependencies
      } else {
        throw new ApolloError(
          'You only can delete your documents',
          'DOCUMENT_NOT_FOUND',
        );
      }
    },
    /**
     * Update document: update existing document.
     * It updates the document with the new information provided.
     * args: document ID, new document information.
     */
    updateDocument: async (root: any, args: any, context: any) => {
      const existDocument = await DocumentModel.findOne({
        _id: args.id,
        user: context.user.userID,
      });

      if (existDocument) {
        if (args.input.image) {
          const imageUploaded = await uploadResolver.Mutation.singleUpload(
            args.input.image,
            existDocument._id,
          );
          const documentUpdate = {
            title: args.input.title || existDocument.title,
            type: args.input.type || existDocument.type,
            content: args.input.content || existDocument.content,
            description: args.input.description || existDocument.description,
            version: args.input.version || existDocument.version,
            image: imageUploaded.publicUrl,
          };
          return DocumentModel.findOneAndUpdate(
            { _id: existDocument._id },
            { $set: documentUpdate },
            { new: true },
          );
        } else if (args.input.imageUrl) {
          const documentUpdate = {
            title: args.input.title || existDocument.title,
            type: args.input.type || existDocument.type,
            content: args.input.content || existDocument.content,
            description: args.input.description || existDocument.description,
            version: args.input.version || existDocument.version,
            image: args.input.imageUrl,
          };
          return DocumentModel.findOneAndUpdate(
            { _id: existDocument._id },
            { $set: documentUpdate },
            { new: true },
          );
        } else {
          return DocumentModel.findOneAndUpdate(
            { _id: existDocument._id },
            { $set: args.input },
            { new: true },
          );
        }
      } else {
        return new ApolloError('Document does not exist', 'DOCUMENT_NOT_FOUND');
      }
    },
  },
  Query: {
    /**
     * Documents: returns all the documents of the user logged.
     * args: nothing.
     */
    documents: async (root: any, args: any, context: any) => {
      return DocumentModel.find({ user: context.user.userID });
    },
    /**
     * Document: returns the information of the document ID provided in the arguments.
     * args: document ID.
     */
    document: async (root: any, args: any, context: any) => {
      const existDocument = await DocumentModel.findOne({
        _id: args.id,
      });
      if (!existDocument) {
        throw new ApolloError('Document does not exist', 'DOCUMENT_NOT_FOUND');
      }
      if (existDocument.user !== context.user.userID) {
        throw new ApolloError(
          'This ID does not belong to one of your documents',
          'NOT_YOUR_DOCUMENT',
        );
      }
      return existDocument;
    },
  },

  Document: {
    exercises: async document => ExerciseModel.find({ document: document._id }),
    images: async document => UploadModel.find({ document: document._id }),
  },
};

export default documentResolver;
