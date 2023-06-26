/* eslint-disable no-unused-vars */
const express = require("express");
const app = express();
const csrf = require("tiny-csrf");
const { Todo, User } = require("./models");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const path = require("path");

//user auth
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");
const flash = require("connect-flash");
const connectEnsureLogin = require("connect-ensure-login");
const bcrypt = require("bcrypt");

const saltRounds = 10;
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("cookie-monster-secret"));
app.use(csrf("0123456789iamthesecret9876543210", ["POST", "PUT", "DELETE"]));
app.use(express.static(path.join(__dirname, "public")));

// user auth
app.use(
  session({
    secret: "my-secret-key-176172672",
    cookie: { maxAge: 24 * 60 * 60000 },
  })
);

app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "emailAddress",
      passwordField: "password",
    },
    (username, password, done) => {
      console.log("Authenticating user: ", username);
      User.findOne({ where: { email: username } })
        .then(async (user) => {
          const matchPassword = await bcrypt.compare(password, user.password);
          if (matchPassword) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid Password" });
          }
        })
        .catch((error) => {
          return done(null, false, {
            message: "Not a Valid User, Please Signup",
          });
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing user: ", user);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

app.get("/", async (request, response) => {
  response.render("index", {
    title: "Todo Application",
    csrfToken: request.csrfToken(),
  });
});

app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    // First, we have to query our PostgerSQL database using Sequelize to get list of all Todos.
    // Then, we have to respond with all Todos, like:
    // response.send(todos)const overdueTodos = await Todo.overdue();
    const loggedInUser = request.user;
    const overdueTodos = await Todo.overdue(loggedInUser.id);
    const dueTodayTodos = await Todo.dueToday(loggedInUser.id);
    const dueLaterTodos = await Todo.dueLater(loggedInUser.id);
    const completedTodos = await Todo.getCompletedTodos(loggedInUser.id);
    if (request.accepts("html")) {
      response.render("todoHome", {
        overdueTodos,
        dueTodayTodos,
        dueLaterTodos,
        completedTodos,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({ overdueTodos, dueTodayTodos, dueLaterTodos });
    }
  }
);

app.get(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      const todo = await Todo.findByPk(request.params.id);
      return response.json(todo);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.post(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      const todo = await Todo.addTodo({
        title: request.body.title,
        dueDate: request.body.dueDate,
        userId: request.user.id,
      });
      return response.redirect("/todos");
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.put(
  "/todos/:id/",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    const todo = await Todo.findByPk(request.params.id);
    try {
      const updatedTodo = await todo.setCompletionStatus(
        request.body.completed
      );
      return response.json(updatedTodo);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      Todo.remove(request.params.id, request.user.id);
      return response.json({ success: true });
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.get("/signup", async function (request, response) {
  response.render("signup", {
    csrfToken: request.csrfToken(),
    title: "Sign-up",
  });
});

app.post("/users", async function (request, response) {
  try {
    console.log("Firstname: ", request.body.firstName);
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
    const todoAppUser = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.emailAddress,
      password: hashedPassword,
    });
    request.login(todoAppUser, (error) => {
      if (error) {
        return console.log(error);
      }
      response.redirect("/todos");
    });
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/login", (request, response) => {
  response.render("login", {
    csrfToken: request.csrfToken(),
    title: "Login",
  });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (request, response) => {
    response.redirect("/todos");
  }
);

app.get("/signout", (request, response, next) => {
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});

module.exports = app;
