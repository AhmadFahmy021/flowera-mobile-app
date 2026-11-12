import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type SavedAccount = {
  id: string;
  name: string;
  role: string;
  email: string;
  pass: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  badgeColor: string;
};

export const DEFAULT_ACCOUNTS: SavedAccount[] = [
  {
    id: 'acc-1',
    name: 'Pelanggan Setia',
    role: 'Customer',
    email: 'pelanggan@flowera.com',
    pass: 'bunga123',
    icon: 'person',
    badgeColor: '#F8EBEC',
  },
  {
    id: 'acc-2',
    name: 'Mitra Florist',
    role: 'Florist',
    email: 'florist@flowera.com',
    pass: 'florist123',
    icon: 'storefront',
    badgeColor: '#F3EAD2',
  },
  {
    id: 'acc-3',
    name: 'Admin Sistem',
    role: 'Admin',
    email: 'admin@flowera.com',
    pass: 'admin123',
    icon: 'admin-panel-settings',
    badgeColor: '#E8EAF6',
  },
];

let savedAccounts: SavedAccount[] = [...DEFAULT_ACCOUNTS];
let accountCounter = DEFAULT_ACCOUNTS.length;
const subscribers = new Set<() => void>();

function notify(): void {
  subscribers.forEach((callback) => callback());
}

export function subscribeToAccounts(callback: () => void): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

export function getAccountsSnapshot(): SavedAccount[] {
  return savedAccounts;
}

const BADGE_COLORS = ['#F8EBEC', '#F3EAD2', '#E7F0E3', '#E8EAF6'];
const CUSTOMER_ICON: SavedAccount['icon'] = 'person';

export function addAccount(input: {
  name: string;
  email: string;
  pass: string;
}): SavedAccount | null {
  const email = input.email.trim().toLowerCase();
  const exists = savedAccounts.some((account) => account.email.toLowerCase() === email);
  if (exists) return null;

  accountCounter += 1;
  const account: SavedAccount = {
    id: `acc-${accountCounter}`,
    name: input.name.trim(),
    role: 'Customer',
    email,
    pass: input.pass,
    icon: CUSTOMER_ICON,
    badgeColor: BADGE_COLORS[accountCounter % BADGE_COLORS.length],
  };

  savedAccounts = [...savedAccounts, account];
  notify();
  return account;
}
