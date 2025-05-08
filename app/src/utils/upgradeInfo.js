export const UPGRADE_FEATURES = [
  'Unlimited AI Coaching',
  'Advanced Analytics',
  'Double Points',
  'Priority Support',
  'Early Access to New Features'
];

export const UPGRADE_PRICES = {
  monthly: 100, // INR
  yearly: 799  // INR
};

export const UPGRADE_MESSAGE_LIMIT = 5;

export function getUserName() {
  // Try localStorage, fallback to API if needed
  const storedName = localStorage.getItem('habitharmony_user_name');
  if (storedName) return storedName;
  // Optionally, fetch from API (sync version for now)
  return 'User';
}

export function getRemainingMessages() {
  // For free users, track messages left in localStorage
  const premium = localStorage.getItem('habitharmony_premium') === 'true';
  if (premium) return Infinity;
  const used = parseInt(localStorage.getItem('habitharmony_messages_used') || '0', 10);
  return Math.max(UPGRADE_MESSAGE_LIMIT - used, 0);
}

export function markMessageUsed() {
  const used = parseInt(localStorage.getItem('habitharmony_messages_used') || '0', 10);
  localStorage.setItem('habitharmony_messages_used', (used + 1).toString());
}

export function resetMessageCount() {
  localStorage.setItem('habitharmony_messages_used', '0');
}

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpay({ plan, onSuccess, onFailure }) {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    alert('Razorpay SDK not loaded.');
    if (onFailure) onFailure();
    return;
  }
  const amount = plan === 'yearly' ? UPGRADE_PRICES.yearly * 100 : UPGRADE_PRICES.monthly * 100;
  const options = {
    key: 'rzp_test_1DP5mmOlF5G5ag',
    amount,
    currency: 'INR',
    name: 'Habit Harmony',
    description: plan === 'monthly' ? 'Monthly Premium' : 'Yearly Premium',
    image: '',
    handler: function (response) {
      localStorage.setItem('habitharmony_premium', 'true');
      if (onSuccess) onSuccess(response);
    },
    prefill: {
      name: getUserName(),
      email: localStorage.getItem('habitharmony_user_email') || '',
    },
    theme: {
      color: '#F75836',
    },
    modal: {
      ondismiss: () => {
        if (onFailure) onFailure();
      }
    }
  };
  const rzp = new window.Razorpay(options);
  rzp.open();
} 