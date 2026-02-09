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
    icon: <SvgIcon src="/payment-icons/mifinity.svg" alt="MiFinity" />,
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    icon: <SvgIcon src="/payment-icons/bitcoin.svg" alt="Bitcoin" />,
  },
  {
    id: "ethereum",
    name: "Ethereum",
    icon: <SvgIcon src="/payment-icons/ethereum.svg" alt="Ethereum" />,
  },
  {
    id: "crypto",
    name: "Crypto",
    icon: <SvgIcon src="/payment-icons/crypto.svg" alt="Crypto" />,
  },
  {
    id: "revolut",
    name: "Revolut",
    icon: <SvgIcon src="/payment-icons/revolut.svg" alt="Revolut" />,
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
