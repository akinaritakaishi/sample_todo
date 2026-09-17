import { randomUUID } from 'node:crypto'
import { readJsonFile, writeJsonFile } from './json-store'
import seedMessagesData from '../data/seed-chat-messages.json'
import rooms from '../data/chat-rooms.json'

const FILE_NAME = 'chat-messages.json'
const DEFAULT_ROOM = 'general'
const ROOM_IDS = new Set(rooms.map((r) => r.id))

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
  const targetRoom = room || DEFAULT_ROOM
  if (!ROOM_IDS.has(targetRoom)) return null

  const messages = await loadMessages()
  return messages.filter((message) => (message.room || DEFAULT_ROOM) === targetRoom)
}

export async function addMessage({ room, author, text }) {
  const targetRoom = room || DEFAULT_ROOM
  if (!ROOM_IDS.has(targetRoom)) return null

  const messages = await loadMessages()
  const message = {
    id: randomUUID(),
    room: targetRoom,
    author,
    text,
    createdAt: new Date().toISOString(),
  }
  await persist([...messages, message])
  return message
}
