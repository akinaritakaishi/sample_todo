<script setup>
const { data: messages, refresh } = await useFetch('/api/chat/messages', { default: () => [] })
const author = ref('あなた')
const text = ref('')

async function sendMessage() {
  const trimmed = text.value.trim()
  if (!trimmed) return
  await $fetch('/api/chat/messages', {
    method: 'POST',
    body: { author: author.value.trim(), text: trimmed },
  })
  text.value = ''
  await refresh()
}
</script>

<template>
  <div class="app chat-app">
    <header class="app-header">
      <h1>Chat</h1>
      <p class="app-sub">MCPサーバー経由でも読み書きできる簡易チャットです。</p>
    </header>

    <ul class="chat-list">
      <li v-for="message in messages" :key="message.id" class="chat-message">
        <div class="chat-message-meta">
          <span class="chat-message-author">{{ message.author }}</span>
          <span class="chat-message-time">{{ formatTime(message.createdAt) }}</span>
        </div>
        <p class="chat-message-text">{{ message.text }}</p>
      </li>
    </ul>

    <p v-if="messages.length === 0" class="empty-state visible">
      まだメッセージはありません。
    </p>

    <form class="chat-form" @submit.prevent="sendMessage">
      <input v-model="author" type="text" class="chat-author-input" aria-label="名前" >
      <input
        v-model="text"
        type="text"
        placeholder="メッセージを入力して Enter"
        autocomplete="off"
      >
      <button type="submit">送信</button>
    </form>
  </div>
</template>
