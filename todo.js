const todoList = () => {
  all = [];
  const add = (todoItem) => {
    all.push(todoItem);
  };
  const markAsComplete = (index) => {
    all[index].completed = true;
  };

  const today = new Date().toLocaleDateString("en-CA");

  const overdue = () => {
    return all.filter((todoItem) => todoItem.dueDate < today);
  };

  const dueToday = () => {
    return all.filter((todoItem) => todoItem.dueDate === today);
  };

  const dueLater = () => {
    return all.filter((todoItem) => todoItem.dueDate > today);
  };

  const toDisplayableList = (list) => {
    let OUTPUT_STRING = "";
    list.forEach((element) => {
      if (element.dueDate === today) {
        OUTPUT_STRING += `${element.completed ? "[x]" : "[ ]"} ${
          element.title
        }\n`;
      } else {
        OUTPUT_STRING += `${element.completed ? "[x]" : "[ ]"} ${
          element.title
        } ${element.dueDate}\n`;
      }
      // console.log(`${element.completed ? '[x]':'[ ]'} ${element.title}`)
    });
    return OUTPUT_STRING.slice(0, -1);
  };

  return {
    all,
    add,
    markAsComplete,
    overdue,
    dueToday,
    dueLater,
    toDisplayableList,
  };
};

module.exports = todoList;
