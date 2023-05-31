/* eslint-disable no-unused-vars */
const express = require("express");
const app = express();
const csrf = require("tiny-csrf");
const { Todo, User } = require("./models");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const path = require("path");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("cookie-monster-secret"));
app.use(csrf("0123456789iamthesecret9876543210", ["POST", "PUT", "DELETE"]));

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (request, response) => {
  const overdueTodos = await Todo.overdue();
  const dueTodayTodos = await Todo.dueToday();
  const dueLaterTodos = await Todo.dueLater();
  const completedTodos = await Todo.getCompletedTodos();
  if (request.accepts("html")) {
    response.render("index", {
      overdueTodos,
      dueTodayTodos,
      dueLaterTodos,
      completedTodos,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({ overdueTodos, dueTodayTodos, dueLaterTodos });
  }
});

app.get("/todos", async function (request, response) {
  console.log("Processing list of all Todos ...");
  // FILL IN YOUR CODE HERE
  try {
    const todos = await Todo.findAll();
    response.send(todos);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }

  // First, we have to query our PostgerSQL database using Sequelize to get list of all Todos.
  // Then, we have to respond with all Todos, like:
  // response.send(todos)
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async function (request, response) {
  try {
    const todo = await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
    });
    return response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/", async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.setCompletionStatus(request.body.completed);
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  try {
    Todo.remove(request.params.id);
    return response.json({ success: true });
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/signup", async function (request, response) {
  response.render("signup", {
    csrfToken: request.csrfToken(),
    title: "Sign-up",
  });
});

app.post("/users", async function (request, response) {
  try {
    console.log("Firstname: ", request.body.firstName);
    const todoAppUser = User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.emailAddress,
      password: request.body.password,
    });
    response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

module.exports = app;
