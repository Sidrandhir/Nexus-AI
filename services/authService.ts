import { User } from "../types";
import { trackUserSignup } from "./analyticsService";

const USERS_KEY = 'nexus_users_db';
const SESSION_KEY = 'nexus_session_v1';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const login = async (email: string, password: string): Promise<User> => {
  await delay(800);

  // In a real app, verify against backend. 
  // Here we check our local mock DB.
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const user = users.find((u: any) => u.email === email && u.password === password);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Create session
  const sessionUser: User = {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    isAdmin: user.isAdmin
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  return sessionUser;
};

export const signup = async (email: string, password: string, name?: string): Promise<User> => {
  await delay(1000);

  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  if (users.find((u: any) => u.email === email)) {
    throw new Error("Email already registered");
  }

  const isAdmin = email.includes("admin"); // Demo logic: allow any email with 'admin' to be an admin

  const newUser = {
    id: 'user_' + Math.random().toString(36).substring(2, 9),
    email,
    password, // In real app, never store plain text passwords!
    name: name || email.split('@')[0],
    createdAt: Date.now(),
    isAdmin: isAdmin
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  trackUserSignup(); // Track signup analytics

  const sessionUser: User = {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    createdAt: newUser.createdAt,
    isAdmin: newUser.isAdmin
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  return sessionUser;
};

export const logout = async (): Promise<void> => {
  await delay(200);
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
};