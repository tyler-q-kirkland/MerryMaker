# 🤖 OpenRouter Setup Guide for MerryMaker

OpenRouter provides access to multiple AI models (including GPT-4, Claude, Llama, and more) through a single API. It's often more cost-effective than using OpenAI directly.

## Why Use OpenRouter?

✅ **Access to Multiple Models** - GPT-4, Claude, Llama, Mistral, and more  
✅ **Cost-Effective** - Often cheaper than OpenAI direct pricing  
✅ **Flexible** - Switch between models easily  
✅ **Simple Integration** - Compatible with OpenAI SDK  

## Step-by-Step Setup

### 1. Create an OpenRouter Account

1. Go to: **https://openrouter.ai/**
2. Click **"Sign Up"** or **"Get Started"**
3. Sign up with your email or GitHub account
4. Verify your email if required

### 2. Get Your API Key

1. Once logged in, go to: **https://openrouter.ai/keys**
2. Click **"Create Key"**
3. Give it a name (e.g., "MerryMaker")
4. Click **"Create"**
5. **Copy the API key** - it starts with `sk-or-v1-...`
6. ⚠️ **Save it somewhere safe** - you won't be able to see it again!

### 3. Add Credits (Optional)

OpenRouter uses a credit system:

1. Go to: **https://openrouter.ai/credits**
2. Click **"Add Credits"**
3. Add $5-$10 to start (you can add more later)
4. Most models cost $0.001-$0.01 per request

**Note**: Some free models are available without credits!

### 4. Configure MerryMaker

Update your `backend/.env` file:

```env
# OpenRouter Configuration
OPENAI_API_KEY=sk-or-v1-your-openrouter-key-here
OPENAI_BASE_URL=https://openrouter.ai/api/v1
```

**Important**: 
- Use your OpenRouter API key (starts with `sk-or-v1-`)
- Set `OPENAI_BASE_URL` to `https://openrouter.ai/api/v1`

### 5. Choose Your Model (Optional)

By default, MerryMaker uses `gpt-4`. You can change this in `backend/src/services/aiService.ts`:

**Popular Options:**

```typescript
// GPT-4 (OpenAI) - High quality, more expensive
model: 'openai/gpt-4'

// GPT-3.5 Turbo (OpenAI) - Fast and cheap
model: 'openai/gpt-3.5-turbo'

// Claude 3 Opus (Anthropic) - Very high quality
model: 'anthropic/claude-3-opus'

// Claude 3 Sonnet (Anthropic) - Balanced
model: 'anthropic/claude-3-sonnet'

// Llama 3 70B (Meta) - Free!
model: 'meta-llama/llama-3-70b-instruct'

// Mistral Large - Good quality, affordable
model: 'mistralai/mistral-large'
```

To change the model, edit `backend/src/services/aiService.ts`:

```typescript
const completion = await openai.chat.completions.create({
  model: 'openai/gpt-3.5-turbo', // Change this line
  messages: [
    // ... rest of the code
  ],
});
```

### 6. Restart Your Backend

After updating the `.env` file:

```bash
# Stop the backend (Ctrl+C)
cd MerryMaker/backend
npm run dev
```

## Testing Your Setup

### 1. Check Backend Logs

When you start the backend, you should see:
```
Server is running on port 3001
```

No errors about OpenAI/OpenRouter means it's configured correctly!

### 2. Send a Test Card

1. Log in as CEO
2. Upload your picture
3. Select a user who has uploaded their picture and word
4. Write a test message
5. Click "Send Christmas Card"

If it works, the AI will generate a festive message!

## Pricing Examples (as of 2024)

| Model | Cost per 1K tokens | Quality | Speed |
|-------|-------------------|---------|-------|
| GPT-4 | ~$0.03 | ⭐⭐⭐⭐⭐ | Medium |
| GPT-3.5 Turbo | ~$0.002 | ⭐⭐⭐⭐ | Fast |
| Claude 3 Opus | ~$0.015 | ⭐⭐⭐⭐⭐ | Medium |
| Claude 3 Sonnet | ~$0.003 | ⭐⭐⭐⭐ | Fast |
| Llama 3 70B | FREE | ⭐⭐⭐ | Fast |

**For MerryMaker**: Each Christmas card message costs approximately:
- GPT-4: $0.001-$0.003 per card
- GPT-3.5: $0.0001-$0.0003 per card
- Llama 3: FREE

## Switching Back to OpenAI

If you want to use OpenAI directly instead:

1. Get an OpenAI API key from: https://platform.openai.com/api-keys
2. Update `backend/.env`:
   ```env
   OPENAI_API_KEY=sk-your-openai-key-here
   # Remove or comment out the OPENAI_BASE_URL line:
   # OPENAI_BASE_URL=https://openrouter.ai/api/v1
   ```
3. Restart the backend

## Troubleshooting

### Error: "Invalid API key"

**Solution**:
- Verify your API key starts with `sk-or-v1-`
- Make sure you copied the entire key
- Check there are no extra spaces in the `.env` file
- Restart the backend after changing `.env`

### Error: "Insufficient credits"

**Solution**:
- Go to https://openrouter.ai/credits
- Add more credits
- Or switch to a free model like `meta-llama/llama-3-70b-instruct`

### Error: "Model not found"

**Solution**:
- Check the model name is correct
- See available models at: https://openrouter.ai/models
- Make sure to include the provider prefix (e.g., `openai/gpt-4`)

### Messages are low quality

**Solution**:
- Try a higher-quality model like `openai/gpt-4` or `anthropic/claude-3-opus`
- Check your prompt in `aiService.ts` is clear
- Ensure the user's "word" is being passed correctly

## Monitoring Usage

1. Go to: **https://openrouter.ai/activity**
2. See all your API requests
3. Monitor costs and usage
4. Set spending limits if needed

## Advanced: Custom Models

You can use any model available on OpenRouter:

1. Browse models: https://openrouter.ai/models
2. Copy the model ID (e.g., `google/gemini-pro`)
3. Update `aiService.ts` with the new model ID
4. Test and adjust as needed

## Security Best Practices

✅ **DO:**
- Keep your API key secret
- Use environment variables
- Monitor your usage regularly
- Set spending limits

❌ **DON'T:**
- Commit API keys to Git
- Share your API key publicly
- Use the same key for multiple projects
- Leave unused keys active

---

🤖 You're all set with OpenRouter! Enjoy access to multiple AI models! 🎄
