const express = require('express');
const colors = require('colors');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Connect to database
// Note that the database name is todoDB
mongoose.connect(
  'mongodb://localhost:27017/todoDB',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) console.log(err);
    else console.log('Successfully Connected');
  }
);

// Create the mongoose schema
// Note the _id is automatically added by mongodb
const todoSchema = new mongoose.Schema({
  data: String,
});

// Create a model using the schema
// Use singular naming convention
const Todo = mongoose.model('Todo', todoSchema);

/*
Note: This is the original todoList item, we have
      not changed this, just incase of id, we will now have
      a default generated "_id" by mongodb.

let todoList = [
  {
    id: 1,
    data: 'Welcome to EJS TodoList Example',
  },
  {
    id: 2,
    data: 'Write below to add your todo',
  },
  {
    id: 3,
    data: '<-- Click here to delete your todo',
  },
];
*/

/*
Note: 1. Docs are the document inserted by the user,
         or received from database, if you wish, you could use more
         specific term like "item" or "todoItem" etc. 

      2. Mongodb automatically creates id so no need to explicitly
         add it.
*/

// When hit this route, the todo will be fetched to the database
app.get('/', (req, res) => {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const date = new Date();
  const today = date.toLocaleDateString('en-US', options);

  // Fetch todo from the database and render the HTML
  Todo.find({}, (err, docs) => {
    if (!err) {
      res.render('index', { date: today, todoList: docs });
    } else {
      console.log('Error: ', err);
    }
  });
});

// When hit this route, the todo will be inserted to the database
app.post('/add', (req, res) => {
  const todo = req.body.todo;

  // Insert todo to database
  // Create method will create a new document and insert into collection
  // Always use create method, because insertOne / Many is not available to a model.
  Todo.create(
    {
      data: todo,
    },
    (err, docs) => {
      if (!err) console.log('Success');
      else console.log('Error', err);
    }
  );

  // Redirect to home page/route
  res.redirect('/');
});

// This route will delete the todo based on its ID
app.post('/delete', (req, res) => {
  const { checkbox_id } = req.body;

  // Delete the specific todo if the _id matches the checkbox_id
  Todo.deleteOne({ _id: checkbox_id }, (err) => {
    if (!err) res.redirect('/');
    else console.log('Error: ', err);
  });
});

app.get('/about',(req,res)=>{
  res.render('about.ejs');
});

app.get('/instructions',(req,res)=>{
  res.render('instructions.ejs');
});

app.get('/index',(req,res)=>{
  res.redirect('/');
});

app.listen(5000, (req, res) => {
  console.log('Server started on port 5000');
});
