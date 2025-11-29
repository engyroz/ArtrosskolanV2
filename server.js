import express from 'express';
import Stripe from 'stripe';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Initialize Firebase Admin
let db;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Handle both stringified JSON (env var) and potential object issues
    let serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (typeof serviceAccount === 'string') {
      try {
        serviceAccount = JSON.parse(serviceAccount);
      } catch (e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON. Ensure it is a valid minified JSON string.");
      }
    }
    
    initializeApp({
      credential: cert(serviceAccount)
    });
    db = getFirestore();
    console.log("Firebase Admin initialized successfully.");
  } else {
    console.warn("Warning: FIREBASE_SERVICE_ACCOUNT not found. Database updates will fail.");
  }
} catch (error) {
  console.error("Error initializing Firebase Admin:", error);
}

app.use(cors());

// --- WEBHOOK ---
// Must be defined before express.json()
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;
    
    console.log(`Webhook: Payment successful for user: ${userId}`);

    if (db && userId) {
      try {
        // Use set with merge: true to be safer than update
        await db.collection('users').doc(userId).set({ subscriptionStatus: 'active' }, { merge: true });
        console.log(`Webhook: Subscription activated for user: ${userId}`);
      } catch (dbError) {
        console.error(`Webhook: Failed to update database for user ${userId}:`, dbError);
      }
    } else {
      console.error("Webhook: Database instance not ready or UserId missing.");
    }
  }

  res.json({ received: true });
});

// --- JSON API ---
app.use(express.json());

// Create Session
app.post('/api/create-checkout-session', async (req, res) => {
  const { priceId, userId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: userId,
      // Pass session_id in success_url so we can verify it on the client side
      success_url: `${req.headers.origin}/#/payment?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/#/payment`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Create Session Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Verify Subscription (Fallback/Immediate Check)
app.post('/api/verify-subscription', async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Missing sessionId' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const userId = session.client_reference_id;
      
      if (db && userId) {
        await db.collection('users').doc(userId).set({ subscriptionStatus: 'active' }, { merge: true });
        console.log(`Verification: Subscription manually verified and activated for ${userId}`);
        return res.json({ status: 'active', message: 'Subscription activated' });
      } else {
        console.error("Verification: DB not ready or missing userId");
        return res.status(500).json({ error: 'Database error' });
      }
    } else {
      return res.json({ status: 'pending', message: 'Payment not yet confirmed' });
    }
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Serve Frontend
app.use(express.static(path.join(__dirname, 'client', 'dist'))); 

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});