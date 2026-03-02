// === DOM refs ===
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const emptyMsg = document.getElementById("empty-msg");
const footer = document.getElementById("todo-footer");
const taskCounter = document.getElementById("task-counter");
const clearBtn = document.getElementById("clear-completed");
const filterBtns = document.querySelectorAll(".filter-btn");

// === State ===
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";

// Migrate legacy todos that lack an id
todos = todos.map((t) =>
  t.id ? t : { ...t, id: crypto.randomUUID() }
);

// === Persistence ===
function save() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// === Helpers ===
function uid() {
  return crypto.randomUUID();
}

function filteredTodos() {
  if (currentFilter === "active") return todos.filter((t) => !t.done);
  if (currentFilter === "completed") return todos.filter((t) => t.done);
  return todos;
}

// === Rendering ===
function render(newItemId) {
  list.innerHTML = "";
  const visible = filteredTodos();

  visible.forEach((todo) => {
    const li = document.createElement("li");
    li.dataset.id = todo.id;
    if (todo.done) li.classList.add("done");
    if (todo.id === newItemId) li.classList.add("slide-in");

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox";
    checkbox.checked = todo.done;
    checkbox.setAttribute("aria-label", `Mark "${todo.text}" as ${todo.done ? "incomplete" : "complete"}`);
    checkbox.addEventListener("change", () => toggle(todo.id));

    // Text
    const span = document.createElement("span");
    span.className = "text";
    span.textContent = todo.text;
    span.addEventListener("dblclick", () => startEdit(todo.id, li, span));

    // Delete button
    const btn = document.createElement("button");
    btn.className = "delete-btn";
    btn.textContent = "\u2715";
    btn.setAttribute("aria-label", `Delete "${todo.text}"`);
    btn.addEventListener("click", () => remove(todo.id, li));

    li.append(checkbox, span, btn);
    list.appendChild(li);
  });

  updateFooter();
}

function updateFooter() {
  const total = todos.length;
  const remaining = todos.filter((t) => !t.done).length;
  const completed = total - remaining;

  // Empty message
  const visible = filteredTodos();
  if (total === 0) {
    emptyMsg.querySelector(".empty-text").textContent = "No tasks yet. Add one above!";
    emptyMsg.classList.remove("hidden");
  } else if (visible.length === 0) {
    emptyMsg.querySelector(".empty-text").textContent =
      currentFilter === "active" ? "No active tasks." : "No completed tasks.";
    emptyMsg.classList.remove("hidden");
  } else {
    emptyMsg.classList.add("hidden");
  }

  // Footer visibility
  footer.classList.toggle("hidden", total === 0);

  // Counter
  taskCounter.textContent = `${remaining} task${remaining !== 1 ? "s" : ""} remaining`;

  // Clear completed button
  clearBtn.classList.toggle("hidden", completed === 0);
}

// === Actions ===
function add(text) {
  const id = uid();
  todos.push({ id, text, done: false });
  save();
  render(id);
}

function toggle(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.done = !todo.done;
    save();
    render();
  }
}

function remove(id, li) {
  li.classList.add("fade-out");
  li.addEventListener("animationend", () => {
    todos = todos.filter((t) => t.id !== id);
    save();
    render();
  });
}

function clearCompleted() {
  // Animate all completed items out, then remove
  const completedEls = list.querySelectorAll("li.done");
  if (completedEls.length === 0) return;

  let pending = completedEls.length;
  completedEls.forEach((li) => {
    li.classList.add("fade-out");
    li.addEventListener("animationend", () => {
      pending--;
      if (pending === 0) {
        todos = todos.filter((t) => !t.done);
        save();
        render();
      }
    });
  });
}

// === Inline editing ===
function startEdit(id, li, span) {
  const todo = todos.find((t) => t.id === id);
  if (!todo || todo.done) return; // don't edit completed items

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "edit-input";
  editInput.value = todo.text;
  editInput.setAttribute("aria-label", "Edit task");

  span.replaceWith(editInput);
  editInput.focus();
  editInput.select();

  function commitEdit() {
    const newText = editInput.value.trim();
    if (newText && newText !== todo.text) {
      todo.text = newText;
      save();
    }
    render();
  }

  editInput.addEventListener("blur", commitEdit);
  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      editInput.blur();
    }
    if (e.key === "Escape") {
      editInput.value = todo.text; // revert
      editInput.blur();
    }
  });
}

// === Filters ===
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  });
});

// === Clear completed ===
clearBtn.addEventListener("click", clearCompleted);

// === Form submit ===
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  add(text);
  input.value = "";
  input.focus();
});

// === Init ===
render();
