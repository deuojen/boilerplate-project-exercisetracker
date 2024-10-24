// const express = require('express');
// const bodyParser = require('body-parser');
// const app = express();
// const cors = require('cors');
// require('dotenv').config();

// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// let userSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//   },
// });

// let exerciseSchema = new mongoose.Schema({
//   userid: { type: Schema.Types.ObjectId, ref: 'User' },
//   username: String,
//   description: {
//     type: String,
//     required: true,
//   },
//   duration: {
//     type: Number,
//     required: true,
//   },
//   date: {
//     type: Date,
//     required: true,
//   },
// });

// let User = mongoose.model('User', userSchema);
// let Exercise = mongoose.model('Exercise', exerciseSchema);

// app.use(cors());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.static('public'));
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/views/index.html');
// });

// app
//   .get('/api/users/:_id', async (req, res) => {
//     let user = await User.findById({ _id: req.params._id }).select().exec();
//     res.json(user);
//   })
//   .get('/api/users', async (req, res) => {
//     let users = await User.find({}).select().exec();
//     res.json(users);

//     // await User.deleteMany({});
//     // await Exercise.deleteMany({});
//   })
//   .post('/api/users', async (req, res) => {
//     let username = req.body.username;
//     let user = new User({ username });
//     let result = await user.save();
//     res.json(result);
//   });

// app.get('/api/users/:_id/logs', async (req, res) => {
//   let user = await User.findById({ _id: req.params._id }).select().exec();
//   let exercises = await Exercise.find({ userid: req.params._id })
//     .select()
//     .exec();

//   // [from][&to][&limit]
//   //console.log(req.params);

//   if (req.query.from) {
//     console.log(req.params._id);
//     console.log(req.query);

//     const limit = Number(req.query.limit) || 500;
//     const from = req.query.from || new Date(0);
//     const to = req.query.to || new Date();

//     console.log('with query');
//     exercises = await Exercise.find({
//       userid: req.params._id,
//       date: { $gte: from, $lte: to },
//     })
//       .select()
//       .limit(limit)
//       .exec();

//     console.log(from);
//     console.log(to);
//     console.log(exercises);
//   }

//   res.json({
//     username: user.username,
//     count: exercises.length,
//     _id: user._id,
//     log: exercises.map((x) => ({
//       description: x.description,
//       duration: x.duration,
//       date: x.date.toDateString(),
//     })),
//   });
// });

// app.post('/api/users/:_id/exercises', async (req, res) => {
//   let description = req.body.description;
//   let duration = req.body.duration;
//   let date = isBlank(req.body.date) ? new Date() : new Date(req.body.date);
//   let _id = req.params._id;

//   // console.log(_id);
//   // console.log(req.body.date);
//   // console.log(isNaN(req.body.date));
//   // console.log(new Date().toDateString());

//   let user = await User.findById({ _id });
//   if (user) {
//     let newExercise = new Exercise({
//       userid: user._id,
//       username: user.username,
//       description,
//       duration,
//       date,
//     });
//     try {
//       await newExercise.save();
//       res.json({
//         username: user.username,
//         description: newExercise.description,
//         duration: newExercise.duration,
//         date: newExercise.date.toDateString(),
//         _id: user._id,
//       });
//     } catch (error) {
//       //console.log(error);
//       res.send(error.message);
//     }
//   }
// });

// function isBlank(str) {
//   return !str || /^\s*$/.test(str);
// }

// const listener = app.listen(process.env.PORT || 3000, () => {
//   console.log('Your app is listening on port ' + listener.address().port);
// });

////"mongoose": "^8.7.2" not working

const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const UserSchema = new Schema({
  username: String,
});

const UserModel = mongoose.model('userModel', UserSchema);
//Defining db schemas using the mongoose Schema constructor
const ExerciseSchema = new Schema({
  userId: String,
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: Date,
});

const ExerciseModel = mongoose.model('ExerciseSchema', ExerciseSchema);

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

//Body parser middleware
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/api/users', async (req, res) => {
  const user = new UserModel({
    username: req.body.username,
  });

  // const newExercise = await ExerciseModel.create(exercise);
  // try {
  //   const newUser = await UserModel.create(user);
  // } catch (err) {
  //   res.status(500).json({ msg: "User cannot be created." });
  // };

  user.save((err, doc) => {
    if (err || !doc) {
      console.error(err);
      return res.status(500).send('Database Error');
    }
    // console.log(doc);
    return res.status(201).json(doc);
  });
});

app.get('/api/users', async (req, res) => {
  try {
    const allUsers = await UserModel.find({});
    return res.status(200).json(allUsers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Database error' });
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const { description, duration, date } = req.body;

  const exercise = {
    userId: req.params._id,
    description,
    duration: Number(duration),
    date: new Date(date),
  };

  if (exercise.date.toString() === 'Invalid Date') {
    exercise.date = new Date().toDateString();
  } else {
    exercise.date = new Date(date).toDateString();
  }

  try {
    const currentUser = await UserModel.findById(req.params._id);
    if (!currentUser) {
      res.status(404).json({ msg: 'User not found.' });
    }

    const newExercise = await ExerciseModel.create(exercise);

    return res.status(200).send({
      username: currentUser.username,
      description,
      duration: Number(duration),
      date: exercise.date,
      _id: currentUser._id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Server error.' });
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  const id = req.params._id;
  const { from, to, limit } = req.query;
  const logfilter = { userId: id };

  if (from) {
    logfilter['$gte'] = new Date(from);
  }

  if (to) {
    logfilter['$lte'] = new Date(to);
  }

  const currentUser = await UserModel.findById(id);
  if (!currentUser) {
    return res.status(404).json({ msg: 'User not found.' });
  }

  const foundUserExercises = await ExerciseModel.find(logfilter).limit(
    limit ? limit : 500
  );

  if (foundUserExercises.length === 0) {
    //optional
    return res.status(404).json({ msg: 'Exercises not found' });
  }

  console.log(logfilter);
  console.log(foundUserExercises);

  return res.status(200).send({
    username: currentUser.username,
    count: foundUserExercises.length,
    _id: currentUser._id,
    log: foundUserExercises.map((ex) => {
      const dateStr = ex.date
        ? ex.date.toDateString()
        : new Date().toDateString();
      console.log(dateStr);
      return {
        description: ex.description,
        duration: ex.duration,
        date: dateStr,
      };
    }),
  });
});

const start = () => {
  try {
    mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log('Your app is listening on port ' + listener.address().port);
    });
  } catch (error) {
    console.error(error);
  }
};

start();
