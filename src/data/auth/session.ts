export type SessionUser = {
  name: string;
  email: string;
  role: string;
};

let currentUser: SessionUser | null = null;
const subscribers = new Set<() => void>();

function notify(): void {
  subscribers.forEach((callback) => callback());
}

export function subscribeToSession(callback: () => void): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

export function getSessionSnapshot(): SessionUser | null {
  return currentUser;
}

export function setSession(user: SessionUser | null): void {
  currentUser = user;
  notify();
}
