# Mobile Money Integration Guide

## Overview

WasteFi integrates with major mobile money providers across Africa to enable instant cash-out for collectors. This guide covers integration with M-Pesa, MTN Mobile Money, Airtel Money, and other providers.

## Supported Providers

| Provider | Countries | API Type | Documentation |
|----------|-----------|----------|---------------|
| M-Pesa | Kenya, Tanzania | REST | [Daraja API](https://developer.safaricom.co.ke/) |
| MTN Mobile Money | Ghana, Uganda, Nigeria | REST | [MoMo API](https://momodeveloper.mtn.com/) |
| Airtel Money | Kenya, Ghana, Nigeria | REST | [Airtel API](https://developers.airtel.africa/) |
| Vodafone Cash | Ghana | REST | [Vodafone API](https://developers.vodafone.com/) |
| Tigo Pesa | Tanzania | REST | [Tigo API](https://developers.tigo.co.tz/) |

---

## M-Pesa Integration (Kenya & Tanzania)

### Setup

#### 1. Register on Daraja Portal

1. Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke/)
2. Create account and login
3. Create a new app
4. Note your Consumer Key and Consumer Secret

#### 2. Environment Variables

```bash
# .env
MPESA_ENVIRONMENT=sandbox  # or production
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379  # Your paybill/till number
MPESA_PASSKEY=your_passkey
MPESA_INITIATOR_NAME=testapi
MPESA_SECURITY_CREDENTIAL=your_security_credential

# Callback URLs
MPESA_CALLBACK_URL=https://api.wastefi.org/v1/callbacks/mpesa
MPESA_TIMEOUT_URL=https://api.wastefi.org/v1/callbacks/mpesa/timeout
MPESA_RESULT_URL=https://api.wastefi.org/v1/callbacks/mpesa/result
```

### Authentication

```javascript
const axios = require('axios');

class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.environment = process.env.MPESA_ENVIRONMENT;
    
    this.baseURL = this.environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }
  
  async getAccessToken() {
    const auth = Buffer.from(
      `${this.consumerKey}:${this.consumerSecret}`
    ).toString('base64');
    
    try {
      const response = await axios.get(
        `${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        }
      );
      
      return response.data.access_token;
    } catch (error) {
      console.error('Failed to get M-Pesa access token:', error);
      throw error;
    }
  }
}
```

### B2C Payment (Business to Customer)

```javascript
async sendMpesaPayment(phoneNumber, amount, reference) {
  const accessToken = await this.getAccessToken();
  
  // Format phone number (254XXXXXXXXX)
  const formattedPhone = phoneNumber.replace(/^\+/, '').replace(/^0/, '254');
  
  const payload = {
    InitiatorName: process.env.MPESA_INITIATOR_NAME,
    SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
    CommandID: 'BusinessPayment',
    Amount: Math.floor(amount), // M-Pesa uses integers
    PartyA: process.env.MPESA_SHORTCODE,
    PartyB: formattedPhone,
    Remarks: `WasteFi payment for transaction ${reference}`,
    QueueTimeOutURL: process.env.MPESA_TIMEOUT_URL,
    ResultURL: process.env.MPESA_RESULT_URL,
    Occasion: reference
  };
  
  try {
    const response = await axios.post(
      `${this.baseURL}/mpesa/b2c/v1/paymentrequest`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      success: true,
      conversationId: response.data.ConversationID,
      originatorConversationId: response.data.OriginatorConversationID,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription
    };
  } catch (error) {
    console.error('M-Pesa B2C payment failed:', error.response?.data);
    throw new Error(error.response?.data?.errorMessage || 'Payment failed');
  }
}
```

### Callback Handler

```javascript
async handleMpesaCallback(req, res) {
  const { Result } = req.body;
  
  try {
    if (Result.ResultCode === 0) {
      // Payment successful
      const transactionId = Result.TransactionID;
      const amount = Result.ResultParameters.ResultParameter.find(
        p => p.Key === 'TransactionAmount'
      )?.Value;
      
      // Update database
      await db.payments.update(
        { mpesaTransactionId: Result.ConversationID },
        {
          status: 'completed',
          providerReference: transactionId,
          completedAt: new Date()
        }
      );
      
      // Notify user
      await notifyUser({
        phone: Result.ReceiverPartyPublicName,
        message: `Payment of KES ${amount} received successfully`
      });
      
    } else {
      // Payment failed
      await db.payments.update(
        { mpesaTransactionId: Result.ConversationID },
        {
          status: 'failed',
          errorCode: Result.ResultCode,
          errorMessage: Result.ResultDesc
        }
      );
    }
    
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error);
    res.status(500).json({ ResultCode: 1, ResultDesc: 'Failed' });
  }
}
```

### Transaction Status Query

```javascript
async checkMpesaTransactionStatus(conversationId) {
  const accessToken = await this.getAccessToken();
  
  const payload = {
    Initiator: process.env.MPESA_INITIATOR_NAME,
    SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
    CommandID: 'TransactionStatusQuery',
    TransactionID: conversationId,
    PartyA: process.env.MPESA_SHORTCODE,
    IdentifierType: '4',
    ResultURL: process.env.MPESA_RESULT_URL,
    QueueTimeOutURL: process.env.MPESA_TIMEOUT_URL,
    Remarks: 'Status check',
    Occasion: 'Status'
  };
  
  const response = await axios.post(
    `${this.baseURL}/mpesa/transactionstatus/v1/query`,
    payload,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
}
```

---

## MTN Mobile Money Integration

### Setup

#### 1. Register on MoMo Developer Portal

1. Go to [momodeveloper.mtn.com](https://momodeveloper.mtn.com/)
2. Subscribe to Collections or Disbursements API
3. Generate API User and API Key

#### 2. Environment Variables

```bash
# .env
MTN_ENVIRONMENT=sandbox  # or production
MTN_SUBSCRIPTION_KEY=your_subscription_key
MTN_API_USER=your_api_user_id
MTN_API_KEY=your_api_key
MTN_CALLBACK_URL=https://api.wastefi.org/v1/callbacks/mtn
```

### Authentication

```javascript
class MTNMomoService {
  constructor() {
    this.subscriptionKey = process.env.MTN_SUBSCRIPTION_KEY;
    this.apiUser = process.env.MTN_API_USER;
    this.apiKey = process.env.MTN_API_KEY;
    this.environment = process.env.MTN_ENVIRONMENT;
    
    this.baseURL = this.environment === 'production'
      ? 'https://proxy.momoapi.mtn.com'
      : 'https://sandbox.momodeveloper.mtn.com';
  }
  
  async getAccessToken() {
    const auth = Buffer.from(`${this.apiUser}:${this.apiKey}`).toString('base64');
    
    try {
      const response = await axios.post(
        `${this.baseURL}/disbursement/token/`,
        {},
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey
          }
        }
      );
      
      return response.data.access_token;
    } catch (error) {
      console.error('Failed to get MTN MoMo access token:', error);
      throw error;
    }
  }
}
```

### Transfer (Disbursement)

```javascript
async sendMTNPayment(phoneNumber, amount, reference) {
  const accessToken = await this.getAccessToken();
  const transferId = require('uuid').v4();
  
  // Format phone number (country code + number without +)
  const formattedPhone = phoneNumber.replace(/^\+/, '');
  
  const payload = {
    amount: amount.toString(),
    currency: 'GHS', // or NGN, UGX depending on country
    externalId: reference,
    payee: {
      partyIdType: 'MSISDN',
      partyId: formattedPhone
    },
    payerMessage: 'Payment from WasteFi',
    payeeNote: `Transaction ${reference}`
  };
  
  try {
    await axios.post(
      `${this.baseURL}/disbursement/v1_0/transfer`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Reference-Id': transferId,
          'X-Target-Environment': this.environment,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Content-Type': 'application/json',
          'X-Callback-Url': process.env.MTN_CALLBACK_URL
        }
      }
    );
    
    return {
      success: true,
      transferId: transferId,
      status: 'pending'
    };
  } catch (error) {
    console.error('MTN MoMo transfer failed:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Transfer failed');
  }
}
```

### Check Transfer Status

```javascript
async checkMTNTransferStatus(transferId) {
  const accessToken = await this.getAccessToken();
  
  try {
    const response = await axios.get(
      `${this.baseURL}/disbursement/v1_0/transfer/${transferId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Target-Environment': this.environment,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey
        }
      }
    );
    
    return {
      status: response.data.status, // SUCCESSFUL, FAILED, PENDING
      amount: response.data.amount,
      currency: response.data.currency,
      financialTransactionId: response.data.financialTransactionId,
      externalId: response.data.externalId,
      reason: response.data.reason
    };
  } catch (error) {
    console.error('Failed to check MTN transfer status:', error);
    throw error;
  }
}
```

### Callback Handler

```javascript
async handleMTNCallback(req, res) {
  const { financialTransactionId, externalId, status, reason } = req.body;
  
  try {
    if (status === 'SUCCESSFUL') {
      await db.payments.update(
        { reference: externalId },
        {
          status: 'completed',
          providerReference: financialTransactionId,
          completedAt: new Date()
        }
      );
    } else {
      await db.payments.update(
        { reference: externalId },
        {
          status: 'failed',
          errorMessage: reason
        }
      );
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing MTN callback:', error);
    res.status(500).send('Error');
  }
}
```

---

## Airtel Money Integration

### Setup

```bash
# .env
AIRTEL_ENVIRONMENT=sandbox
AIRTEL_CLIENT_ID=your_client_id
AIRTEL_CLIENT_SECRET=your_client_secret
AIRTEL_CALLBACK_URL=https://api.wastefi.org/v1/callbacks/airtel
```

### Authentication

```javascript
class AirtelMoneyService {
  constructor() {
    this.clientId = process.env.AIRTEL_CLIENT_ID;
    this.clientSecret = process.env.AIRTEL_CLIENT_SECRET;
    this.environment = process.env.AIRTEL_ENVIRONMENT;
    
    this.baseURL = this.environment === 'production'
      ? 'https://openapiuat.airtel.africa'  // Update for production
      : 'https://openapiuat.airtel.africa';
  }
  
  async getAccessToken() {
    try {
      const response = await axios.post(
        `${this.baseURL}/auth/oauth2/token`,
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials'
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.access_token;
    } catch (error) {
      console.error('Failed to get Airtel Money access token:', error);
      throw error;
    }
  }
}
```

### Disbursement

```javascript
async sendAirtelPayment(phoneNumber, amount, reference) {
  const accessToken = await this.getAccessToken();
  
  // Format phone number
  const formattedPhone = phoneNumber.replace(/^\+/, '');
  const country = formattedPhone.startsWith('254') ? 'KE' : 
                  formattedPhone.startsWith('233') ? 'GH' : 'NG';
  
  const payload = {
    payee: {
      msisdn: formattedPhone
    },
    reference: reference,
    pin: process.env.AIRTEL_PIN,  // Encrypted PIN
    transaction: {
      amount: amount,
      id: reference,
      type: 'B2C'
    }
  };
  
  try {
    const response = await axios.post(
      `${this.baseURL}/standard/v1/disbursements/`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Country': country,
          'X-Currency': country === 'KE' ? 'KES' : country === 'GH' ? 'GHS' : 'NGN'
        }
      }
    );
    
    return {
      success: response.data.status.code === '200',
      transactionId: response.data.data.transaction.id,
      status: response.data.status.message
    };
  } catch (error) {
    console.error('Airtel Money payment failed:', error.response?.data);
    throw error;
  }
}
```

---

## Unified Payment Interface

Create abstraction layer for all providers:

```javascript
class MobileMoneyService {
  constructor(provider) {
    switch(provider.toLowerCase()) {
      case 'mpesa':
        this.service = new MpesaService();
        break;
      case 'mtn':
        this.service = new MTNMomoService();
        break;
      case 'airtel':
        this.service = new AirtelMoneyService();
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
  
  async sendPayment(phoneNumber, amount, reference) {
    return await this.service.sendPayment(phoneNumber, amount, reference);
  }
  
  async checkStatus(transactionId) {
    return await this.service.checkStatus(transactionId);
  }
}

// Usage
async function processPayment(userId, amount) {
  const user = await db.users.findById(userId);
  const provider = getProviderForPhone(user.phone);
  
  const mobileMoneyService = new MobileMoneyService(provider);
  
  const result = await mobileMoneyService.sendPayment(
    user.phone,
    amount,
    `WASTEFI-${Date.now()}`
  );
  
  return result;
}

// Determine provider based on phone number
function getProviderForPhone(phone) {
  if (phone.startsWith('+254')) return 'mpesa';  // Kenya
  if (phone.startsWith('+233')) return 'mtn';    // Ghana
  if (phone.startsWith('+234')) return 'mtn';    // Nigeria
  if (phone.startsWith('+256')) return 'mtn';    // Uganda
  if (phone.startsWith('+255')) return 'mpesa';  // Tanzania
  
  throw new Error('Unsupported country');
}
```

---

## Error Handling

```javascript
class MobileMoneyError extends Error {
  constructor(provider, code, message) {
    super(message);
    this.provider = provider;
    this.code = code;
    this.name = 'MobileMoneyError';
  }
}

async function sendPaymentWithErrorHandling(phone, amount, reference) {
  try {
    const provider = getProviderForPhone(phone);
    const service = new MobileMoneyService(provider);
    
    return await service.sendPayment(phone, amount, reference);
    
  } catch (error) {
    // Insufficient balance
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new MobileMoneyError(
        provider,
        'INSUFFICIENT_FUNDS',
        'Platform has insufficient balance for payout'
      );
    }
    
    // Invalid phone number
    if (error.code === 'INVALID_MSISDN') {
      throw new MobileMoneyError(
        provider,
        'INVALID_PHONE',
        'Phone number is invalid or not registered'
      );
    }
    
    // Daily limit exceeded
    if (error.code === 'LIMIT_EXCEEDED') {
      throw new MobileMoneyError(
        provider,
        'LIMIT_EXCEEDED',
        'Transaction limit exceeded. Try again tomorrow.'
      );
    }
    
    // Generic error
    throw new MobileMoneyError(
      provider,
      'PAYMENT_FAILED',
      error.message || 'Payment failed'
    );
  }
}
```

---

## Retry Logic

```javascript
async function sendPaymentWithRetry(phone, amount, reference, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await sendPayment(phone, amount, reference);
    } catch (error) {
      // Don't retry on user errors
      if (error.code === 'INVALID_PHONE' || error.code === 'LIMIT_EXCEEDED') {
        throw error;
      }
      
      // Last attempt
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log(`Retry attempt ${attempt + 1} for ${reference}`);
    }
  }
}
```

---

## Testing

### Mock Services for Development

```javascript
class MockMobileMoneyService {
  async sendPayment(phone, amount, reference) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate 90% success rate
    if (Math.random() > 0.1) {
      return {
        success: true,
        transactionId: `MOCK-${Date.now()}`,
        status: 'pending'
      };
    } else {
      throw new Error('Mock payment failed');
    }
  }
  
  async checkStatus(transactionId) {
    return {
      status: 'completed',
      transactionId: transactionId
    };
  }
}

// Use in development
const service = process.env.NODE_ENV === 'production'
  ? new MobileMoneyService(provider)
  : new MockMobileMoneyService();
```

---

## Monitoring

```javascript
// Track payment metrics
async function trackPaymentMetrics(provider, success, duration) {
  await metrics.increment(`mobile_money.${provider}.${success ? 'success' : 'failure'}`);
  await metrics.timing(`mobile_money.${provider}.duration`, duration);
}

// Alert on high failure rate
async function checkPaymentHealth() {
  const failures = await metrics.get('mobile_money.*.failure', '1h');
  const total = await metrics.get('mobile_money.*.*', '1h');
  
  const failureRate = failures / total;
  
  if (failureRate > 0.1) {  // 10% failure rate
    await alert('High mobile money failure rate', {
      rate: failureRate,
      failures: failures,
      total: total
    });
  }
}
```

---

## Best Practices

1. **Always validate phone numbers** before attempting payment
2. **Store provider reference IDs** for reconciliation
3. **Implement idempotency** to prevent duplicate payments
4. **Set up webhook endpoints** for async confirmation
5. **Monitor failure rates** per provider
6. **Keep credentials secure** (never log secrets)
7. **Test with sandbox** before production
8. **Handle timeouts gracefully** (mobile money can be slow)
9. **Provide clear error messages** to users
10. **Reconcile daily** with provider statements

---

## Resources

- [M-Pesa Daraja API Docs](https://developer.safaricom.co.ke/)
- [MTN MoMo API Docs](https://momodeveloper.mtn.com/)
- [Airtel Money API Docs](https://developers.airtel.africa/)

---

## Next Steps

- [Stellar Integration](/technical/stellar-integration) - Blockchain layer
- [API Documentation](/api/payments) - Payment endpoints
- [Testing Guide](/guide/testing) - Test mobile money integrations