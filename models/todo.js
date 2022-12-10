"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static async addTask(params) {
      return await Todo.create(params);
    }
    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      // FILL IN HERE
      const todos1 = await Todo.overdue();
      const overDueList = todos1
        .map((todo) => todo.displayableString())
        .join("\n");
      console.log(overDueList);
      console.log("\n");

      console.log("Due Today");
      // FILL IN HERE
      const todos2 = await Todo.dueToday();
      const dueTodayList = todos2
        .map((todo) => todo.displayableString())
        .join("\n");
      console.log(dueTodayList);
      console.log("\n");
      console.log("\n");

      console.log("Due Later");
      // FILL IN HERE
      const todos3 = await Todo.dueLater();
      const dueLaterList = todos3
        .map((todo) => todo.displayableString())
        .join("\n");
      console.log(dueLaterList);
    }

    static async overdue() {
      // FILL IN HERE TO RETURN OVERDUE ITEMS
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date().toLocaleDateString("en-CA"),
          },
        },
      });
    }

    static async dueToday() {
      // FILL IN HERE TO RETURN ITEMS DUE tODAY
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date().toLocaleDateString("en-CA"),
          },
        },
      });
    }

    static async dueLater() {
      // FILL IN HERE TO RETURN ITEMS DUE LATER
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date().toLocaleDateString("en-CA"),
          },
        },
      });
    }

    static async markAsComplete(id) {
      // FILL IN HERE TO MARK AN ITEM AS COMPLETE
      await Todo.update(
        { completed: true },
        {
          where: {
            id: id,
          },
        }
      );
    }

    displayableString() {
      let checkbox = this.completed ? "[x]" : "[ ]";
      return `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`;
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
