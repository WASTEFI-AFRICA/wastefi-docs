# API Integration Examples

## Overview

This guide provides practical examples of integrating with the WasteFi API in multiple programming languages. All examples include authentication, error handling, and best practices.

## Base Configuration

### API Endpoint

```
Development: http://localhost:3000/api/v1
Staging:     https://api-staging.wastefi.org/api/v1
Production:  https://api.wastefi.org/api/v1
```

### Authentication

All API requests (except login/register) require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Quick Start Examples

### JavaScript/TypeScript (Node.js)

**Install dependencies:**

```bash
npm install axios
```

**Create API client:**

```javascript
// api-client.js
import axios from 'axios';

class WasteFiAPI {
  constructor(baseURL, token = null) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (token) {
      this.setToken(token);
    }

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response.data,
      error => {
        if (error.response) {
          // Server responded with error
          throw new Error(error.response.data.message || 'API Error');
        } else if (error.request) {
          // No response received
          throw new Error('Network error - please check your connection');
        } else {
          throw new Error(error.message);
        }
      }
    );
  }

  setToken(token) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Authentication
  async login(phone, pin) {
    const response = await this.client.post('/auth/login', { phone, pin });
    this.setToken(response.token);
    return response;
  }

  async register(userData) {
    return await this.client.post('/auth/register', userData);
  }

  // Users
  async getProfile() {
    return await this.client.get('/users/me');
  }

  async updateProfile(data) {
    return await this.client.patch('/users/me', data);
  }

  // Transactions
  async createTransaction(transactionData) {
    return await this.client.post('/transactions', transactionData);
  }

  async getTransactions(params = {}) {
    return await this.client.get('/transactions', { params });
  }

  async getTransaction(id) {
    return await this.client.get(`/transactions/${id}`);
  }

  async confirmTransaction(id) {
    return await this.client.patch(`/transactions/${id}/confirm`);
  }

  // Collection Points
  async getCollectionPoints(params = {}) {
    return await this.client.get('/collection-points', { params });
  }

  async getNearbyCollectionPoints(latitude, longitude, radius = 5) {
    return await this.client.get('/collection-points/nearby', {
      params: { latitude, longitude, radius }
    });
  }

  // Materials
  async getMaterials() {
    return await this.client.get('/materials');
  }

  async getMaterialPricing(materialType) {
    return await this.client.get(`/materials/${materialType}/pricing`);
  }

  // Impact
  async getImpact() {
    return await this.client.get('/impact/me');
  }
}

export default WasteFiAPI;
```

**Usage example:**

```javascript
// example.js
import WasteFiAPI from './api-client.js';

const api = new WasteFiAPI('http://localhost:3000/api/v1');

async function main() {
  try {
    // 1. Login
    console.log('Logging in...');
    const { token, user } = await api.login('+254712345678', '1234');
    console.log('Logged in as:', user.name);

    // 2. Get profile
    const profile = await api.getProfile();
    console.log('Balance:', profile.balance);

    // 3. Find nearby collection points
    const collectionPoints = await api.getNearbyCollectionPoints(
      -1.286389,  // Nairobi latitude
      36.817223,  // Nairobi longitude
      10          // 10 km radius
    );
    console.log(`Found ${collectionPoints.length} collection points`);

    // 4. Get material pricing
    const petPricing = await api.getMaterialPricing('PET');
    console.log('PET price:', petPricing.basePrice, 'per kg');

    // 5. Create transaction
    const transaction = await api.createTransaction({
      collectionPointId: collectionPoints[0].id,
      materialType: 'PET',
      weight: 5.5,
      quality: 'A'
    });
    console.log('Transaction created:', transaction.id);
    console.log('Amount to receive:', transaction.netAmount);

    // 6. Get impact
    const impact = await api.getImpact();
    console.log('Total CO2 saved:', impact.totalCo2Saved, 'kg');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

---

### Python

**Install dependencies:**

```bash
pip install requests
```

**Create API client:**

```python
# wastefi_api.py
import requests
from typing import Dict, List, Optional

class WasteFiAPI:
    def __init__(self, base_url: str, token: Optional[str] = None):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json'
        })
        
        if token:
            self.set_token(token)
    
    def set_token(self, token: str):
        self.session.headers.update({
            'Authorization': f'Bearer {token}'
        })
    
    def _request(self, method: str, endpoint: str, **kwargs) -> Dict:
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.request(method, url, timeout=30, **kwargs)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            error_message = e.response.json().get('message', 'API Error')
            raise Exception(error_message)
        except requests.exceptions.RequestException as e:
            raise Exception(f'Network error: {str(e)}')
    
    # Authentication
    def login(self, phone: str, pin: str) -> Dict:
        response = self._request('POST', '/auth/login', json={
            'phone': phone,
            'pin': pin
        })
        self.set_token(response['token'])
        return response
    
    def register(self, user_data: Dict) -> Dict:
        return self._request('POST', '/auth/register', json=user_data)
    
    # Users
    def get_profile(self) -> Dict:
        return self._request('GET', '/users/me')
    
    def update_profile(self, data: Dict) -> Dict:
        return self._request('PATCH', '/users/me', json=data)
    
    # Transactions
    def create_transaction(self, transaction_data: Dict) -> Dict:
        return self._request('POST', '/transactions', json=transaction_data)
    
    def get_transactions(self, params: Optional[Dict] = None) -> List[Dict]:
        return self._request('GET', '/transactions', params=params)
    
    def get_transaction(self, transaction_id: str) -> Dict:
        return self._request('GET', f'/transactions/{transaction_id}')
    
    def confirm_transaction(self, transaction_id: str) -> Dict:
        return self._request('PATCH', f'/transactions/{transaction_id}/confirm')
    
    # Collection Points
    def get_collection_points(self, params: Optional[Dict] = None) -> List[Dict]:
        return self._request('GET', '/collection-points', params=params)
    
    def get_nearby_collection_points(
        self, 
        latitude: float, 
        longitude: float, 
        radius: int = 5
    ) -> List[Dict]:
        return self._request('GET', '/collection-points/nearby', params={
            'latitude': latitude,
            'longitude': longitude,
            'radius': radius
        })
    
    # Materials
    def get_materials(self) -> List[Dict]:
        return self._request('GET', '/materials')
    
    def get_material_pricing(self, material_type: str) -> Dict:
        return self._request('GET', f'/materials/{material_type}/pricing')
    
    # Impact
    def get_impact(self) -> Dict:
        return self._request('GET', '/impact/me')
```

**Usage example:**

```python
# example.py
from wastefi_api import WasteFiAPI

def main():
    api = WasteFiAPI('http://localhost:3000/api/v1')
    
    try:
        # 1. Login
        print('Logging in...')
        result = api.login('+254712345678', '1234')
        print(f"Logged in as: {result['user']['name']}")
        
        # 2. Get profile
        profile = api.get_profile()
        print(f"Balance: {profile['balance']}")
        
        # 3. Find nearby collection points
        collection_points = api.get_nearby_collection_points(
            latitude=-1.286389,
            longitude=36.817223,
            radius=10
        )
        print(f"Found {len(collection_points)} collection points")
        
        # 4. Get material pricing
        pet_pricing = api.get_material_pricing('PET')
        print(f"PET price: ${pet_pricing['basePrice']} per kg")
        
        # 5. Create transaction
        transaction = api.create_transaction({
            'collectionPointId': collection_points[0]['id'],
            'materialType': 'PET',
            'weight': 5.5,
            'quality': 'A'
        })
        print(f"Transaction created: {transaction['id']}")
        print(f"Amount to receive: ${transaction['netAmount']}")
        
        # 6. Get impact
        impact = api.get_impact()
        print(f"Total CO2 saved: {impact['totalCo2Saved']} kg")
        
    except Exception as e:
        print(f'Error: {str(e)}')

if __name__ == '__main__':
    main()
```

---

### PHP

**Create API client:**

```php
<?php
// WasteFiAPI.php

class WasteFiAPI {
    private $baseUrl;
    private $token;
    private $timeout = 30;
    
    public function __construct($baseUrl, $token = null) {
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->token = $token;
    }
    
    public function setToken($token) {
        $this->token = $token;
    }
    
    private function request($method, $endpoint, $data = null, $params = []) {
        $url = $this->baseUrl . $endpoint;
        
        if (!empty($params)) {
            $url .= '?' . http_build_query($params);
        }
        
        $headers = [
            'Content-Type: application/json',
        ];
        
        if ($this->token) {
            $headers[] = 'Authorization: Bearer ' . $this->token;
        }
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, $this->timeout);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        switch ($method) {
            case 'POST':
                curl_setopt($ch, CURLOPT_POST, true);
                break;
            case 'PATCH':
            case 'PUT':
            case 'DELETE':
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
                break;
        }
        
        if ($data !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 400) {
            $error = json_decode($response, true);
            throw new Exception($error['message'] ?? 'API Error');
        }
        
        return json_decode($response, true);
    }
    
    // Authentication
    public function login($phone, $pin) {
        $response = $this->request('POST', '/auth/login', [
            'phone' => $phone,
            'pin' => $pin
        ]);
        $this->setToken($response['token']);
        return $response;
    }
    
    public function register($userData) {
        return $this->request('POST', '/auth/register', $userData);
    }
    
    // Users
    public function getProfile() {
        return $this->request('GET', '/users/me');
    }
    
    public function updateProfile($data) {
        return $this->request('PATCH', '/users/me', $data);
    }
    
    // Transactions
    public function createTransaction($transactionData) {
        return $this->request('POST', '/transactions', $transactionData);
    }
    
    public function getTransactions($params = []) {
        return $this->request('GET', '/transactions', null, $params);
    }
    
    public function getTransaction($id) {
        return $this->request('GET', "/transactions/$id");
    }
    
    public function confirmTransaction($id) {
        return $this->request('PATCH', "/transactions/$id/confirm");
    }
    
    // Collection Points
    public function getCollectionPoints($params = []) {
        return $this->request('GET', '/collection-points', null, $params);
    }
    
    public function getNearbyCollectionPoints($latitude, $longitude, $radius = 5) {
        return $this->request('GET', '/collection-points/nearby', null, [
            'latitude' => $latitude,
            'longitude' => $longitude,
            'radius' => $radius
        ]);
    }
    
    // Materials
    public function getMaterials() {
        return $this->request('GET', '/materials');
    }
    
    public function getMaterialPricing($materialType) {
        return $this->request('GET', "/materials/$materialType/pricing");
    }
    
    // Impact
    public function getImpact() {
        return $this->request('GET', '/impact/me');
    }
}
```

**Usage example:**

```php
<?php
// example.php
require_once 'WasteFiAPI.php';

$api = new WasteFiAPI('http://localhost:3000/api/v1');

try {
    // 1. Login
    echo "Logging in...\n";
    $result = $api->login('+254712345678', '1234');
    echo "Logged in as: {$result['user']['name']}\n";
    
    // 2. Get profile
    $profile = $api->getProfile();
    echo "Balance: {$profile['balance']}\n";
    
    // 3. Find nearby collection points
    $collectionPoints = $api->getNearbyCollectionPoints(-1.286389, 36.817223, 10);
    echo "Found " . count($collectionPoints) . " collection points\n";
    
    // 4. Create transaction
    $transaction = $api->createTransaction([
        'collectionPointId' => $collectionPoints[0]['id'],
        'materialType' => 'PET',
        'weight' => 5.5,
        'quality' => 'A'
    ]);
    echo "Transaction created: {$transaction['id']}\n";
    echo "Amount to receive: \${$transaction['netAmount']}\n";
    
    // 5. Get impact
    $impact = $api->getImpact();
    echo "Total CO2 saved: {$impact['totalCo2Saved']} kg\n";
    
} catch (Exception $e) {
    echo "Error: {$e->getMessage()}\n";
}
```

---

### Ruby

**Install dependencies:**

```bash
gem install httparty
```

**Create API client:**

```ruby
# wastefi_api.rb
require 'httparty'
require 'json'

class WasteFiAPI
  include HTTParty
  
  def initialize(base_url, token = nil)
    self.class.base_uri base_url
    self.class.default_timeout 30
    @token = token
    update_headers
  end
  
  def set_token(token)
    @token = token
    update_headers
  end
  
  private
  
  def update_headers
    headers = { 'Content-Type' => 'application/json' }
    headers['Authorization'] = "Bearer #{@token}" if @token
    self.class.headers headers
  end
  
  def request(method, endpoint, options = {})
    response = self.class.send(method, endpoint, options)
    
    if response.success?
      response.parsed_response
    else
      error_message = response.parsed_response['message'] || 'API Error'
      raise StandardError, error_message
    end
  rescue HTTParty::Error => e
    raise StandardError, "Network error: #{e.message}"
  end
  
  public
  
  # Authentication
  def login(phone, pin)
    response = request(:post, '/auth/login', body: {
      phone: phone,
      pin: pin
    }.to_json)
    set_token(response['token'])
    response
  end
  
  def register(user_data)
    request(:post, '/auth/register', body: user_data.to_json)
  end
  
  # Users
  def get_profile
    request(:get, '/users/me')
  end
  
  def update_profile(data)
    request(:patch, '/users/me', body: data.to_json)
  end
  
  # Transactions
  def create_transaction(transaction_data)
    request(:post, '/transactions', body: transaction_data.to_json)
  end
  
  def get_transactions(params = {})
    request(:get, '/transactions', query: params)
  end
  
  def get_transaction(id)
    request(:get, "/transactions/#{id}")
  end
  
  def confirm_transaction(id)
    request(:patch, "/transactions/#{id}/confirm")
  end
  
  # Collection Points
  def get_collection_points(params = {})
    request(:get, '/collection-points', query: params)
  end
  
  def get_nearby_collection_points(latitude, longitude, radius = 5)
    request(:get, '/collection-points/nearby', query: {
      latitude: latitude,
      longitude: longitude,
      radius: radius
    })
  end
  
  # Materials
  def get_materials
    request(:get, '/materials')
  end
  
  def get_material_pricing(material_type)
    request(:get, "/materials/#{material_type}/pricing")
  end
  
  # Impact
  def get_impact
    request(:get, '/impact/me')
  end
end
```

**Usage example:**

```ruby
# example.rb
require_relative 'wastefi_api'

api = WasteFiAPI.new('http://localhost:3000/api/v1')

begin
  # 1. Login
  puts 'Logging in...'
  result = api.login('+254712345678', '1234')
  puts "Logged in as: #{result['user']['name']}"
  
  # 2. Get profile
  profile = api.get_profile
  puts "Balance: #{profile['balance']}"
  
  # 3. Find nearby collection points
  collection_points = api.get_nearby_collection_points(-1.286389, 36.817223, 10)
  puts "Found #{collection_points.length} collection points"
  
  # 4. Create transaction
  transaction = api.create_transaction(
    collectionPointId: collection_points[0]['id'],
    materialType: 'PET',
    weight: 5.5,
    quality: 'A'
  )
  puts "Transaction created: #{transaction['id']}"
  puts "Amount to receive: $#{transaction['netAmount']}"
  
  # 5. Get impact
  impact = api.get_impact
  puts "Total CO2 saved: #{impact['totalCo2Saved']} kg"
  
rescue StandardError => e
  puts "Error: #{e.message}"
end
```

---

### Go

**Create API client:**

```go
// wastefi_api.go
package wastefi

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "time"
)

type Client struct {
    baseURL    string
    token      string
    httpClient *http.Client
}

func NewClient(baseURL string, token string) *Client {
    return &Client{
        baseURL: baseURL,
        token:   token,
        httpClient: &http.Client{
            Timeout: 30 * time.Second,
        },
    }
}

func (c *Client) SetToken(token string) {
    c.token = token
}

func (c *Client) request(method, endpoint string, body interface{}) (map[string]interface{}, error) {
    url := c.baseURL + endpoint
    
    var reqBody io.Reader
    if body != nil {
        jsonData, err := json.Marshal(body)
        if err != nil {
            return nil, err
        }
        reqBody = bytes.NewBuffer(jsonData)
    }
    
    req, err := http.NewRequest(method, url, reqBody)
    if err != nil {
        return nil, err
    }
    
    req.Header.Set("Content-Type", "application/json")
    if c.token != "" {
        req.Header.Set("Authorization", "Bearer "+c.token)
    }
    
    resp, err := c.httpClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    var result map[string]interface{}
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return nil, err
    }
    
    if resp.StatusCode >= 400 {
        message := result["message"].(string)
        return nil, fmt.Errorf("API error: %s", message)
    }
    
    return result, nil
}

// Authentication
func (c *Client) Login(phone, pin string) (map[string]interface{}, error) {
    result, err := c.request("POST", "/auth/login", map[string]string{
        "phone": phone,
        "pin":   pin,
    })
    if err != nil {
        return nil, err
    }
    
    c.SetToken(result["token"].(string))
    return result, nil
}

// Transactions
func (c *Client) CreateTransaction(data map[string]interface{}) (map[string]interface{}, error) {
    return c.request("POST", "/transactions", data)
}

func (c *Client) GetTransaction(id string) (map[string]interface{}, error) {
    return c.request("GET", fmt.Sprintf("/transactions/%s", id), nil)
}

// Collection Points
func (c *Client) GetNearbyCollectionPoints(lat, lon float64, radius int) ([]interface{}, error) {
    endpoint := fmt.Sprintf("/collection-points/nearby?latitude=%f&longitude=%f&radius=%d", lat, lon, radius)
    result, err := c.request("GET", endpoint, nil)
    if err != nil {
        return nil, err
    }
    
    return result["data"].([]interface{}), nil
}

// Impact
func (c *Client) GetImpact() (map[string]interface{}, error) {
    return c.request("GET", "/impact/me", nil)
}
```

**Usage example:**

```go
// example.go
package main

import (
    "fmt"
    "log"
    "wastefi"
)

func main() {
    client := wastefi.NewClient("http://localhost:3000/api/v1", "")
    
    // 1. Login
    fmt.Println("Logging in...")
    loginResult, err := client.Login("+254712345678", "1234")
    if err != nil {
        log.Fatal(err)
    }
    user := loginResult["user"].(map[string]interface{})
    fmt.Printf("Logged in as: %s\n", user["name"])
    
    // 2. Find nearby collection points
    collectionPoints, err := client.GetNearbyCollectionPoints(-1.286389, 36.817223, 10)
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Found %d collection points\n", len(collectionPoints))
    
    // 3. Create transaction
    firstPoint := collectionPoints[0].(map[string]interface{})
    transaction, err := client.CreateTransaction(map[string]interface{}{
        "collectionPointId": firstPoint["id"],
        "materialType":      "PET",
        "weight":            5.5,
        "quality":           "A",
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Transaction created: %s\n", transaction["id"])
    fmt.Printf("Amount to receive: $%.2f\n", transaction["netAmount"])
    
    // 4. Get impact
    impact, err := client.GetImpact()
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Total CO2 saved: %.2f kg\n", impact["totalCo2Saved"])
}
```

---

## Advanced Examples

### Webhook Integration

**Node.js Express Webhook Handler:**

```javascript
import express from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.json());

// Verify webhook signature
function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Handle M-Pesa callback
app.post('/webhooks/mpesa', (req, res) => {
  const signature = req.headers['x-wastefi-signature'];
  const secret = process.env.WEBHOOK_SECRET;
  
  if (!verifySignature(req.body, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const { event, data } = req.body;
  
  switch (event) {
    case 'payment.completed':
      console.log(`Payment completed: ${data.transactionId}`);
      // Update your database
      break;
      
    case 'payment.failed':
      console.log(`Payment failed: ${data.transactionId}`);
      // Handle failure
      break;
      
    default:
      console.log(`Unknown event: ${event}`);
  }
  
  res.status(200).json({ received: true });
});

app.listen(3001, () => {
  console.log('Webhook server running on port 3001');
});
```

### Batch Operations

**Create multiple transactions:**

```javascript
async function processBatch(transactions) {
  const results = await Promise.allSettled(
    transactions.map(tx => api.createTransaction(tx))
  );
  
  const successful = results.filter(r => r.status === 'fulfilled');
  const failed = results.filter(r => r.status === 'rejected');
  
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);
  
  return { successful, failed };
}

// Usage
const transactions = [
  { collectionPointId: 'cp-1', materialType: 'PET', weight: 5.5, quality: 'A' },
  { collectionPointId: 'cp-1', materialType: 'HDPE', weight: 3.2, quality: 'B' },
  { collectionPointId: 'cp-2', materialType: 'PET', weight: 7.8, quality: 'A' },
];

const result = await processBatch(transactions);
```

### Pagination

**Fetch all transactions with pagination:**

```javascript
async function getAllTransactions() {
  let allTransactions = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = await api.getTransactions({
      page,
      limit: 100
    });
    
    allTransactions = allTransactions.concat(response.data);
    hasMore = response.pagination.hasNextPage;
    page++;
  }
  
  return allTransactions;
}
```

### Rate Limiting Handling

**Implement exponential backoff:**

```javascript
async function apiCallWithRetry(apiCall, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.response?.status === 429) {
        // Rate limited
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Rate limited. Waiting ${waitTime}ms before retry ${attempt}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const transaction = await apiCallWithRetry(() => 
  api.createTransaction(transactionData)
);
```

---

## Testing

### Mock API for Testing

```javascript
// mock-api.js
import nock from 'nock';

export function mockWasteFiAPI(baseURL) {
  const mock = nock(baseURL);
  
  // Mock login
  mock.post('/auth/login')
    .reply(200, {
      token: 'mock-jwt-token',
      user: {
        id: '1',
        phone: '+254712345678',
        name: 'Test User'
      }
    });
  
  // Mock get profile
  mock.get('/users/me')
    .reply(200, {
      id: '1',
      phone: '+254712345678',
      name: 'Test User',
      balance: 10.50
    });
  
  // Mock create transaction
  mock.post('/transactions')
    .reply(201, {
      id: 'tx-123',
      status: 'pending',
      netAmount: 1.94
    });
  
  return mock;
}

// Usage in tests
import { mockWasteFiAPI } from './mock-api';

describe('WasteFi API Integration', () => {
  beforeEach(() => {
    mockWasteFiAPI('http://localhost:3000/api/v1');
  });
  
  it('should login successfully', async () => {
    const result = await api.login('+254712345678', '1234');
    expect(result.token).toBe('mock-jwt-token');
  });
});
```

---

## Best Practices

### Error Handling

```javascript
try {
  const transaction = await api.createTransaction(data);
} catch (error) {
  if (error.response) {
    // API returned error
    console.error('API Error:', error.response.data.message);
    
    switch (error.response.status) {
      case 400:
        // Validation error
        console.error('Validation errors:', error.response.data.errors);
        break;
      case 401:
        // Unauthorized - token expired
        await refreshToken();
        break;
      case 429:
        // Rate limited
        await waitAndRetry();
        break;
      case 500:
        // Server error
        alert('Server error. Please try again later.');
        break;
    }
  } else {
    // Network error
    console.error('Network error:', error.message);
  }
}
```

### Request Timeout

```javascript
const api = new WasteFiAPI('http://localhost:3000/api/v1');
api.client.defaults.timeout = 30000; // 30 seconds
```

### Logging

```javascript
// Add request/response logging
api.client.interceptors.request.use(request => {
  console.log('Request:', request.method, request.url);
  return request;
});

api.client.interceptors.response.use(response => {
  console.log('Response:', response.status, response.config.url);
  return response;
});
```

---

**Next:** [Customization Guide](./customization.md)
