// Base entity
export interface BaseEntity {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserProfile {
    name: string;
    email: string;
    avatarColor: string;
    bio?: string;
}

// ── Settings ──────────────────────────────────────────────────
export interface Settings extends BaseEntity {
    theme: 'dark' | 'light';
    themeStyle?: 'cozy-earth' | 'slate-neutral' | 'cyber-neon' | 'fresh-vitality';
    disableDynamicAccents?: boolean;
    currency: string;
    timezone: string;
    weekStartsOn: 0 | 1;
    notifications: {
        inventory: boolean;
        documents: boolean;
        bills: boolean;
        study: boolean;
        workout: boolean;
    };
    userProfile?: UserProfile;
    quickNotes?: string;
}

// ── Planning ──────────────────────────────────────────────────
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task extends BaseEntity {
    title: string;
    description?: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string;
    category?: string;
    goalId?: string;
    tags: string[];
}

export interface Event extends BaseEntity {
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    allDay: boolean;
    recurring?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    color?: string;
    category?: string;
}

export interface Goal extends BaseEntity {
    title: string;
    description?: string;
    targetDate?: string;
    progress: number; // 0-100
    category?: string;
    taskIds: string[];
}

// ── Finance ───────────────────────────────────────────────────
export type ExpenseCategory =
    | 'rent'
    | 'groceries'
    | 'transport'
    | 'utilities'
    | 'health'
    | 'entertainment'
    | 'education'
    | 'clothing'
    | 'dining'
    | 'insurance'
    | 'savings'
    | 'other';

export interface Expense extends BaseEntity {
    title: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    recurring?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    notes?: string;
}

export interface Income extends BaseEntity {
    title: string;
    amount: number;
    date: string;
    recurring?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    source?: string;
    notes?: string;
}

export interface Budget extends BaseEntity {
    category: ExpenseCategory;
    limit: number;
    month: string; // "YYYY-MM"
}

export interface SavingsGoal extends BaseEntity {
    title: string;
    targetAmount: number;
    currentAmount: number;
    targetDate?: string;
    description?: string;
}

// ── Food ──────────────────────────────────────────────────────
export interface InventoryItem extends BaseEntity {
    name: string;
    quantity: number;
    unit: string;
    minQuantity: number;
    store?: string;
    expiryDate?: string;
    category?: string;
}

export interface RecipeIngredient {
    inventoryItemId?: string;
    name: string;
    quantity: number;
    unit: string;
}

export interface Recipe extends BaseEntity {
    title: string;
    description?: string;
    ingredients: RecipeIngredient[];
    instructions: string[];
    prepTime: number; // minutes
    cookTime: number; // minutes
    servings: number;
    category?: string;
    nutrition?: {
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
    };
    imageUrl?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealPlanEntry extends BaseEntity {
    date: string; // "YYYY-MM-DD"
    mealType: MealType;
    recipeId?: string;
    recipeName?: string;
    customMeal?: string;
    cooked: boolean;
}

// ── Health ────────────────────────────────────────────────────
export interface WorkoutPlan extends BaseEntity {
    name: string;
    description?: string;
    daysPerWeek: number;
    exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
    name: string;
    sets?: number;
    reps?: number;
    duration?: number; // minutes
    weight?: number; // kg
    notes?: string;
}

export interface WorkoutLog extends BaseEntity {
    date: string;
    planId?: string;
    exercises: WorkoutExercise[];
    duration: number; // minutes
    notes?: string;
    caloriesBurned?: number;
}

export interface BodyMetric extends BaseEntity {
    date: string;
    weight?: number; // kg
    height?: number; // cm
    chest?: number;
    waist?: number;
    hips?: number;
    bodyFat?: number;
}

export interface WaterIntake extends BaseEntity {
    date: string;
    amount: number; // ml
}

export interface SleepLog extends BaseEntity {
    date: string;
    bedTime: string;
    wakeTime: string;
    duration: number; // hours
    quality: 1 | 2 | 3 | 4 | 5;
    notes?: string;
}

// ── Learning ──────────────────────────────────────────────────
export interface LearningTopic extends BaseEntity {
    name: string;
    description?: string;
    category: 'german' | 'programming' | 'course' | 'book' | 'other';
    color?: string;
    progress: number; // 0-100
    targetDate?: string;
}

export interface Lesson extends BaseEntity {
    topicId: string;
    title: string;
    content?: string;
    status: 'todo' | 'in_progress' | 'done' | 'revision';
    scheduledDate?: string;
    completedDate?: string;
    notes?: string;
    duration?: number; // minutes
}

export interface VocabularyItem extends BaseEntity {
    word: string;
    translation: string;
    example?: string;
    topicId?: string;
    language: string;
    mastered: boolean;
    reviewCount: number;
    nextReview?: string;
}

export interface StudySession extends BaseEntity {
    date: string;
    topicId?: string;
    duration: number; // minutes
    notes?: string;
}

// ── Career ────────────────────────────────────────────────────
export type ApplicationStatus =
    | 'saved'
    | 'applied'
    | 'interview'
    | 'offer'
    | 'rejected'
    | 'accepted';

export interface JobApplication extends BaseEntity {
    company: string;
    role: string;
    status: ApplicationStatus;
    appliedDate?: string;
    deadline?: string;
    notes?: string;
    url?: string;
    salary?: string;
    location?: string;
    remote: boolean;
}

export interface Project extends BaseEntity {
    title: string;
    description?: string;
    status: 'planning' | 'active' | 'completed' | 'paused';
    startDate?: string;
    endDate?: string;
    technologies: string[];
    url?: string;
    githubUrl?: string;
}

export interface Certificate extends BaseEntity {
    title: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    url?: string;
    category?: string;
}

export interface CareerSkill extends BaseEntity {
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    category?: string;
    yearsOfExperience?: number;
}

// ── Documents ─────────────────────────────────────────────────
export type DocumentType =
    | 'passport'
    | 'visa'
    | 'residence_permit'
    | 'insurance'
    | 'bank'
    | 'education'
    | 'certificate'
    | 'tax'
    | 'contract'
    | 'medical'
    | 'other';

export type DocumentStatus = 'valid' | 'expiring_soon' | 'expired' | 'pending';

export interface Document extends BaseEntity {
    title: string;
    type: DocumentType;
    issuer?: string;
    issueDate?: string;
    expiryDate?: string;
    documentNumber?: string;
    country?: string;
    notes?: string;
    fileUrl?: string;
    status: DocumentStatus;
}
