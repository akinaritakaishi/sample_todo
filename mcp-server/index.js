#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const baseUrl = process.env.CHAT_API_BASE_URL ?? 'http://localhost:3000'

async function fetchMessages(room) {
  const url = new URL('/api/chat/messages', baseUrl)
  if (room) url.searchParams.set('room', room)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`failed to fetch messages: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

async function postMessage(room, author, text) {
  const res = await fetch(`${baseUrl}/api/chat/messages`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ room, author, text }),
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
      'sample_todoアプリのチャットツール(front/の/chatページ)の指定チャンネルに投稿された全メッセージを投稿順で取得する。',
    inputSchema: {
      room: z.string().min(1).optional().describe('取得するチャンネルのID。省略時は"general"'),
    },
  },
  async ({ room }) => {
    const messages = await fetchMessages(room)
    return { content: [{ type: 'text', text: JSON.stringify(messages, null, 2) }] }
  },
)

server.registerTool(
  'send_chat_message',
  {
    title: 'チャットにメッセージを送信',
    description: 'sample_todoアプリのチャットツールの指定チャンネルへメッセージを1件投稿する。',
    inputSchema: {
      room: z.string().min(1).optional().describe('投稿先チャンネルのID。省略時は"general"'),
      author: z.string().min(1).describe('投稿者として表示する名前'),
      text: z.string().min(1).describe('メッセージ本文'),
    },
  },
  async ({ room, author, text }) => {
    const message = await postMessage(room, author, text)
    return { content: [{ type: 'text', text: JSON.stringify(message, null, 2) }] }
  },
)

const transport = new StdioServerTransport()
await server.connect(transport)
