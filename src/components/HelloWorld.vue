<script setup lang="ts">

defineProps<{ msg: string }>()


</script>

<template>
  <h1>{{ msg }}</h1>
</template>

<style scoped>
h1 {
  color: var(--text-primary);
}

.card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  padding: 2em;
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--shadow);
  margin: 1rem 0;
}

.card p {
  color: var(--text-secondary);
}

.card code {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
}

.read-the-docs {
  color: var(--text-muted);
  font-size: 0.9em;
}

p {
  color: var(--text-secondary);
  line-height: 1.6;
}

a {
  color: var(--link-color);
  transition: color 0.2s ease;
}

a:hover {
  color: var(--link-hover);
}

button {
  background-color: var(--accent-primary);
  color: white;
  border: none;
  padding: 0.75em 1.5em;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

button:hover {
  background-color: var(--accent-primary-hover);
}
</style>
