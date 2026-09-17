import { randomUUID } from 'node:crypto'
import { readJsonFile, writeJsonFile } from './json-store'
import seedMessagesData from '../data/seed-chat-messages.json'

const FILE_NAME = 'chat-messages.json'
const DEFAULT_ROOM = 'general'

function toCreatedAt(offsetMinutes) {
  const d = new Date()
  d.setMinutes(d.getMinutes() + (Number.isFinite(offsetMinutes) ? offsetMinutes : 0))
  return d.toISOString()
}

function createSeedMessages() {
  return seedMessagesData.map(({ room, author, text, offsetMinutes }) => ({
    id: randomUUID(),
    room: room || DEFAULT_ROOM,
    author,
    text,
    createdAt: toCreatedAt(offsetMinutes),
  }))
}

let messagesPromise = null

function loadMessages() {
  if (!messagesPromise) {
    messagesPromise = readJsonFile(FILE_NAME, null).then((data) =>
      Array.isArray(data) ? data : createSeedMessages(),
    )
  }
  return messagesPromise
}

async function persist(messages) {
  messagesPromise = Promise.resolve(messages)
  await writeJsonFile(FILE_NAME, messages)
}

export async function getMessages(room) {
  const messages = await loadMessages()
  const targetRoom = room || DEFAULT_ROOM
  return messages.filter((message) => (message.room || DEFAULT_ROOM) === targetRoom)
}

export async function addMessage({ room, author, text }) {
  const messages = await loadMessages()
  const message = {
    id: randomUUID(),
    room: room || DEFAULT_ROOM,
    author,
    text,
    createdAt: new Date().toISOString(),
  }
  await persist([...messages, message])
  return message
}
