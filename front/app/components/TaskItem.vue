<script setup>
const props = defineProps({
  task: { type: Object, required: true },
})
const emit = defineEmits(['toggle', 'delete'])

// Completed tasks are never highlighted, regardless of due date.
const dueStatus = computed(() => (props.task.done ? null : getDueStatus(props.task.due)))
</script>

<template>
  <li :class="['task-item', { done: task.done }, dueStatus && `due-${dueStatus}`]">
    <input
      type="checkbox"
      class="task-checkbox"
      :checked="task.done"
      @change="emit('toggle', task.id)"
    >
    <div class="task-main">
      <span class="task-title">{{ task.title }}</span>
      <span v-if="task.due" class="task-due">
        期限: {{ formatDue(task.due) }}
        <span v-if="dueStatus" class="task-due-label">{{ DUE_STATUS_LABELS[dueStatus] }}</span>
      </span>
    </div>
    <button
      type="button"
      class="task-delete"
      aria-label="削除"
      @click="emit('delete', task.id)"
    >
      ×
    </button>
  </li>
</template>
