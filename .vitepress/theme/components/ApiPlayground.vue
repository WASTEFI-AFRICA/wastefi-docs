<template>
  <div class="api-playground">
    <div class="playground-header">
      <h3>🚀 Interactive API Playground</h3>
      <p>Test API endpoints directly from your browser</p>
    </div>

    <div class="playground-config">
      <div class="config-row">
        <label for="environment">Environment:</label>
        <select v-model="environment" id="environment">
          <option value="testnet">Testnet</option>
          <option value="production">Production</option>
        </select>
      </div>

      <div class="config-row">
        <label for="auth-token">Auth Token:</label>
        <input 
          v-model="authToken" 
          id="auth-token"
          type="password" 
          placeholder="Enter your JWT token (optional)"
          class="token-input"
        />
      </div>
    </div>

    <div class="endpoint-selector">
      <label for="endpoint">Select Endpoint:</label>
      <select v-model="selectedEndpoint" id="endpoint" @change="onEndpointChange">
        <option v-for="ep in endpoints" :key="ep.id" :value="ep.id">
          {{ ep.method }} {{ ep.path }}
        </option>
      </select>
    </div>

    <div v-if="currentEndpoint" class="endpoint-details">
      <div class="detail-section">
        <h4>{{ currentEndpoint.method }} {{ currentEndpoint.path }}</h4>
        <p class="endpoint-description">{{ currentEndpoint.description }}</p>
      </div>

      <div v-if="currentEndpoint.params.length > 0" class="params-section">
        <h4>Parameters</h4>
        <div v-for="param in currentEndpoint.params" :key="param.name" class="param-row">
          <label :for="param.name">
            {{ param.name }}
            <span v-if="param.required" class="required">*</span>
            <span class="param-type">{{ param.type }}</span>
          </label>
          <input 
            v-model="paramValues[param.name]"
            :id="param.name"
            :type="param.type === 'number' ? 'number' : 'text'"
            :placeholder="param.placeholder"
            class="param-input"
          />
        </div>
      </div>

      <div v-if="currentEndpoint.body" class="body-section">
        <h4>Request Body (JSON)</h4>
        <textarea 
          v-model="requestBody" 
          class="json-editor"
          rows="8"
          placeholder='{ "key": "value" }'
        ></textarea>
      </div>

      <button @click="sendRequest" :disabled="loading" class="send-button">
        {{ loading ? 'Sending...' : 'Send Request' }}
      </button>

      <div v-if="response" class="response-section">
        <div class="response-header">
          <h4>Response</h4>
          <span :class="['status-badge', responseStatus]">
            {{ responseStatusText }}
          </span>
        </div>
        <pre class="response-body"><code>{{ response }}</code></pre>
      </div>

      <div v-if="error" class="error-section">
        <h4>Error</h4>
        <pre class="error-body"><code>{{ error }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const environment = ref('testnet')
const authToken = ref('')
const selectedEndpoint = ref('get-materials')
const paramValues = ref({})
const requestBody = ref('')
const loading = ref(false)
const response = ref(null)
const error = ref(null)
const responseStatusText = ref('')
const responseStatus = ref('')

const baseUrls = {
  testnet: 'https://api-testnet.wastefi.org/v1',
  production: 'https://api.wastefi.org/v1'
}

const endpoints = [
  {
    id: 'get-materials',
    method: 'GET',
    path: '/materials',
    description: 'Retrieve list of supported material types',
    params: [],
    requiresAuth: false,
    body: false
  },
  {
    id: 'get-material',
    method: 'GET',
    path: '/materials/{id}',
    description: 'Get details of a specific material',
    params: [
      { name: 'id', type: 'text', required: true, placeholder: 'e.g., PET' }
    ],
    requiresAuth: false,
    body: false
  },
  {
    id: 'get-users',
    method: 'GET',
    path: '/users',
    description: 'List all users (requires authentication)',
    params: [
      { name: 'limit', type: 'number', required: false, placeholder: '20' },
      { name: 'cursor', type: 'text', required: false, placeholder: 'usr_abc123' }
    ],
    requiresAuth: true,
    body: false
  },
  {
    id: 'create-transaction',
    method: 'POST',
    path: '/transactions',
    description: 'Create a new waste collection transaction',
    params: [],
    requiresAuth: true,
    body: true,
    sampleBody: {
      userId: 'usr_123',
      materialType: 'PET',
      weight: 5.5,
      collectionPointId: 'cp_456'
    }
  },
  {
    id: 'get-transactions',
    method: 'GET',
    path: '/transactions',
    description: 'List transactions with optional filters',
    params: [
      { name: 'userId', type: 'text', required: false, placeholder: 'usr_123' },
      { name: 'status', type: 'text', required: false, placeholder: 'completed' },
      { name: 'limit', type: 'number', required: false, placeholder: '20' }
    ],
    requiresAuth: true,
    body: false
  },
  {
    id: 'get-collection-points',
    method: 'GET',
    path: '/collection-points',
    description: 'List all collection points',
    params: [
      { name: 'latitude', type: 'number', required: false, placeholder: '-1.2921' },
      { name: 'longitude', type: 'number', required: false, placeholder: '36.8219' },
      { name: 'radius', type: 'number', required: false, placeholder: '10' }
    ],
    requiresAuth: false,
    body: false
  },
  {
    id: 'get-impact',
    method: 'GET',
    path: '/impact/{userId}',
    description: 'Get environmental impact metrics for a user',
    params: [
      { name: 'userId', type: 'text', required: true, placeholder: 'usr_123' }
    ],
    requiresAuth: true,
    body: false
  }
]

const currentEndpoint = computed(() => {
  return endpoints.find(ep => ep.id === selectedEndpoint.value)
})

const onEndpointChange = () => {
  paramValues.value = {}
  response.value = null
  error.value = null
  if (currentEndpoint.value?.sampleBody) {
    requestBody.value = JSON.stringify(currentEndpoint.value.sampleBody, null, 2)
  } else {
    requestBody.value = ''
  }
}

const sendRequest = async () => {
  loading.value = true
  response.value = null
  error.value = null
  responseStatusText.value = ''
  responseStatus.value = ''

  try {
    const endpoint = currentEndpoint.value
    let url = baseUrls[environment.value] + endpoint.path

    // Replace path parameters
    for (const param of endpoint.params) {
      if (url.includes(`{${param.name}}`)) {
        url = url.replace(`{${param.name}}`, paramValues.value[param.name] || '')
      }
    }

    // Add query parameters
    const queryParams = endpoint.params.filter(p => !endpoint.path.includes(`{${p.name}}`))
    if (queryParams.length > 0) {
      const params = new URLSearchParams()
      queryParams.forEach(p => {
        if (paramValues.value[p.name]) {
          params.append(p.name, paramValues.value[p.name])
        }
      })
      const queryString = params.toString()
      if (queryString) {
        url += '?' + queryString
      }
    }

    const options = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json'
      }
    }

    if (authToken.value && endpoint.requiresAuth) {
      options.headers['Authorization'] = `Bearer ${authToken.value}`
    }

    if (endpoint.body && requestBody.value) {
      try {
        JSON.parse(requestBody.value) // Validate JSON
        options.body = requestBody.value
      } catch (e) {
        throw new Error('Invalid JSON in request body')
      }
    }

    const res = await fetch(url, options)
    responseStatusText.value = `${res.status} ${res.statusText}`
    responseStatus.value = res.ok ? 'success' : 'error'
    
    const data = await res.json()
    response.value = JSON.stringify(data, null, 2)
  } catch (e) {
    error.value = e.message
    responseStatus.value = 'error'
  } finally {
    loading.value = false
  }
}

// Initialize with sample body if available
if (currentEndpoint.value?.sampleBody) {
  requestBody.value = JSON.stringify(currentEndpoint.value.sampleBody, null, 2)
}
</script>

<style scoped>
.api-playground {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.playground-header {
  margin-bottom: 1.5rem;
}

.playground-header h3 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-brand);
}

.playground-header p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.playground-config,
.endpoint-selector {
  margin-bottom: 1rem;
}

.config-row,
.param-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

label {
  min-width: 120px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

select,
input[type="text"],
input[type="password"],
input[type="number"],
.token-input,
.param-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: inherit;
}

.endpoint-details {
  margin-top: 1.5rem;
}

.detail-section h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
}

.endpoint-description {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-2);
}

.params-section,
.body-section {
  margin: 1.5rem 0;
}

.params-section h4,
.body-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: var(--vp-c-text-1);
}

.required {
  color: var(--vp-c-danger);
  margin-left: 2px;
}

.param-type {
  margin-left: 0.5rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
}

.json-editor {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 0.9rem;
  resize: vertical;
}

.send-button {
  padding: 0.75rem 1.5rem;
  background: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.send-button:hover:not(:disabled) {
  background: var(--vp-c-brand-dark);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.response-section,
.error-section {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 4px;
  background: var(--vp-c-bg);
}

.response-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.response-header h4 {
  margin: 0;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.success {
  background: var(--vp-c-success-soft);
  color: var(--vp-c-success);
}

.status-badge.error {
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-danger);
}

.response-body,
.error-body {
  margin: 0;
  padding: 1rem;
  background: var(--vp-code-block-bg);
  border-radius: 4px;
  overflow-x: auto;
}

.response-body code,
.error-body code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
}

.error-section {
  border: 1px solid var(--vp-c-danger-soft);
}

.error-section h4 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-danger);
}

@media (max-width: 768px) {
  .config-row,
  .param-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  label {
    min-width: auto;
  }
}
</style>
