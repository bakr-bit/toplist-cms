import { ReactNode } from "react";

export interface PaymentMethod {
  id: string;
  name: string;
  icon: ReactNode;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "visa",
    name: "Visa",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
        <path d="M22 8H2" stroke="white" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    id: "mastercard",
    name: "Mastercard",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
        <path d="M22 8H2" stroke="white" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    id: "amex",
    name: "Amex",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
        <path d="M22 8H2" stroke="white" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8.32 21.97a.546.546 0 0 1-.26-.32c-.03-.15-.06-.3-.08-.45l-.42-2.65h2.66c1.67 0 2.73-.37 3.39-1.17.53-.64.79-1.49.79-2.53 0-1.06-.26-1.86-.8-2.4-.53-.54-1.37-.81-2.52-.81h-1.61L9 16.36l-.3 1.88-.23 1.47h-.98l.53-3.35.47-2.95h3.16c1.53 0 2.62.37 3.28 1.1.66.74.99 1.8.99 3.19 0 1.38-.36 2.48-1.09 3.29-.72.81-1.74 1.22-3.05 1.22H8.32v-.02z"/>
      </svg>
    ),
  },
  {
    id: "skrill",
    name: "Skrill",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 18v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1"/>
        <path d="M3 10h18M7 15h10"/>
      </svg>
    ),
  },
  {
    id: "neteller",
    name: "Neteller",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
  },
  {
    id: "paysafecard",
    name: "Paysafecard",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <path d="M2 10h20" stroke="white" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: "bank-transfer",
    name: "Bank Transfer",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
      </svg>
    ),
  },
  {
    id: "sofort",
    name: "Sofort",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
      </svg>
    ),
  },
  {
    id: "mifinity",
    name: "MiFinity",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 6v6l4 2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/>
        <path d="M13.5 8h-2V6.5h-1V8h-.5v1h.5v6h-.5v1h.5v1.5h1V16h2c1.1 0 2-.9 2-2v-1c0-.6-.3-1.1-.7-1.5.4-.4.7-.9.7-1.5v-1c0-1.1-.9-2-2-2zm0 5c0 .6-.4 1-1 1h-1v-2h1c.6 0 1 .4 1 1v0zm0-3c0 .6-.4 1-1 1h-1V9h1c.6 0 1 .4 1 1v0z"/>
      </svg>
    ),
  },
  {
    id: "ethereum",
    name: "Ethereum",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L4 12l8 4.5L20 12z"/>
        <path d="M4 12l8 10 8-10-8 4.5z" opacity="0.6"/>
      </svg>
    ),
  },
  {
    id: "crypto",
    name: "Crypto",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="8" cy="12" r="2" fill="#FF6B6B"/>
        <circle cx="16" cy="8" r="2" fill="#4ECDC4"/>
        <circle cx="16" cy="16" r="2" fill="#FFE66D"/>
      </svg>
    ),
  },
  {
    id: "revolut",
    name: "Revolut",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
        <path d="M22 8H2" stroke="white" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    id: "apple-pay",
    name: "Apple Pay",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 7.21a5.1 5.1 0 0 0-4.58 2.69c-.83-.42-1.77-.65-2.76-.65-3.31 0-6 2.69-6 6s2.69 6 6 6c.99 0 1.93-.23 2.76-.65a5.1 5.1 0 0 0 4.58 2.69c2.82 0 5.1-2.28 5.1-5.1 0-2.14-1.32-3.98-3.19-4.74.29-.61.45-1.3.45-2.02 0-2.82-2.28-5.1-5.1-5.1-.72 0-1.41.16-2.02.45z"/>
      </svg>
    ),
  },
  {
    id: "google-pay",
    name: "Google Pay",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    ),
  },
];

export function getPaymentMethodIcon(id: string): ReactNode {
  const method = PAYMENT_METHODS.find((m) => m.id === id);
  return method?.icon || <span className="text-xs">💳</span>;
}

export function getPaymentMethodName(id: string): string {
  const method = PAYMENT_METHODS.find((m) => m.id === id);
  return method?.name || id;
}
