<script setup>
const selectedRoomId = ref('general')
const [{ data: rooms }, { data: messages, refresh }] = await Promise.all([
  useFetch('/api/chat/rooms', { default: () => [] }),
  useFetch('/api/chat/messages', { query: { room: selectedRoomId }, default: () => [] }),
])
const selectedRoom = computed(() => rooms.value.find((r) => r.id === selectedRoomId.value))

const author = ref('あなた')
const text = ref('')

function selectRoom(roomId) {
  selectedRoomId.value = roomId
}

async function sendMessage() {
  const trimmed = text.value.trim()
  if (!trimmed) return
  await $fetch('/api/chat/messages', {
    method: 'POST',
    body: { room: selectedRoomId.value, author: author.value.trim(), text: trimmed },
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

    <div class="chat-layout">
      <aside class="chat-rooms">
        <h2 class="chat-rooms-title">チャンネル</h2>
        <ul class="chat-room-list">
          <li v-for="room in rooms" :key="room.id">
            <button
              type="button"
              :class="['chat-room-button', { active: room.id === selectedRoomId }]"
              @click="selectRoom(room.id)"
            >
              <span class="chat-room-icon">{{ room.icon }}</span>
              <span class="chat-room-name">{{ room.name }}</span>
            </button>
          </li>
        </ul>
      </aside>

      <div class="chat-main">
        <header v-if="selectedRoom" class="chat-room-header">
          <span class="chat-room-header-icon">{{ selectedRoom.icon }}</span>
          <h2 class="chat-room-header-name">{{ selectedRoom.name }}</h2>
        </header>

        <ul class="chat-list">
          <li v-for="message in messages" :key="message.id" class="chat-message">
            <span class="chat-avatar" :style="{ background: getAvatarColor(message.author) }">
              {{ getAvatarInitial(message.author) }}
            </span>
            <div class="chat-message-body">
              <div class="chat-message-meta">
                <span class="chat-message-author">{{ message.author }}</span>
                <span class="chat-message-time">{{ formatTime(message.createdAt) }}</span>
              </div>
              <p class="chat-message-text">{{ message.text }}</p>
            </div>
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
    </div>
  </div>
</template>
