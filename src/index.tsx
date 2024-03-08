import { Elysia, t } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { html } from "@elysiajs/html";
import chalk from "chalk";

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
      name="done"
      checked={todo.done}
    />
    <input
      type="text"
      name="text"
      value={todo.text}
      hx-target={`#todo-${todo.id}`}
      hx-swap="outerHTML"
      hx-patch={`/todo/${todo.id}`}
      class={todo.done ? "done" : ""}
    />
    <button
      hx-delete={`/todo/${todo.id}`}
      hx-target="#todos"
      class="deleteButton"
    >
      Delete
    </button>
  </div>
);

const TodoList = (todoList: Todo[]) => (
  <div id="todos" class="todos">
    <h1>Todo App 📋</h1>
    {todoList.map((todo) => (
      <TodoComponent {...todo} />
    ))}
    <div class="todo">
      <input type="text" name="text" hx-swap="outerHTML" id="new-todo-text" />
      <button
        hx-post={`/todo`}
        hx-include="previous input"
        hx-target="#todos"
        class="createButton"
      >
        Create
      </button>
    </div>
  </div>
);

elysia
  .use(staticPlugin())
  .use(html())
  .get("/", () => Bun.file("public/index.html"))
  .get("/todos", () => TodoList(todos))
  .patch(
    "/todo/:id",
    (context) => {
      const isOn = context.body.done === "on";
      const id = Number(context.params.id);
      const todo = todos.find((todo) => todo.id === id);
      if (todo) {
        todo.done = isOn;
        if (context.body.text) {
          todo.text = context.body.text;
        }
        return TodoComponent(todo);
      }
    },
    {
      body: t.Object({
        done: t.Optional(t.String()),
        text: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/todo",
    (context) => {
      console.log(context);
      const text = context.body.text;
      const id = todos.length + 1;
      todos.push({ id, text, done: false, priority: 5 });
      return TodoList(todos);
    },
    {
      body: t.Object({
        text: t.String(),
      }),
    }
  )
  .delete("/todo/:id", (context) => {
    const id = Number(context.params.id);
    todos = todos.filter((todo) => todo.id !== id);
    return TodoList(todos);
  })
  .listen(3000, () => console.log(chalk.green("🚀 App running on http://localhost:3000")));
