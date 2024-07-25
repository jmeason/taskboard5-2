// ? Grab references to the important DOM elements.
const timeDisplayEl = $('#time-display');
const taskDisplayEl = $('#task-display');
const taskFormEl = $('#task-form');
const taskNameInputEl = $('#task-name-input');
const taskTypeInputEl = $('#task-type-input');
const taskDateInputEl = $('#taskDueDate');


function displayTime() {
  const rightNow = dayjs().format('MMM DD, YYYY [at] hh:mm:ss a');
  timeDisplayEl.text(rightNow);
}

function readTasksFromStorage() {
let tasks = JSON.parse(localStorage.getItem('tasks'));

  if (!tasks) {
    tasks = [];
  }
  return tasks;
}

function saveTasksToStorage(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}
function createTaskCard(task) {
  const taskCard = $('<div>')
    .addClass('card task-card draggable my-3')
    .attr('data-task-id', task.id);
  const cardHeader = $('<div>').addClass('card-header h4').text(task.name);
  const cardBody = $('<div>').addClass('card-body');
  const cardDescription = $('<p>').addClass('card-text').text(task.type);
  const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
  const cardDeleteBtn = $('<button>')
    .addClass('btn btn-danger delete')
    .text('Delete')
    .attr('data-task-id', task.id);
  cardDeleteBtn.on('click', handleDeleteTask);

  if (task.dueDate && task.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

    // ? If the task is due today, make the card yellow. If it is overdue, make it red.
    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  // ? Return the card so it can be appended to the correct lane.
  return taskCard;
}
function printTaskData() {
  const tasks = readTasksFromStorage();

  // Empty existing task cards out of the lanes
  const todoList = $('#todo-cards');
  todoList.empty();

  const inProgressList = $('#in-progress-cards');
  inProgressList.empty();

  const doneList = $('#done-cards');
  doneList.empty();

  // Loop through tasks and create task cards for each status
  for (let task of tasks) {
    if (task.status === 'to-do') {
      todoList.append(createTaskCard(task));
    } else if (task.status === 'in-progress') {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === 'done') {
      doneList.append(createTaskCard(task));
    }
  }

// make task cards draggable
  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,
    helper: function (e) {
      const original = $(e.target).hasClass('ui-draggable')
        ? $(e.target)
        : $(e.target).closest('.ui-draggable');
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
}

function handleDeleteTask() {
  const taskId = $(this).attr('data-task-id');
  const tasks = readTasksFromStorage();

  tasks.forEach((task) => {
    if (task.id === taskId) {
      tasks.splice(tasks.indexOf(task), 1);
    }
  });
  
  saveTasksToStorage(tasks);
  printTaskData();
}

function handleTaskFormSubmit(event) {
  event.preventDefault();

  // ? Read user input from the form
  const taskName = taskNameInputEl.val().trim();
  const taskType = taskTypeInputEl.val(); // don't need to trim select input
  const taskDate = taskDateInputEl.val(); // yyyy-mm-dd format

  const newTask = {
    
    name: taskName,
    type: taskType,
    dueDate: taskDate,
    status: 'to-do',
  };

  const tasks = readTasksFromStorage();
  tasks.push(newTask);

  
  saveTasksToStorage(tasks);
  printTaskData();


  taskNameInputEl.val('');
  taskTypeInputEl.val('');
  taskDateInputEl.val('');
}

function handleDrop(event, ui) {
  
  const tasks = readTasksFromStorage();
  const taskId = ui.draggable[0].dataset.taskId;
  const newStatus = event.target.id;

  for (let task of tasks) {
    
    if (task.id === taskId) {
      task.status = newStatus;
    }
  }
 localStorage.setItem('tasks', JSON.stringify(tasks));
  printTaskData();
}

taskFormEl.on('submit', handleTaskFormSubmit);
taskDisplayEl.on('click', '.btn-delete-task', handleDeleteTask);

displayTime();
setInterval(displayTime, 1000);

$(document).ready(function () {
  printTaskData();

  $('#taskDueDate').datepicker({
    changeMonth: true,
    changeYear: true,
  });

  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });
});
