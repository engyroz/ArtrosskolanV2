import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHistory, useLocation } from 'react-router-dom';
import { CreditCard, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';

const Payment = () => {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const isSuccess = searchParams.get('success') === 'true';
  const sessionId = searchParams.get('session_id');

  // Logic to verify payment immediately when returning from Stripe
  useEffect(() => {
    const verifyPayment = async () => {
      if (isSuccess && sessionId && user) {
        try {
          // 1. Force the server to check Stripe and update DB
          const response = await fetch('/api/verify-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'active') {
              // 2. Refresh local profile to get the new 'active' status
              await refreshProfile();
              // 3. Navigate will happen automatically via ProtectedRoute, 
              // but we can also force it here to be safe
              history.push('/dashboard');
            }
          }
        } catch (error) {
          console.error("Verification check failed:", error);
        }
      }
    };

    if (isSuccess && sessionId) {
      verifyPayment();
    }
  }, [isSuccess, sessionId, user, refreshProfile, history]);

  const handleSubscribe = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const env = (import.meta as any).env;
      const priceId = env.VITE_STRIPE_PRICE_ID;

      if (!priceId) {
        alert("Stripe Price ID is missing in environment variables (VITE_STRIPE_PRICE_ID).");
        setLoading(false);
        return;
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId, 
          userId: user.uid,
        }),
      });

      const { url } = await response.json();
      
      if (url) {
         window.location.href = url;
      } else {
         console.warn("No URL returned from backend.");
         alert("Could not connect to payment server.");
      }

    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert("Failed to initiate payment. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-slate-200">
          <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Activating Subscription</h2>
          <p className="text-slate-600 mb-6">
            We are confirming your payment with Stripe...
          </p>
          <div className="text-sm text-slate-400">
            Please wait, this will only take a moment.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Start your recovery journey
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Join thousands of others managing their osteoarthritis effectively.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col md:flex-row">
          <div className="p-8 md:p-12 md:w-2/3">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Premium Membership</h3>
            <div className="flex items-baseline mb-8">
              <span className="text-5xl font-extrabold text-slate-900">$29</span>
              <span className="text-xl text-slate-500 ml-2">/month</span>
            </div>
            
            <ul className="space-y-4 mb-8">
              {[
                'Unlimited access to all exercise levels',
                'Personalized daily routine generator',
                'Progress tracking and analytics',
                'Priority support from physiotherapists',
                'Cancel anytime'
              ].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Subscribe Now
                </>
              )}
            </button>
            <p className="mt-4 text-xs text-slate-500 text-center">
              Secure payment via Stripe. 100% money-back guarantee for 30 days.
            </p>
          </div>

          <div className="bg-slate-50 p-8 md:p-12 md:w-1/3 border-t md:border-t-0 md:border-l border-slate-200 flex flex-col justify-center">
             <div className="text-center">
               <ShieldCheck className="h-12 w-12 text-blue-600 mx-auto mb-4" />
               <h4 className="text-lg font-semibold text-slate-900 mb-2">Secure & Trusted</h4>
               <p className="text-sm text-slate-600">
                 Your health data is encrypted and protected. We strictly follow GDPR compliance.
               </p>
             </div>
             <div className="mt-8 pt-8 border-t border-slate-200">
                <blockquote className="italic text-slate-600 text-sm">
                  "This program changed my life. I can walk without pain for the first time in years."
                </blockquote>
                <div className="mt-2 font-medium text-slate-900 text-sm">- Sarah J.</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;