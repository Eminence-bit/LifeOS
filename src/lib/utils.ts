// Utility to generate unique IDs
export const generateId = (): string =>
    Math.random().toString(36).substring(2) + Date.now().toString(36);

// Utility to get current ISO timestamp
export const now = (): string => new Date().toISOString();

// Create a new base entity
export const createBaseEntity = () => ({
    id: generateId(),
    createdAt: now(),
    updatedAt: now(),
});

// Format currency
export const formatCurrency = (amount: number, currency = 'EUR'): string =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(amount);

// Format date
export const formatDate = (dateStr: string): string =>
    new Date(dateStr).toLocaleDateString('en-DE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

// Get days until a date
export const daysUntil = (dateStr: string): number => {
    const target = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// Check if date is in the past
export const isPast = (dateStr: string): boolean => daysUntil(dateStr) < 0;

// Get today's date string
export const todayStr = (): string => new Date().toISOString().split('T')[0];

// Get current month string "YYYY-MM"
export const currentMonth = (): string => new Date().toISOString().substring(0, 7);

// Clamp a number between min and max
export const clamp = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max);

// cn class merger (like shadcn)
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
