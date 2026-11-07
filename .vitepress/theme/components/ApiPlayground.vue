<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const servers = {
  demo: 'https://wastefi-backend.onrender.com/api/v1',
  local: 'http://localhost:3001/api/v1'
}
const endpoints = [
  { path: '/public/materials', label: 'Material catalogue', description: 'Accepted material codes, display labels and KES prices.' },
  { path: '/public/stats', label: 'Public statistics', description: 'Anonymous collection aggregates and recorded WASTE payouts.' },
  { path: '/collection-points?limit=10', label: 'Collection points', description: 'The first page of active collection points.' }
]

const server = ref('demo')
const selectedPath = ref(endpoints[0].path)
const endpoint = computed(() => endpoints.find(item => item.path === selectedPath.value))
const requestUrl = computed(() => servers[server.value] + selectedPath.value)
const loading = ref(false)
const responseBody = ref(null)
const responseStatus = ref('')
const responseOk = ref(false)
const error = ref('')
let controller

function resetResponse() {
  responseBody.value = null
  responseStatus.value = ''
  error.value = ''
}

watch([server, selectedPath], resetResponse)
onBeforeUnmount(() => controller?.abort())

async function sendRequest() {
  if (loading.value) return
  resetResponse()
  loading.value = true
  controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 45000)

  try {
    const result = await fetch(requestUrl.value, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'omit',
      signal: controller.signal
    })
    responseStatus.value = `${result.status} ${result.statusText}`.trim()
    responseOk.value = result.ok
    const text = await result.text()
    try {
      responseBody.value = JSON.stringify(JSON.parse(text), null, 2)
    } catch {
      responseBody.value = text || '(empty response)'
    }
    if (!result.ok) error.value = `The server returned HTTP ${result.status}. See the response below.`
  } catch (cause) {
    error.value = cause?.name === 'AbortError'
      ? 'The request timed out. The demo may be waking up; try again shortly.'
      : 'Could not reach this server. It may be offline, waking up, or blocked by browser CORS. Try curl or your local backend.'
  } finally {
    clearTimeout(timeout)
    loading.value = false
    controller = undefined
  }
}
</script>

<template>
  <section class="api-playground" aria-label="Public API playground" :aria-busy="loading">
    <div class="playground-heading">
      <span class="read-badge">Public GET requests</span>
      <p>Explore the API with real responses. No sign-in needed.</p>
    </div>

    <div class="playground-fields">
      <div>
        <label for="api-server">Server</label>
        <select id="api-server" v-model="server" :disabled="loading">
          <option value="demo">Hosted demo (Stellar testnet)</option>
          <option value="local">Local backend</option>
        </select>
      </div>
      <div>
        <label for="api-endpoint">Endpoint</label>
        <select id="api-endpoint" v-model="selectedPath" :disabled="loading">
          <option v-for="item in endpoints" :key="item.path" :value="item.path">{{ item.label }}</option>
        </select>
      </div>
    </div>

    <p class="endpoint-description">{{ endpoint.description }}</p>
    <div class="request-preview"><span>GET</span><code>{{ requestUrl }}</code></div>
    <div class="request-actions">
      <button type="button" :disabled="loading" @click="sendRequest">
        {{ loading ? 'Waiting for response…' : 'Send request' }}
      </button>
      <span class="request-hint">The hosted demo can take time to wake.</span>
    </div>

    <p v-if="error" class="request-error" role="alert">{{ error }}</p>
    <div class="response-status" role="status" aria-live="polite">
      <span v-if="responseStatus" :class="responseOk ? 'status-success' : 'status-error'">{{ responseStatus }}</span>
    </div>
    <pre v-if="responseBody !== null" class="response-body" tabindex="0" aria-label="API response"><code>{{ responseBody }}</code></pre>
  </section>
</template>

<style scoped>
.api-playground {
  margin: 1.5rem 0;
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
.playground-heading { margin-bottom: 1.25rem; }
.read-badge {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 0.75rem;
  font-weight: 600;
}
.playground-heading p { margin: 0.5rem 0 0; }
.playground-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.playground-fields > div { min-width: 0; }
label { display: block; margin-bottom: 0.35rem; font-size: 0.85rem; font-weight: 600; }
select {
  width: 100%;
  padding: 0.65rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font: inherit;
}
.endpoint-description, .request-hint { color: var(--vp-c-text-2); font-size: 0.85rem; }
.endpoint-description { margin: 1rem 0 0.75rem; }
.request-preview { display: flex; align-items: baseline; gap: 0.75rem; padding: 0.85rem; border-radius: 6px; background: var(--vp-c-bg); }
.request-preview span { color: var(--vp-c-brand-1); font: 600 0.8rem var(--vp-font-family-mono); }
.request-preview code { padding: 0; background: transparent; overflow-wrap: anywhere; font-size: 0.8rem; }
.request-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-top: 1rem; }
button { padding: 0.6rem 1rem; border-radius: 6px; background: var(--vp-button-brand-bg); color: var(--vp-button-brand-text); font-weight: 600; cursor: pointer; }
button:hover:not(:disabled) { background: var(--vp-button-brand-hover-bg); }
button:disabled, select:disabled { opacity: 0.65; cursor: wait; }
button:focus-visible, select:focus-visible, pre:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
.request-error { margin-bottom: 0; color: var(--vp-c-danger-1); font-size: 0.85rem; }
.response-status { margin-top: 0.75rem; font: 600 0.85rem var(--vp-font-family-mono); }
.status-success { color: var(--vp-c-tip-1); }
.status-error { color: var(--vp-c-danger-1); }
.response-body { max-height: 22rem; overflow: auto; padding: 1rem; border: 1px solid var(--vp-c-divider); border-radius: 6px; background: var(--vp-c-bg); font-size: 0.8rem; line-height: 1.6; }
.response-body code { padding: 0; background: transparent; color: var(--vp-c-text-1); }
@media (max-width: 640px) {
  .api-playground { padding: 1rem; }
  .playground-fields { grid-template-columns: 1fr; }
  .request-hint { flex-basis: 100%; }
}
</style>
