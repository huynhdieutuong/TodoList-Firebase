// Initialize Cloud Firestore through Firebase
firebase.initializeApp({
  apiKey: 'AIzaSyBUKidrz-MhEoelhmSERChdoZgDfev_aQc',
  authDomain: 'server-todolist.firebaseio.com',
  projectId: 'server-todolist'
});
var db = firebase.firestore();

var input = document.getElementById('new-todo');
var addBtn = document.getElementById('add-btn');
var deleteBtns = document.getElementsByClassName('delete-btn');
var editBtns = document.getElementsByClassName('edit-btn');
var todoItems = document.getElementsByClassName('todo-item');
var todoList = document.getElementById('todo-list');
var deleteAllBtn = document.getElementById('delete-all');
var completeAllBtn = document.getElementById('complete-all');

var items = [];
var current = null;

// Render
async function render() {
  var res = await db.collection('todos').get();
  items = res.docs.map(x => {
    var item;
    item = x.data();
    item.id = x.id;
    return item;
  });

  var content = items
    .map(function(item) {
      var deco = item.isCompleted ? 'line-through' : 'none';

      var contentItems =
        '<td><span class="todo-item" data-id=' +
        item.id +
        ' style="text-decoration:' +
        deco +
        ';">' +
        item.title +
        '</span></td>';

      var deleteBtn =
        '<button class="delete-btn" data-id=' + item.id + '>Delete</button> ';

      var editBtn =
        '<button class="edit-btn" data-id=' + item.id + '>Edit</button>';

      return (
        '<tr>' + contentItems + '<td>' + deleteBtn + editBtn + '</td></tr>'
      );
    })
    .join('');

  todoList.innerHTML = '<tr><th>Title</<th><th>Actions</th></tr>' + content;

  addBtn.addEventListener('click', addItem);
  input.value = '';
  addBtn.textContent = 'Add';

  for (var i = 0; i < items.length; i++) {
    todoItems[i].addEventListener('click', onFinished);
    deleteBtns[i].addEventListener('click', deleteItem);
    editBtns[i].addEventListener('click', currentItem);
  }
}

// Add item
async function addItem() {
  if (input.value !== '') {
    await db
      .collection('todos')
      .add({ title: input.value, isCompleted: false });
    render();
  }
}

// Delete item
async function deleteItem(event) {
  await db
    .collection('todos')
    .doc(event.target.dataset.id)
    .delete();
  render();
}

// Set current to update
async function currentItem(event) {
  var res = await db
    .collection('todos')
    .doc(event.target.dataset.id)
    .get();
  current = res.data();
  current.id = event.target.dataset.id;

  addBtn.removeEventListener('click', addItem);
  addBtn.addEventListener('click', editItem);
  input.value = current.title;
  addBtn.textContent = 'Save';
}

// Update item
async function editItem() {
  await db
    .collection('todos')
    .doc(current.id)
    .update({ title: input.value });
  current = null;
  render();
}

// Delete all items
deleteAllBtn.addEventListener('click', deleteAll);
async function deleteAll() {
  if (items.length > 0) {
    await Promise.all(
      items.map(function(item) {
        return db
          .collection('todos')
          .doc(item.id)
          .delete();
      })
    );
    render();
  }
}

// On finished
async function onFinished(event) {
  var res = await db
    .collection('todos')
    .doc(event.target.dataset.id)
    .get();
  var item = res.data();

  await db
    .collection('todos')
    .doc(event.target.dataset.id)
    .update({ isCompleted: !item.isCompleted });
  render();
}

// Complete all items
completeAllBtn.addEventListener('click', completeAll);
async function completeAll() {
  await Promise.all(
    items.map(function(item) {
      return db
        .collection('todos')
        .doc(item.id)
        .update({ isCompleted: true });
    })
  );
  render();
}

render();
