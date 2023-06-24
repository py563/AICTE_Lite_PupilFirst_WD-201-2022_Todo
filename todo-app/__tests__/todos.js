const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

let server, agent;
function extractCsrfToken(res) {
  const $ = cheerio.load(res.text);
  return $('[name="_csrf"]').val();
}
const login = async (agent, username, password) => {
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    emailAddress: username,
    password: password,
    _csrf: csrfToken,
  }); 
};

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(22222, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Create a user or Sign-up User", async() => {
    const res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/users").send({
      firstName: "peter",
      lastName: "parker",
      emailAddress: "spider@man.com",
      password: "hashedPassword",
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  test("Signout from user account", async () => {
    let res = await agent.get("/todos");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/todos");
    expect(res.statusCode).toBe(302);
  });

  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    const agent = request.agent(server);
    await login(agent,"spider@man.com","hashedPassword");
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk today",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/todos");
  });
  
  test("Marks a todo with the given ID as complete", async () => {
    const agent = request.agent(server);
    await login(agent,"spider@man.com","hashedPassword");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title: "Buy Water",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodos = await agent.get("/todos").set("Accept", "application/json");
    const parsedGroupedTodos = JSON.parse(groupedTodos.text);
    const dueTodayTodosCount = parsedGroupedTodos.dueTodayTodos.length;
    const latestTodo = parsedGroupedTodos.dueTodayTodos[dueTodayTodosCount - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const markAsCompletedResponse = await agent
      .put(`/todos/${latestTodo.id}/`)
      .send({
        completed: true,
        _csrf: csrfToken,
      });

    const parsedMarkAsCompleted = JSON.parse(markAsCompletedResponse.text);
    expect(parsedMarkAsCompleted.completed).toBe(true);
  });

  test("Marks a todo with the given ID as incomplete", async () => {
    const agent = request.agent(server);
    await login(agent,"spider@man.com","hashedPassword");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title: "Buy Water Bottles",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodos = await agent.get("/todos").set("Accept", "application/json");
    const parsedGroupedTodos = JSON.parse(groupedTodos.text);
    const dueTodayTodosCount = parsedGroupedTodos.dueTodayTodos.length;
    const latestTodo = parsedGroupedTodos.dueTodayTodos[dueTodayTodosCount - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    let markAsCompletedResponse = await agent
      .put(`/todos/${latestTodo.id}/`)
      .send({
        completed: true,
        _csrf: csrfToken,
      });

    let parsedMarkAsCompleted = JSON.parse(markAsCompletedResponse.text);
    expect(parsedMarkAsCompleted.completed).toBe(true);

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    markAsCompletedResponse = await agent
      .put(`/todos/${latestTodo.id}/`)
      .send({ _csrf: csrfToken, completed: false });

    parsedMarkAsCompleted = JSON.parse(markAsCompletedResponse.text);
    expect(parsedMarkAsCompleted.completed).toBe(false);
  });

  test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
    // FILL IN YOUR CODE HERE
    const agent = request.agent(server);
    await login(agent,"spider@man.com","hashedPassword");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title: "Buy Xbox One",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodos = await agent.get("/todos").set("Accept", "application/json");
    const parsedGroupedTodos = JSON.parse(groupedTodos.text);
    const dueTodayTodosCount = parsedGroupedTodos.dueTodayTodos.length;
    const latestTodo = parsedGroupedTodos.dueTodayTodos[dueTodayTodosCount - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    let deleteTodoResponse = await agent
      .delete(`/todos/${latestTodo.id}`)
      .send({
        _csrf: csrfToken,
      });
    let parsedDeleteTodoResponse = JSON.parse(deleteTodoResponse.text);

    expect(parsedDeleteTodoResponse.success).toBe(true);
  });

});
