const API_BASE = '/api/tasks';

const state = {
  tasks: [],
  filter: 'all',
  search: '',
};

const elements = {
  form: document.getElementById('task-form'),
  tasks: document.getElementById('tasks'),
  template: document.getElementById('task-template'),
  empty: document.querySelector('.empty-state'),
  metrics: document.querySelectorAll('[data-metric]'),
  chips: document.querySelectorAll('.chip'),
  search: document.getElementById('search'),
  toast: document.getElementById('toast'),
};

const priorityLabels = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const statusLabels = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  archived: 'Archived',
};

const showToast = (message, duration = 2600) => {
  if (!elements.toast) return;
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, duration);
};

const fetchJSON = async (url, options) => {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const payload = await response.json();
      errorMessage = Array.isArray(payload.error) ? payload.error.join('\n') : payload.error;
    } catch (_) {
      // ignore
    }
    throw new Error(errorMessage || 'Request failed');
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
};

const loadTasks = async () => {
  const { data } = await fetchJSON(API_BASE);
  state.tasks = data;
  render();
};

const filteredTasks = () => {
  return state.tasks
    .filter((task) => {
      if (state.filter !== 'all' && task.status !== state.filter) {
        return false;
      }
      if (!state.search) return true;
      const haystack = `${task.title} ${task.description} ${task.category}`.toLowerCase();
      return haystack.includes(state.search.toLowerCase());
    })
    .sort((a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime());
};

const updateMetrics = () => {
  const total = state.tasks.length;
  const open = state.tasks.filter((task) => task.status === 'pending').length;
  const inProgress = state.tasks.filter((task) => task.status === 'in_progress').length;
  const completed = state.tasks.filter((task) => task.status === 'completed').length;

  const values = {
    total,
    open,
    in_progress: inProgress,
    completed,
  };

  elements.metrics.forEach((metric) => {
    const key = metric.dataset.metric;
    if (!key) return;
    metric.textContent = values[key] ?? 0;
  });
};

const formatDate = (value) => {
  if (!value) return 'No due date';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const render = () => {
  updateMetrics();
  const tasks = filteredTasks();

  elements.tasks.innerHTML = '';

  if (tasks.length === 0) {
    elements.empty.hidden = false;
    return;
  }
  elements.empty.hidden = true;

  const fragment = document.createDocumentFragment();

  tasks.forEach((task) => {
    const node = elements.template.content.firstElementChild.cloneNode(true);
    node.dataset.id = task.id;

    const chip = node.querySelector('[data-priority]');
    chip.textContent = priorityLabels[task.priority] ?? task.priority;
    chip.classList.add(`priority-${task.priority}`);

    node.querySelector('[data-title]').textContent = task.title;
    node.querySelector('[data-description]').textContent = task.description || 'No description provided.';
    node.querySelector('[data-category]').textContent = `Category · ${task.category}`;
    node.querySelector('[data-due]').textContent = `Due · ${formatDate(task.dueDate)}`;

    const statusSelect = node.querySelector('[data-status]');
    statusSelect.value = task.status;

    statusSelect.addEventListener('change', () => updateTaskStatus(task.id, statusSelect.value));
    node.querySelector('[data-action="remove"]').addEventListener('click', () => deleteTask(task.id));

    fragment.appendChild(node);
  });

  elements.tasks.appendChild(fragment);
};

const serializeForm = (formData) => {
  const payload = Object.fromEntries(formData.entries());
  const sanitized = {
    title: payload.title.trim(),
    description: payload.description?.trim() ?? '',
    priority: payload.priority,
    category: payload.category?.trim() || 'general',
    dueDate: payload.dueDate ? payload.dueDate : null,
  };
  return sanitized;
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = serializeForm(formData);

  if (!payload.title) {
    showToast('Title is required');
    return;
  }

  try {
    const { data } = await fetchJSON(API_BASE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    state.tasks.unshift(data);
    event.target.reset();
    render();
    showToast('Task created successfully');
  } catch (error) {
    console.error(error);
    showToast(error.message ?? 'Failed to create task');
  }
};

const updateTaskStatus = async (id, status) => {
  try {
    const { data } = await fetchJSON(`${API_BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    state.tasks = state.tasks.map((task) => (task.id === id ? data : task));
    render();
    showToast(`Status updated to ${statusLabels[status] ?? status}`);
  } catch (error) {
    console.error(error);
    showToast(error.message ?? 'Failed to update task');
    await loadTasks();
  }
};

const deleteTask = async (id) => {
  if (!confirm('Delete this task?')) return;
  try {
    await fetchJSON(`${API_BASE}/${id}`, { method: 'DELETE' });
    state.tasks = state.tasks.filter((task) => task.id !== id);
    render();
    showToast('Task removed');
  } catch (error) {
    console.error(error);
    showToast(error.message ?? 'Failed to delete task');
  }
};

const setupEventListeners = () => {
  elements.form.addEventListener('submit', handleSubmit);
  elements.chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      elements.chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      state.filter = chip.dataset.filter ?? 'all';
      render();
    });
  });

  if (elements.chips.length > 0) {
    elements.chips[0].classList.add('active');
  }

  elements.search.addEventListener('input', (event) => {
    state.search = event.target.value;
    render();
  });
};

setupEventListeners();
loadTasks().catch((error) => {
  console.error(error);
  showToast('Unable to load tasks. Please ensure the backend is running.');
});
