import { randomUUID } from 'node:crypto'
import { readJsonFile, writeJsonFile } from './json-store'
import seedTasksData from '../data/seed-tasks.json'

const FILE_NAME = 'tasks.json'

function toDateString(offsetDays) {
  const d = new Date()
  d.setDate(d.getDate() + (Number.isFinite(offsetDays) ? offsetDays : 0))
  return d.toISOString().slice(0, 10)
}

function createSeedTasks() {
  return seedTasksData.map(({ title, offsetDays, done }) => ({
    id: randomUUID(),
    title,
    due: toDateString(offsetDays),
    done,
  }))
}

let tasksPromise = null

function loadTasks() {
  if (!tasksPromise) {
    tasksPromise = readJsonFile(FILE_NAME, null).then((data) =>
      Array.isArray(data) ? data : createSeedTasks(),
    )
  }
  return tasksPromise
}

async function persist(tasks) {
  tasksPromise = Promise.resolve(tasks)
  await writeJsonFile(FILE_NAME, tasks)
}

export async function getTasks() {
  return loadTasks()
}

export async function addTask({ title, due }) {
  const tasks = await loadTasks()
  const task = { id: randomUUID(), title, due: due || '', done: false }
  await persist([...tasks, task])
  return task
}

export async function setTaskDone(id, done) {
  const tasks = await loadTasks()
  if (!tasks.some((t) => t.id === id)) return null
  const next = tasks.map((t) => (t.id === id ? { ...t, done } : t))
  await persist(next)
  return next.find((t) => t.id === id)
}

export async function deleteTask(id) {
  const tasks = await loadTasks()
  await persist(tasks.filter((t) => t.id !== id))
}

export async function clearDoneTasks() {
  const tasks = await loadTasks()
  const next = tasks.filter((t) => !t.done)
  await persist(next)
  return next
}
