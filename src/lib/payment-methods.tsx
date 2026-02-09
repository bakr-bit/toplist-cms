import { ReactNode } from "react";

export interface PaymentMethod {
  id: string;
  name: string;
  icon: ReactNode;
}

function SvgIcon({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="h-5 w-auto" />;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "visa",
    name: "Visa",
    icon: <SvgIcon src="/payment-icons/visa.svg" alt="Visa" />,
  },
  {
    id: "mastercard",
    name: "Mastercard",
    icon: <SvgIcon src="/payment-icons/mastercard.svg" alt="Mastercard" />,
  },
  {
    id: "amex",
    name: "Amex",
    icon: <SvgIcon src="/payment-icons/amex.svg" alt="Amex" />,
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: <SvgIcon src="/payment-icons/paypal.svg" alt="PayPal" />,
  },
  {
    id: "skrill",
    name: "Skrill",
    icon: <SvgIcon src="/payment-icons/skrill.svg" alt="Skrill" />,
  },
  {
    id: "neteller",
    name: "Neteller",
    icon: <SvgIcon src="/payment-icons/neteller.svg" alt="Neteller" />,
  },
  {
    id: "paysafecard",
    name: "Paysafecard",
    icon: <SvgIcon src="/payment-icons/paysafecard.svg" alt="Paysafecard" />,
  },
  {
    id: "bank-transfer",
    name: "Bank Transfer",
    icon: <SvgIcon src="/payment-icons/bank-transfer.svg" alt="Bank Transfer" />,
  },
  {
    id: "sofort",
    name: "Sofort",
    icon: <SvgIcon src="/payment-icons/sofort.svg" alt="Sofort" />,
  },
  {
    id: "mifinity",
    name: "MiFinity",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#6C2EB9">
        <circle cx="12" cy="12" r="10" />
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">M</text>
      </svg>
    ),
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    icon: <SvgIcon src="/payment-icons/bitcoin.svg" alt="Bitcoin" />,
  },
  {
    id: "ethereum",
    name: "Ethereum",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path d="M12 1.5l-8 10.3 8 4.7 8-4.7z" fill="#627EEA" />
        <path d="M4 11.8l8 10.7 8-10.7-8 4.7z" fill="#627EEA" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: "crypto",
    name: "Crypto",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="#F7931A" />
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">&#x20BF;</text>
      </svg>
    ),
  },
  {
    id: "revolut",
    name: "Revolut",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <rect x="1" y="1" width="22" height="22" rx="6" fill="#0075EB" />
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">R</text>
      </svg>
    ),
  },
  {
    id: "apple-pay",
    name: "Apple Pay",
    icon: <SvgIcon src="/payment-icons/apple-pay.svg" alt="Apple Pay" />,
  },
  {
    id: "google-pay",
    name: "Google Pay",
    icon: <SvgIcon src="/payment-icons/google-pay.svg" alt="Google Pay" />,
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
