const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const path = require('path');
const helmet = require('helmet');


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'public')));


app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrcElem: ["'self'", 'cdn.jsdelivr.net'],
    scriptSrcElem: ["'self'", "'nonce-random_value'", 'cdn.jsdelivr.net', 'unpkg.com'],
  },
}));

mongoose.connect("mongodb://localhost:27017/tasksDB", {useNewUrlParser: true});

const tasksSchema = {
    name: String
};

const Task = mongoose.model("Task", tasksSchema);

const todoListSchema = {
    name: String, 
    tasks: [tasksSchema]
};

const Todo = mongoose.model("Todo", todoListSchema);


app.get("/", function (req, res) {
    Task.find({})
      .then((foundTasks) => {
        if (foundTasks.length === 0) {
          res.render("list", {
            listTitle: "TODO List",
            newListTasks: foundTasks,
            noTasks: true, // Add this flag
          });
        } else {
          res.render("list", {
            listTitle: "TODO List",
            newListTasks: foundTasks,
            noTasks: false, // Add this flag
          });
        }
      })
      .catch((err) => console.error(err));
  });


  app.get("/about", function (req, res) {
    res.render("about");
});

  
app.post("/", function (req, res) {
  // Check if req.body.newTask exists and is not empty
  const taskName = req.body.newTask && req.body.newTask.trim();

  // Check if the task name is empty
  if (!taskName) {
    console.error("Task name is undefined or empty.");
    return res.status(400).send("Task name cannot be empty.");
  }

  const task = new Task({
    name: taskName
  });

  task.save()
    .then(() => {
      console.log("Task added successfully.");
      res.redirect("/");
    })
    .catch(err => {
      console.error("Error adding task:", err);
      res.status(500).send("Internal Server Error");
    });
});






  

app.post("/delete", function(req, res){
    const checkedTaskId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "TODO List") {
        Task.findOneAndDelete({_id: checkedTaskId})
            .then(deletedTask => {
                if (deletedTask) {
                    console.log("Successfully deleted checked task.");
                } else {
                    console.log("Task not found.");
                }
                res.redirect("/");
            })
            .catch(err => console.error(err));
    } // <- Add this closing bracket
});


// app.post("/edit", function (req, res) {
//     const updatedTaskId = req.body.taskId;
//     const updatedTaskName = req.body.updatedTask;
  
//     Task.updateOne({ _id: updatedTaskId }, { name: updatedTaskName })
//       .then(() => {
//         console.log("Successfully updated task.");
//         res.redirect("/");
//       })
//       .catch((err) => console.error(err));
//   });


app.listen(3000, function() {
    console.log("Server started on port 3000");
  });