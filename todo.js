const todoList = () => {
    all = []
    const add = (todoItem) => {
      all.push(todoItem)
    }
    const markAsComplete = (index) => {
      all[index].completed = true
    }
  
    const overdue = () => {
      // Write the date check condition here and return the array of overdue items accordingly.
      // FILL YOUR CODE HERE
      // ..
      // ..
      // ..
      return all.filter((todoItem) => (todoItem.dueDate < today))
    }
  
    const dueToday = () => {
      // Write the date check condition here and return the array of todo items that are due today accordingly.
      // FILL YOUR CODE HERE
      // ..
      // ..
      // ..
      return all.filter((todoItem) => (todoItem.dueDate === today))
    }
  
    const dueLater = () => {
      // Write the date check condition here and return the array of todo items that are due later accordingly.
      // FILL YOUR CODE HERE
      // ..
      // ..
      // ..
      return all.filter((todoItem) => (todoItem.dueDate > today))
    }
  
    const toDisplayableList = (list) => {
      // Format the To-Do list here, and return the output string as per the format given above.
      // FILL YOUR CODE HERE
      // ..
      // ..
      // ..
      // return OUTPUT_STRING
      let OUTPUT_STRING = ''
      list.forEach(element => {
        if (element.dueDate === today){
          OUTPUT_STRING += `${element.completed ? '[x]':'[ ]'} ${element.title}\n`
        }
        else {
          OUTPUT_STRING += `${element.completed ? '[x]':'[ ]'} ${element.title} ${element.dueDate}\n`
        }
        //console.log(`${element.completed ? '[x]':'[ ]'} ${element.title}`)
      });
      return OUTPUT_STRING.slice(0,-1)
    }
  
    return { all, add, markAsComplete, overdue, dueToday, dueLater, toDisplayableList };
  }