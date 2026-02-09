export interface GameType {
  id: string;
  name: string;
  emoji: string;
}

export const GAME_TYPES: GameType[] = [
  { id: "slots", name: "Slots", emoji: "🎰" },
  { id: "live-casino", name: "Live Casino", emoji: "🎥" },
  { id: "poker", name: "Poker", emoji: "🃏" },
  { id: "blackjack", name: "Blackjack", emoji: "🂡" },
  { id: "roulette", name: "Roulette", emoji: "🎡" },
  { id: "baccarat", name: "Baccarat", emoji: "💎" },
  { id: "bingo", name: "Bingo", emoji: "🔢" },
  { id: "scratch-cards", name: "Scratch Cards", emoji: "🎟️" },
  { id: "sports-betting", name: "Sports Betting", emoji: "⚽" },
  { id: "virtual-sports", name: "Virtual Sports", emoji: "🏇" },
  { id: "crash-games", name: "Crash Games", emoji: "📈" },
  { id: "jackpot", name: "Jackpot", emoji: "💰" },
  { id: "video-poker", name: "Video Poker", emoji: "🎴" },
  { id: "table-games", name: "Table Games", emoji: "🎲" },
  { id: "game-shows", name: "Game Shows", emoji: "📺" },
];

export function getGameTypeName(id: string): string {
  const type = GAME_TYPES.find((t) => t.id === id);
  return type ? `${type.emoji} ${type.name}` : id;
}
