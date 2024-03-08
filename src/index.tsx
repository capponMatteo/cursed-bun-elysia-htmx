import { Elysia, t } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { html } from "@elysiajs/html";

const elysia = new Elysia();

type Todo = {
  id: number;
  text: string;
  done: boolean;
  priority: number;
};

let todos: Todo[] = [
  { id: 1, text: "Shed the dog 🐕", done: false, priority: 7 },
  { id: 2, text: "Walk the turtle 🐢", done: false, priority: 1 },
  { id: 3, text: "Clean the hats 🎩", done: true, priority: 3 },
  { id: 4, text: "Fly to the moon 🌑", done: false, priority: 4 },
  { id: 5, text: "Get vaccinated 💉", done: false, priority: 1 },
];

const TodoComponent = (todo: Todo) => (
  <div id={`todo-${todo.id}`} class="todo">
    <input
      hx-target={`#todo-${todo.id}`}
      hx-swap="outerHTML"
      hx-patch={`/todo/${todo.id}`}
      type="checkbox"
      checked={todo.done}
    />
    <span class={todo.done ? 'done' : ''}>
      {todo.text}
    </span>
    <button hx-delete={`/todo/${todo.id}`} hx-target='#todos'>Delete</button>
  </div>
);

const TodoList = (todoList: Todo[]) => (
  <div id='todos' class='todos'>
    <h1>Todo App 📋</h1>
    {todoList.map((todo) => (
      <TodoComponent {...todo} />
    ))}
  </div>
);

elysia
  .use(staticPlugin())
  .use(html())
  .get("/", () => Bun.file("public/index.html"))
  .get("/todos", () => TodoList(todos))
  .patch("/todo/:id", (context) => {
    const id = Number(context.params.id);
    const todo = todos.find((todo) => todo.id === id);
    if (todo) {
      todo.done = !todo.done;
      return TodoComponent(todo);
    }
  })
  .delete("/todo/:id", (context) => {
    const id = Number(context.params.id);
    todos = todos.filter((todo) => todo.id !== id);
    return TodoList(todos);
  })
  .listen(3000);
