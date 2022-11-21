const todoList = require("../todo");

const { all, markAsComplete, add } = todoList();

describe("Todolist Test Suite", () => {
  beforeAll(() => {
    add({
      title: "oracle installation on mac",
      completed: false,
      dueDate: new Date().toLocaleDateString("en-CA"),
    });
  });
  test("add a new todo item", () => {
    const todoItemsCount = all.length;
    add({
      title: "insall sql developer on mac",
      completed: false,
      dueDate: new Date().toLocaleDateString("en-CA"),
    });
    expect(all.length).toBe(todoItemsCount + 1);
  });

  test("marking a todo as complete", () => {
    expect(all[0].completed).toBe(false);
    markAsComplete(0);
    expect(all[0].completed).toBe(true);
  });
});
