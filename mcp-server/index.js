#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const baseUrl = process.env.CHAT_API_BASE_URL ?? 'http://localhost:3000'

async function fetchMessages() {
  const res = await fetch(`${baseUrl}/api/chat/messages`)
  if (!res.ok) {
    throw new Error(`failed to fetch messages: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

async function postMessage(author, text) {
  const res = await fetch(`${baseUrl}/api/chat/messages`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ author, text }),
  })
  if (!res.ok) {
    throw new Error(`failed to post message: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

const server = new McpServer({
  name: 'sample-todo-chat',
  version: '0.1.0',
})

server.registerTool(
  'list_chat_messages',
  {
    title: 'チャットメッセージ一覧を取得',
    description:
      'sample_todoアプリのチャットツール(front/の/chatページ)に投稿された全メッセージを投稿順で取得する。',
    inputSchema: {},
  },
  async () => {
    const messages = await fetchMessages()
    return { content: [{ type: 'text', text: JSON.stringify(messages, null, 2) }] }
  },
)

server.registerTool(
  'send_chat_message',
  {
    title: 'チャットにメッセージを送信',
    description: 'sample_todoアプリのチャットツールへメッセージを1件投稿する。',
    inputSchema: {
      author: z.string().min(1).describe('投稿者として表示する名前'),
      text: z.string().min(1).describe('メッセージ本文'),
    },
  },
  async ({ author, text }) => {
    const message = await postMessage(author, text)
    return { content: [{ type: 'text', text: JSON.stringify(message, null, 2) }] }
  },
)

const transport = new StdioServerTransport()
await server.connect(transport)
