import { Document, Model, model, Schema } from 'mongoose';
const timestamps = require('mongoose-timestamp');

interface IUser extends Document {
  email?: string;
  password?: string;
  name?: string;
  center?: string;
  active?: boolean;
  signUpToken?: string;
  authToken?: string;
  notifications?: boolean;
  signUpSurvey?: JSON;
}

export const ContactSchema: Schema = new Schema({
  // id: Schema.Types.ObjectId,

  email: {
    type: String,
    unique: true,
    required: 'Please enter your email',
    trim: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    trim: true,
  },

  center: {
    type: String,
    trim: true,
  },

  active: {
    type: Boolean,
  },

  signUpToken: {
    type: String,
    default: 'aa',
  },

  authToken: {
    type: String,
    default: 'aa',
  },

  notifications: {
    type: Boolean,
  },

  signUpSurvey: {
    type: Schema.Types.Mixed,
  },
});

ContactSchema.plugin(timestamps);
export const UserModel: Model<IUser> = model<IUser>(
  'UserModels',
  ContactSchema,
);
