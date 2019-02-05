import { Document, Model, model, Schema  } from "mongoose";
const timestamps = require("mongoose-timestamp");

interface ILogs extends Document {
  user?: string,
  object?: string,
  action?: string,
  operatingSystem?: string;
  data?: string,
}

const LogsSchema = new Schema({
  user: {
    id: Schema.Types.ObjectId,
    ref: "User",
  },

  object: {
    id: Schema.Types.ObjectId,
    ref: "Object",
  },

  action: {
    type: String,
  },

  date: {
    type: Date,
    default: Date.now(),
  },

  operatingSystem: {
    type: String,
  },

  data: {
    type: String,
  },
});

LogsSchema.plugin(timestamps);
export const LogModels: Model<ILogs> = model<ILogs>(
  "LogModels",
  LogsSchema,
);
