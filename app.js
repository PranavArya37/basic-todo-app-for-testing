const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const emptyMsg = document.getElementById("empty-msg");

let todos = JSON.parse(localStorage.getItem("todos")) || [];

function save() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function render() {
  list.innerHTML = "";
  todos.forEach((todo, i) => {
    const li = document.createElement("li");
    if (todo.done) li.classList.add("done");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", () => toggle(i));

    const span = document.createElement("span");
    span.className = "text";
    span.textContent = todo.text;

    const btn = document.createElement("button");
    btn.className = "delete-btn";
    btn.textContent = "✕";
    btn.addEventListener("click", () => remove(i));

    li.append(checkbox, span, btn);
    list.appendChild(li);
  });

  emptyMsg.classList.toggle("hidden", todos.length > 0);
}

function add(text) {
  todos.push({ text, done: false });
  save();
  render();
}

function toggle(index) {
  todos[index].done = !todos[index].done;
  save();
  render();
}

function remove(index) {
  todos.splice(index, 1);
  save();
  render();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  add(text);
  input.value = "";
  input.focus();
});

render();
