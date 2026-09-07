import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable CORS for mobile app webviews (Capacitor/Cordova) and cross-origin clients
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// High body limit to support camera captures and PDF/image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy initialize Gemini AI client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Health & configuration check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'LifeVault',
    aiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// AI Document Extraction Endpoint
app.post('/api/scan-document', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', scanTypeHint, textContent } = req.body;

    if (!imageBase64 && !textContent) {
      return res.status(400).json({
        success: false,
        error: 'No document image or text provided',
      });
    }

    const ai = getGeminiClient();

    if (!ai) {
      console.warn('GEMINI_API_KEY is not configured in server environment.');
      return res.status(503).json({
        success: false,
        error: 'AI scanning is currently unavailable. Please try again.',
        code: 'AI_UNAVAILABLE',
      });
    }

    // Prepare prompt for Gemini 3.7 Flash
    const prompt = `You are LifeVault's AI Document & Receipt Scanner. Analyze the uploaded document, receipt, warranty card, subscription invoice, or identity card accurately.

Extract the following information in strict JSON format:
{
  "type": "document" | "subscription" | "warranty" | "bill" | "reminder",
  "title": "Clear specific title (e.g., 'United States Passport', 'AppleCare+ Macbook Pro', 'Adobe Creative Cloud', 'Electric Utility Bill')",
  "subtitle": "Short descriptive label (e.g. 'Class C Driver License', 'Annual Software Plan', '2-Year Extended Warranty')",
  "category": "e.g. 'Document • ID', 'Hardware Warranty', 'Subscription • Software', 'Bill • Utility', 'Vehicle • Registration'",
  "fullName": "Name of the person/cardholder if present, else empty string",
  "fullNumber": "Document/License/Passport/Policy/Serial/Invoice number if present, else empty string",
  "brand": "Brand or organization name (e.g., Apple, Adobe, State DMV, Sony) or empty string",
  "model": "Device or product model if warranty/hardware, else empty string",
  "serialNumber": "Serial number if hardware/device, else empty string",
  "issueDate": "Date issued / purchased formatted as 'D Month YYYY' or 'Month D, YYYY' if detected, else empty string",
  "expiryDate": "Expiration, validity end date, or next renewal date formatted as 'D Month YYYY' or 'Month D, YYYY' if detected, else empty string",
  "cost": 59.99 (number if price/subscription cost is detected, else null),
  "currency": "$ or USD or EUR or BDT etc.",
  "billingCycle": "Monthly" | "Yearly" | "Weekly" | "Quarterly" | null,
  "warrantyDuration": "e.g. '1 Year', '2 Years', 'Lifetime' if warranty, else empty string",
  "notes": "Key details, terms, coverage summary, renewal conditions, or notes extracted from the document",
  "suggestedReminders": [
    { "daysBefore": 180, "label": "180 days before expiry" },
    { "daysBefore": 90, "label": "90 days before expiry" },
    { "daysBefore": 30, "label": "30 days before expiry" },
    { "daysBefore": 7, "label": "7 days before expiry" },
    { "daysBefore": 1, "label": "1 day before expiry" }
  ],
  "iconName": "one of: flight_takeoff, directions_car, badge, verified_user, subscriptions, receipt_long, laptop_mac, smartphone, credit_card, home, description"
}

Important Instructions:
- Provide ONLY valid JSON.
- If it's a receipt with warranty, set type to "warranty" or "bill".
- If it's a recurring service/app invoice, set type to "subscription".
- If it's an ID, passport, driver license, or legal certificate, set type to "document".
- Infer realistic expiration or renewal dates if explicitly visible on document.`;

    const contents: any[] = [];

    if (imageBase64) {
      // Clean base64 string if data URL prefix exists
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    if (textContent) {
      contents.push({ text: `Document raw text content:\n${textContent}` });
    }

    contents.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Clean up markdown markers if present
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.status(200).json({
      success: true,
      extracted: parsedData,
    });
  } catch (error: any) {
    console.error('Error during AI document scan:', error);
    return res.status(500).json({
      success: false,
      error: 'AI scanning is currently unavailable. Please try again.',
      details: error?.message || 'Processing failed',
    });
  }
});

// App server & Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LifeVault Server running on http://localhost:${PORT}`);
  });
}

startServer();
