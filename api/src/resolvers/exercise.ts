import { AuthenticationError } from 'apollo-server-koa';
import { ExerciseModel } from '../models/exercise';
import { DocumentModel } from '../models/document';
import { ObjectId } from 'bson';
import { SubmissionModel } from '../models/submission';
import { UserModel } from '../models/user';

const exerciseResolver = {
  Mutation: {
    createExercise: async (root: any, args: any, context: any) => {
      if (!context.user.userID)
        throw new AuthenticationError('You need to be logged in');
      const docFound = await DocumentModel.findOne({
        _id: args.input.document,
        user: context.user.userID,
      });
      if (!docFound)
        throw new Error(
          'Error creating exercise, it should part of one of your documents',
        );
      const user = await UserModel.findById(context.user.userID);
      const newCode = Math.random()
        .toString(36)
        .substr(2, 6);
      const exerciseNew = new ExerciseModel({
        id: ObjectId,
        user: context.user.userID,
        document: docFound._id,
        title: args.input.title,
        code: newCode,
        type: docFound.type,
        acceptSubmissions: args.input.acceptSubmissions,
        content: docFound.content,
        description: args.input.description,
        teacherName: user.name,
        expireDate: args.input.expireDate,
        versions: args.input.versions,
      });
      return ExerciseModel.create(exerciseNew);
    },

    changeSubmissionsState: async (root: any, args: any, context: any) => {
      if (!context.user.userID)
        throw new AuthenticationError('You need to be logged in');
      const existExercise = await ExerciseModel.findOne({
        _id: args.id,
        user: context.user.userID,
      });
      if (!existExercise) {
        return new Error('Exercise does not exist');
      }
      return ExerciseModel.findOneAndUpdate(
        { _id: existExercise._id },
        { $set: { acceptSubmissions: args.subState } },
        { new: true },
      );
    },

    deleteExercise: async (root: any, args: any, context: any) => {
      if (!context.user.userID)
        throw new AuthenticationError('You need to be logged in');

      return ExerciseModel.deleteOne({ _id: args.id });
    },

    updateExercise: async (root: any, args: any, context: any) => {
      if (!context.user.userID)
        throw new AuthenticationError('You need to be logged in');
      const existExercise = await ExerciseModel.findOne({
        _id: args.id,
        user: context.user.userID,
      });
      if (existExercise) {
        return ExerciseModel.findOneAndUpdate(
          { _id: existExercise._id },
          { $set: args.input },
          { new: true },
        );
      } else {
        return new Error('Exercise does not exist');
      }
    },
  },

  Query: {
    exercisesByDocument: async (root: any, args: any, context: any) => {
      if (!context.user.userID)
        throw new AuthenticationError('You need to be logged in');
      const documentFound = await DocumentModel.findOne({
        _id: args.document,
        user: context.user.userID,
      });
      if (!documentFound) throw new Error('document does not exist');
      const ex = await ExerciseModel.find({
        document: documentFound._id,
        user: context.user.userID,
      });
      if (ex.length == 0) {
        throw new Error('No exercises for this document');
      }
      return ex;
    },

    //student and user query
    exercise: async (root: any, args: any, context: any) => {
      if (!context.user)
      throw new AuthenticationError(
        'You need to be logged in as a user or as a student',
      );
      if (context.user.exerciseID) {
        //Token de alumno
        if (context.user.exerciseID != args.id)
          throw new Error('You only can ask for your token exercise');
        const ex = await ExerciseModel.findOne({
          _id: context.user.exerciseID,
        });
        if (!ex) {
          throw new Error('Exercise does not exist');
        }
        return ex;
      } else if (context.user.userID) {
        //token de profesor
        const ex = await ExerciseModel.findOne({
          _id: args.id,
          user: context.user.userID,
        });
        if (!ex) {
          throw new Error('Exercise does not exist');
        }
        return ex;
      }
    },

    exercises: async (root: any, args: any, context: any) => {
      if (!context.user.userID)
        throw new AuthenticationError('You need to be logged in');
      return  ExerciseModel.find({ user: context.user.userID });
    },
  },

  Exercise: {
    submissions: async exercise =>
      SubmissionModel.find({ exercise: exercise._id }),
  },
};

export default exerciseResolver;
