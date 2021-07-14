const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers

  const user = users.find(user => user.username === username)

  if(!user) response.status(404).json({error: "User not found!"})

  request.user = user

  return next()
}

function checksExistsTodo(request, response, next){
  const {id} = request.params
  const {user} = request

  const todo = user.todos.find(todo => todo.id === id)

  if(!todo) response.status(404).json({error: "TODO not found!"})

  request.todo = todo

  return next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body

  const hasUser = users.some(user => user.username === username)

  if(hasUser) response.status(400).json({error: "User alerady exists!"})

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request

  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body
  const {user} = request

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  response.status(201).json(todo)

});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const {todo} = request
  const {title, deadline} = request.body
  
  if(title) todo.title = title
  if(deadline) todo.deadline = new Date(deadline)

  response.status(201).send(todo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const {todo} = request

  todo.done = true

  response.status(201).send(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const {user} = request
  const {id} = request.params

  user.todos = user.todos.filter(todo => todo.id !== id)

  response.status(204).send()
});

module.exports = app;