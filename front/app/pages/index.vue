<script setup>
const { data: tasks, refresh } = await useFetch('/api/tasks', { default: () => [] })
const title = ref('')
const due = ref('')

async function handleSubmit() {
  const trimmed = title.value.trim()
  if (!trimmed) return
  await $fetch('/api/tasks', { method: 'POST', body: { title: trimmed, due: due.value } })
  title.value = ''
  due.value = ''
  await refresh()
}

async function toggleTask(id) {
  const target = tasks.value.find((t) => t.id === id)
  if (!target) return
  await $fetch(`/api/tasks/${id}`, { method: 'PATCH', body: { done: !target.done } })
  await refresh()
}

async function deleteTask(id) {
  await $fetch(`/api/tasks/${id}`, { method: 'DELETE' })
  await refresh()
}

async function clearDoneTasks() {
  await $fetch('/api/tasks/clear-done', { method: 'POST' })
  await refresh()
}
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>Tasks</h1>
      <p class="app-sub">今日やることを、ここに置いておく。</p>
    </header>

    <form class="add-form" @submit.prevent="handleSubmit">
      <input
        v-model="title"
        type="text"
        placeholder="タスクを入力して Enter"
        autocomplete="off"
      >
      <input v-model="due" type="date" aria-label="期限" >
      <button type="submit">追加</button>
    </form>

    <div class="list-meta">
      <span>{{ tasks.length }}件のタスク</span>
      <button type="button" class="text-button" @click="clearDoneTasks">
        完了済みを削除
      </button>
    </div>

    <ul class="task-list">
      <TaskItem
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @toggle="toggleTask"
        @delete="deleteTask"
      />
    </ul>

    <p v-if="tasks.length === 0" class="empty-state visible">
      タスクはまだありません。上の入力欄から追加してください。
    </p>
  </div>
</template>
