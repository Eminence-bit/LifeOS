import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Document, DocumentStatus } from '@/types';
import { createBaseEntity, now, daysUntil } from '@/lib/utils';

const deriveStatus = (doc: { expiryDate?: string }): DocumentStatus => {
    if (!doc.expiryDate) return 'valid';
    const days = daysUntil(doc.expiryDate);
    if (days < 0) return 'expired';
    if (days <= 30) return 'expiring_soon';
    return 'valid';
};

interface DocumentsState {
    documents: Document[];
    addDocument: (d: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
    updateDocument: (id: string, updates: Partial<Omit<Document, 'status'>>) => void;
    deleteDocument: (id: string) => void;
    refreshStatuses: () => void;
}

export const useDocumentsStore = create<DocumentsState>()(
    persist(
        (set) => ({
            documents: [],
            addDocument: (d) =>
                set((s) => ({
                    documents: [
                        ...s.documents,
                        { ...createBaseEntity(), ...d, status: deriveStatus(d) },
                    ],
                })),
            updateDocument: (id, updates) =>
                set((s) => ({
                    documents: s.documents.map((doc) => {
                        if (doc.id !== id) return doc;
                        const updated = { ...doc, ...updates, updatedAt: now() };
                        return { ...updated, status: deriveStatus(updated) };
                    }),
                })),
            deleteDocument: (id) =>
                set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),
            refreshStatuses: () =>
                set((s) => ({
                    documents: s.documents.map((d) => ({
                        ...d,
                        status: deriveStatus(d),
                    })),
                })),
        }),
        { name: 'lifeos-documents' }
    )
);
