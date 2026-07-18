import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { JobApplication, Project, Certificate, CareerSkill } from '@/types';
import { createBaseEntity, now } from '@/lib/utils';

interface CareerState {
    applications: JobApplication[];
    projects: Project[];
    certificates: Certificate[];
    skills: CareerSkill[];
    addApplication: (a: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateApplication: (id: string, updates: Partial<JobApplication>) => void;
    deleteApplication: (id: string) => void;
    addProject: (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateProject: (id: string, updates: Partial<Project>) => void;
    deleteProject: (id: string) => void;
    addCertificate: (c: Omit<Certificate, 'id' | 'createdAt' | 'updatedAt'>) => void;
    deleteCertificate: (id: string) => void;
    addSkill: (s: Omit<CareerSkill, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateSkill: (id: string, updates: Partial<CareerSkill>) => void;
    deleteSkill: (id: string) => void;
}

export const useCareerStore = create<CareerState>()(
    persist(
        (set) => ({
            applications: [],
            projects: [],
            certificates: [],
            skills: [],
            addApplication: (a) =>
                set((s) => ({ applications: [...s.applications, { ...createBaseEntity(), ...a }] })),
            updateApplication: (id, updates) =>
                set((s) => ({
                    applications: s.applications.map((a) =>
                        a.id === id ? { ...a, ...updates, updatedAt: now() } : a
                    ),
                })),
            deleteApplication: (id) =>
                set((s) => ({ applications: s.applications.filter((a) => a.id !== id) })),
            addProject: (p) =>
                set((s) => ({ projects: [...s.projects, { ...createBaseEntity(), ...p }] })),
            updateProject: (id, updates) =>
                set((s) => ({
                    projects: s.projects.map((p) =>
                        p.id === id ? { ...p, ...updates, updatedAt: now() } : p
                    ),
                })),
            deleteProject: (id) =>
                set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
            addCertificate: (c) =>
                set((s) => ({ certificates: [...s.certificates, { ...createBaseEntity(), ...c }] })),
            deleteCertificate: (id) =>
                set((s) => ({ certificates: s.certificates.filter((c) => c.id !== id) })),
            addSkill: (sk) =>
                set((s) => ({ skills: [...s.skills, { ...createBaseEntity(), ...sk }] })),
            updateSkill: (id, updates) =>
                set((s) => ({
                    skills: s.skills.map((sk) =>
                        sk.id === id ? { ...sk, ...updates, updatedAt: now() } : sk
                    ),
                })),
            deleteSkill: (id) =>
                set((s) => ({ skills: s.skills.filter((sk) => sk.id !== id) })),
        }),
        { name: 'lifeos-career' }
    )
);
