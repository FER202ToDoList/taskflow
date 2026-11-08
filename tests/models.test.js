import { test } from 'node:test';
import assert from 'node:assert/strict';
import { taskFromApi, taskToApi, userFromApi } from '../src/api-models.js';
test('NestJS numeric IDs work with route and drag/drop string IDs', () => {
  const t = taskFromApi({id: 42, isCompleted: false, dueDate: null, projectId: null, description: null, createdAt: '2026-11-08T00:00:00Z'});
  assert.equal(t.id, '42'); assert.equal(t.due_date, ''); assert.equal(t.description, ''); assert.equal(t.completed, false);
  assert.equal(userFromApi({fullName: 'Vector'}).name, 'Vector');
});
test('partial updates preserve omitted values and explicitly clear dates/projects', () => {
  assert.deepEqual(taskToApi({completed: true}), {isCompleted: true});
  assert.deepEqual(taskToApi({due_date: '', project_id: '', id: '42'}), {dueDate: null, projectId: null});
  assert.deepEqual(taskToApi({title: 'Task', priority: 2, description: 'text'}), {title: 'Task', priority: 2, description: 'text'});
});
