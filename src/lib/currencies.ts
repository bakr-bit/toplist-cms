export interface Currency {
  id: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: Currency[] = [
  { id: "EUR", name: "Euro", symbol: "€" },
  { id: "USD", name: "US Dollar", symbol: "$" },
  { id: "GBP", name: "British Pound", symbol: "£" },
  { id: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { id: "AUD", name: "Australian Dollar", symbol: "A$" },
  { id: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { id: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { id: "SEK", name: "Swedish Krona", symbol: "kr" },
  { id: "DKK", name: "Danish Krone", symbol: "kr" },
  { id: "CHF", name: "Swiss Franc", symbol: "Fr" },
  { id: "PLN", name: "Polish Zloty", symbol: "zł" },
  { id: "CZK", name: "Czech Koruna", symbol: "Kč" },
  { id: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { id: "RON", name: "Romanian Leu", symbol: "lei" },
  { id: "BRL", name: "Brazilian Real", symbol: "R$" },
  { id: "INR", name: "Indian Rupee", symbol: "₹" },
  { id: "JPY", name: "Japanese Yen", symbol: "¥" },
  { id: "ZAR", name: "South African Rand", symbol: "R" },
  { id: "TRY", name: "Turkish Lira", symbol: "₺" },
  { id: "RUB", name: "Russian Ruble", symbol: "₽" },
  { id: "BTC", name: "Bitcoin", symbol: "₿" },
  { id: "ETH", name: "Ethereum", symbol: "Ξ" },
  { id: "LTC", name: "Litecoin", symbol: "Ł" },
  { id: "USDT", name: "Tether", symbol: "₮" },
  { id: "DOGE", name: "Dogecoin", symbol: "Ð" },
];

export function getCurrencyName(id: string): string {
  const currency = CURRENCIES.find((c) => c.id === id);
  return currency ? `${currency.symbol} ${currency.name}` : id;
}
