var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
var import_vite = require("vite");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "50mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new import_genai.GoogleGenAI({ apiKey });
}
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    aiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/scan-document", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", scanTypeHint, textContent } = req.body;
    if (!imageBase64 && !textContent) {
      return res.status(400).json({ error: "No document image or text provided" });
    }
    const ai = getGeminiClient();
    if (!ai) {
      console.warn("GEMINI_API_KEY is not configured in server environment.");
      return res.status(200).json({
        success: true,
        extracted: {
          type: scanTypeHint || "document",
          title: "Scanned Document",
          subtitle: "Uploaded User Document",
          category: "Document \u2022 General",
          fullName: "Cardholder / User",
          fullNumber: "DOC-" + Math.floor(1e5 + Math.random() * 9e5),
          issueDate: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          }),
          cost: null,
          currency: "$",
          billingCycle: null,
          notes: "Processed locally. Connect GEMINI_API_KEY for advanced neural AI extraction.",
          suggestedReminders: [
            { daysBefore: 90, label: "90 days before expiry" },
            { daysBefore: 30, label: "30 days before expiry" },
            { daysBefore: 7, label: "7 days before expiry" }
          ],
          iconName: "description"
        },
        notice: "GEMINI_API_KEY not set on server. Using basic document framework."
      });
    }
    const prompt = `You are LifeVault's AI Document & Receipt Scanner. Analyze the uploaded document, receipt, warranty card, subscription invoice, or identity card accurately.

Extract the following information in strict JSON format:
{
  "type": "document" | "subscription" | "warranty" | "bill" | "reminder",
  "title": "Clear specific title (e.g., 'United States Passport', 'AppleCare+ Macbook Pro', 'Adobe Creative Cloud', 'Electric Utility Bill')",
  "subtitle": "Short descriptive label (e.g. 'Class C Driver License', 'Annual Software Plan', '2-Year Extended Warranty')",
  "category": "e.g. 'Document \u2022 ID', 'Hardware Warranty', 'Subscription \u2022 Software', 'Bill \u2022 Utility', 'Vehicle \u2022 Registration'",
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
    const contents = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");
      contents.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: cleanBase64
        }
      });
    }
    if (textContent) {
      contents.push({ text: `Document raw text content:
${textContent}` });
    }
    contents.push({ text: prompt });
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
        responseMimeType: "application/json"
      }
    });
    const responseText = response.text || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsedData = JSON.parse(cleaned);
    }
    return res.status(200).json({
      success: true,
      extracted: parsedData
    });
  } catch (error) {
    console.error("Error during AI document scan:", error);
    return res.status(500).json({
      error: "Failed to process document with AI",
      message: error?.message || "Internal error"
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LifeVault Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
