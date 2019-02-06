import { Document, Model, model, Schema } from 'mongoose';
const timestamps = require('mongoose-timestamp');

interface ISubmission extends Document {
  user?: string;
  title: string;
  exercise?: string;
  studentNick?: string;
  content?: string;
  finished?: boolean;
  comment?: string;
  type: string;
  image: string;
}

const SubmissionMongSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'UserModel',
  },

  title: {
    type: String,
    default: 'New Submission',
  },

  exercise: {
    type: Schema.Types.ObjectId,
    ref: 'ExerciseModel',
  },

  document: {
    type: Schema.Types.ObjectId,
    ref: 'DocumentModel',
  },

  studentNick: {
    type: String,
  },

  content: {
    type: String,
    default: 'content',
  },

  submissionToken: {
    type: String,
  },

  finished: {
    type: Boolean,
    default: false,
  },

  type: {
    type: String,
  },

  comment: {
    type: String,
  },

  finishedAt: {
    type: Date,
  },
});
SubmissionMongSchema.plugin(timestamps);
export const SubmissionModel: Model<ISubmission> = model<ISubmission>(
  'SubmissionModel',
  SubmissionMongSchema,
);
