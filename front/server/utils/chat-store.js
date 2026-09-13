import { randomUUID } from 'node:crypto'
import { readJsonFile, writeJsonFile } from './json-store'

const FILE_NAME = 'chat-messages.json'

let messagesPromise = null

function loadMessages() {
  if (!messagesPromise) {
    messagesPromise = readJsonFile(FILE_NAME, []).then((data) => (Array.isArray(data) ? data : []))
  }
  return messagesPromise
}

async function persist(messages) {
  messagesPromise = Promise.resolve(messages)
  await writeJsonFile(FILE_NAME, messages)
}

export async function getMessages() {
  return loadMessages()
}

export async function addMessage({ author, text }) {
  const messages = await loadMessages()
  const message = {
    id: randomUUID(),
    author,
    text,
    createdAt: new Date().toISOString(),
  }
  await persist([...messages, message])
  return message
}
