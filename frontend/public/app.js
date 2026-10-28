(() => {
  const API = '/api/tasks';
  const COLUMNS = ['todo', 'doing', 'done'];
  const EMPTY_TEXT = {
    todo: 'No tasks waiting. Add one above.',
    doing: 'Nothing in progress.',
    done: 'Nothing finished yet.',
  };
 
  const MOVES = {
    todo: [['Start', 'doing']],
    doing: [['Back to to do', 'todo'], ['Mark done', 'done']],
    done: [['Reopen', 'todo']],
  };

  const form = document.getElementById('task-form');
  const input = document.getElementById('task-title');
  const notice = document.getElementById('notice');

  function showNotice(message) {
    notice.textContent = message;
    notice.hidden = !message;
  }

  async function request(path, options) {
    let response;
    try {
      response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
    } catch (err) {
      throw new Error('Could not reach the server. Check that the backend is running.');
    }
    if (response.status === 204) return null;
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Something went wrong.');
    return data;
  }

  function buildCard(task) {
    const li = document.createElement('li');
    li.className = 'card';

    const title = document.createElement('p');
    title.textContent = task.title;
    li.appendChild(title);

    const actions = document.createElement('div');
    actions.className = 'actions';

    MOVES[task.status].forEach(([label, status]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ghost';
      button.textContent = label;
      button.addEventListener('click', () => updateTask(task._id, { status }));
      actions.appendChild(button);
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'ghost';
    remove.textContent = 'Delete';
    remove.addEventListener('click', () => deleteTask(task._id));
    actions.appendChild(remove);

    li.appendChild(actions);
    return li;
  }

  function render(tasks) {
    COLUMNS.forEach((status) => {
      const list = document.querySelector(`.cards[data-status="${status}"]`);
      const items = tasks.filter((task) => task.status === status);
      list.replaceChildren();

      if (items.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'empty';
        empty.textContent = EMPTY_TEXT[status];
        list.appendChild(empty);
      } else {
        items.forEach((task) => list.appendChild(buildCard(task)));
      }
      document.querySelector(`[data-count="${status}"]`).textContent = items.length;
    });
  }

  async function loadTasks() {
    try {
      render(await request(API));
      showNotice('');
    } catch (err) {
      showNotice(err.message);
    }
  }

  async function updateTask(id, changes) {
    try {
      await request(`${API}/${id}`, { method: 'PATCH', body: JSON.stringify(changes) });
      await loadTasks();
    } catch (err) {
      showNotice(err.message);
    }
  }

  async function deleteTask(id) {
    try {
      await request(`${API}/${id}`, { method: 'DELETE' });
      await loadTasks();
    } catch (err) {
      showNotice(err.message);
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = input.value.trim();
    if (!title) return;
    try {
      await request(API, { method: 'POST', body: JSON.stringify({ title }) });
      input.value = '';
      await loadTasks();
    } catch (err) {
      showNotice(err.message);
    }
  });

  loadTasks();
})();
