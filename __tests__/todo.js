const todoList = require("../todo");

const { all, markAsComplete, add, overdue, dueToday, dueLater } = todoList();

describe("Todolist Test Suite", () => {
  beforeAll(() => {
    add({
      title: "oracle installation on mac",
      completed: false,
      dueDate: new Date().toLocaleDateString("en-CA"),
    });
    add({
      title: "wordpress installation on mac",
      completed: false,
      dueDate: new Date("2022-02-27").toLocaleDateString("en-CA"),
    });
    add({
      title: "qemu installation on mac",
      completed: false,
      dueDate: new Date("2023-02-27").toLocaleDateString("en-CA"),
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

  test("retrival of overdue items", () => {
    expect(overdue().length).toBe(1);
    expect(overdue()[0]).toBe(all[1]);
  });

  test("retrival of due today items", () => {
    expect(dueToday().length).toBe(2);
    expect(dueToday()[0]).toBe(all[0]);
    expect(dueToday()[1]).toBe(all[3]);
  });

  test("retrival of due later items", () => {
    expect(dueLater().length).toBe(1);
    expect(dueLater()[0]).toBe(all[2]);
  });
});
