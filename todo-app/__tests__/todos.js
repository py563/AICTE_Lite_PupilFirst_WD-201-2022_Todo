const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

let server, agent;
function extractCsrfToken(res) {
  const $ = cheerio.load(res.text);
  return $('[name="_csrf"]').val();
}
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

  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/");
  });

  test("Marks a todo with the given ID as complete", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title: "Buy Water",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodos = await agent.get("/").set("Accept", "application/json");
    const parsedGroupedTodos = JSON.parse(groupedTodos.text);
    const dueTodayTodosCount = parsedGroupedTodos.dueTodayTodos.length;
    const latestTodo = parsedGroupedTodos.dueTodayTodos[dueTodayTodosCount - 1];

    res = await agent.get("/");
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
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title: "Buy Water Bottles",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodos = await agent.get("/").set("Accept", "application/json");
    const parsedGroupedTodos = JSON.parse(groupedTodos.text);
    const dueTodayTodosCount = parsedGroupedTodos.dueTodayTodos.length;
    const latestTodo = parsedGroupedTodos.dueTodayTodos[dueTodayTodosCount - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    let markAsCompletedResponse = await agent
      .put(`/todos/${latestTodo.id}/`)
      .send({
        completed: true,
        _csrf: csrfToken,
      });

    let parsedMarkAsCompleted = JSON.parse(markAsCompletedResponse.text);
    expect(parsedMarkAsCompleted.completed).toBe(true);

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    markAsCompletedResponse = await agent
      .put(`/todos/${latestTodo.id}/`)
      .send({ _csrf: csrfToken, completed: false });

    parsedMarkAsCompleted = JSON.parse(markAsCompletedResponse.text);
    expect(parsedMarkAsCompleted.completed).toBe(false);
  });

  test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
    // FILL IN YOUR CODE HERE
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);

    await agent.post("/todos").send({
      title: "Buy Xbox One",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodos = await agent.get("/").set("Accept", "application/json");
    const parsedGroupedTodos = JSON.parse(groupedTodos.text);
    const dueTodayTodosCount = parsedGroupedTodos.dueTodayTodos.length;
    const latestTodo = parsedGroupedTodos.dueTodayTodos[dueTodayTodosCount - 1];

    res = await agent.get("/");
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
