import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { JobApplication, Project, Certificate, CareerSkill } from '@/types';
import { createBaseEntity, now } from '@/lib/utils';
import { syncEngine } from '@/lib/syncEngine';

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
        (set, get) => ({
            applications: [],
            projects: [],
            certificates: [],
            skills: [],

            addApplication: (a) => {
                const entity = { ...createBaseEntity(), ...a };
                set((s) => ({ applications: [...s.applications, entity] }));
                syncEngine.pushJobApplication(entity);
            },
            updateApplication: (id, updates) => {
                set((s) => ({
                    applications: s.applications.map((a) =>
                        a.id === id ? { ...a, ...updates, updatedAt: now() } : a
                    ),
                }));
                const updated = get().applications.find((a) => a.id === id);
                if (updated) syncEngine.pushJobApplication(updated);
            },
            deleteApplication: (id) => {
                set((s) => ({ applications: s.applications.filter((a) => a.id !== id) }));
                syncEngine.deleteJobApplication(id);
            },

            addProject: (p) => {
                const entity = { ...createBaseEntity(), ...p };
                set((s) => ({ projects: [...s.projects, entity] }));
                syncEngine.pushProject(entity);
            },
            updateProject: (id, updates) => {
                set((s) => ({
                    projects: s.projects.map((p) =>
                        p.id === id ? { ...p, ...updates, updatedAt: now() } : p
                    ),
                }));
                const updated = get().projects.find((p) => p.id === id);
                if (updated) syncEngine.pushProject(updated);
            },
            deleteProject: (id) => {
                set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
                syncEngine.deleteProject(id);
            },

            addCertificate: (c) => {
                const entity = { ...createBaseEntity(), ...c };
                set((s) => ({ certificates: [...s.certificates, entity] }));
                syncEngine.pushCertificate(entity);
            },
            deleteCertificate: (id) => {
                set((s) => ({ certificates: s.certificates.filter((c) => c.id !== id) }));
                syncEngine.deleteCertificate(id);
            },

            addSkill: (sk) => {
                const entity = { ...createBaseEntity(), ...sk };
                set((s) => ({ skills: [...s.skills, entity] }));
                syncEngine.pushCareerSkill(entity);
            },
            updateSkill: (id, updates) => {
                set((s) => ({
                    skills: s.skills.map((sk) =>
                        sk.id === id ? { ...sk, ...updates, updatedAt: now() } : sk
                    ),
                }));
                const updated = get().skills.find((sk) => sk.id === id);
                if (updated) syncEngine.pushCareerSkill(updated);
            },
            deleteSkill: (id) => {
                set((s) => ({ skills: s.skills.filter((sk) => sk.id !== id) }));
                syncEngine.deleteCareerSkill(id);
            },
        }),
        { name: 'lifeos-career' }
    )
);
