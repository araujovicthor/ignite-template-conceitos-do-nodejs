const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const findUser = users.find(user => user.username === username);

  if (!findUser) {
    return response.status(404).json({ error: "User does not exists" });
  }

  request.user = findUser;

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;

  return response.json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  const { title, deadline } = request.body;

  const todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline, 
    created_at: new Date()
  }

  todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const findTodo = todos.find(todo => todo.id === id);
  
  if (!findTodo) {
    return response.status(404).json({ error: "Todo does not exists" });
  }

  findTodo.title = title;
  findTodo.deadline = deadline;

  return response.status(201).json(findTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  const { id } = request.params;

  const findTodo = todos.find(todo => todo.id === id);
  
  if (!findTodo) {
    return response.status(404).json({ error: "Todo does not exists" });
  }

  findTodo.done = true;

  return response.status(201).json(findTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  const { id } = request.params;

  const findTodo = todos.find(todo => todo.id === id);
  
  if (!findTodo) {
    return response.status(404).json({ error: "Todo does not exists" });
  }

  todos.splice(findTodo, 1);

  return response.send(204);
});

module.exports = app;
