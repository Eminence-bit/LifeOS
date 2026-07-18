import { pgTable, uuid, text, integer, numeric, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Profiles linked to auth.users
export const profiles = pgTable('profiles', {
    id: uuid('id').primaryKey().notNull(),
    name: text('name').notNull(),
    email: text('email').unique().notNull(),
    avatarColor: text('avatar_color').default('#7c3aed'),
    bio: text('bio'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Settings table
export const settings = pgTable('settings', {
    id: uuid('id').primaryKey().references(() => profiles.id, { onDelete: 'cascade' }),
    theme: text('theme').default('dark'),
    themeStyle: text('theme_style').default('cozy-earth'),
    disableDynamicAccents: boolean('disable_dynamic_accents').default(false),
    currency: text('currency').default('INR'),
    timezone: text('timezone').default('Asia/Kolkata'),
    weekStartsOn: integer('week_starts_on').default(1),
    notifications: jsonb('notifications').default('{"inventory":true,"documents":true,"bills":true,"study":true,"workout":true}'),
    quickNotes: text('quick_notes').default(''),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Tasks table
export const tasks = pgTable('tasks', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    priority: text('priority').default('medium').notNull(),
    status: text('status').default('todo').notNull(),
    dueDate: text('due_date'),
    category: text('category'),
    goalId: uuid('goal_id'),
    tags: text('tags').array().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Events table
export const events = pgTable('events', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    startDate: text('start_date').notNull(),
    endDate: text('end_date'),
    allDay: boolean('all_day').default(false),
    recurring: text('recurring'),
    color: text('color'),
    category: text('category'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Goals
export const goals = pgTable('goals', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    targetDate: text('target_date'),
    progress: integer('progress').default(0),
    category: text('category'),
    taskIds: uuid('task_ids').array().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Expenses
export const expenses = pgTable('expenses', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    category: text('category').notNull(),
    date: text('date').notNull(),
    recurring: text('recurring'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Incomes
export const incomes = pgTable('incomes', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    date: text('date').notNull(),
    recurring: text('recurring'),
    source: text('source'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Budgets
export const budgets = pgTable('budgets', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    category: text('category').notNull(),
    limitAmount: numeric('limit_amount', { precision: 12, scale: 2 }).notNull(),
    month: text('month').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// Savings Goals
export const savingsGoals = pgTable('savings_goals', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    targetAmount: numeric('target_amount', { precision: 12, scale: 2 }).notNull(),
    currentAmount: numeric('current_amount', { precision: 12, scale: 2 }).default('0'),
    targetDate: text('target_date'),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Inventory items
export const inventoryItems = pgTable('inventory_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    quantity: numeric('quantity', { precision: 10, scale: 2 }).notNull().default('0'),
    unit: text('unit').notNull(),
    minQuantity: numeric('min_quantity', { precision: 10, scale: 2 }).notNull().default('0'),
    store: text('store'),
    expiryDate: text('expiry_date'),
    category: text('category'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Shopping items
export const shoppingItems = pgTable('shopping_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    quantity: numeric('quantity', { precision: 10, scale: 2 }).notNull().default('1'),
    unit: text('unit').notNull(),
    bought: boolean('bought').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Recipes
export const recipes = pgTable('recipes', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    ingredients: jsonb('ingredients').default('[]'),
    instructions: text('instructions').array().default([]),
    prepTime: integer('prep_time').default(0),
    cookTime: integer('cook_time').default(0),
    servings: integer('servings').default(1),
    category: text('category'),
    nutrition: jsonb('nutrition').default('{"calories":0,"protein":0,"carbs":0,"fat":0}'),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Meal Plans
export const mealPlans = pgTable('meal_plans', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    date: text('date').notNull(),
    mealType: text('meal_type').notNull(),
    recipeId: uuid('recipe_id').references(() => recipes.id, { onDelete: 'set null' }),
    recipeName: text('recipe_name'),
    customMeal: text('custom_meal'),
    cooked: boolean('cooked').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Workout Logs
export const workoutLogs = pgTable('workout_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    date: text('date').notNull(),
    exercises: jsonb('exercises').default('[]'),
    duration: integer('duration').default(0),
    notes: text('notes'),
    caloriesBurned: integer('calories_burned').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Body Metrics
export const bodyMetrics = pgTable('body_metrics', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    date: text('date').notNull(),
    weight: numeric('weight', { precision: 5, scale: 2 }),
    height: numeric('height', { precision: 5, scale: 2 }),
    chest: numeric('chest', { precision: 5, scale: 2 }),
    waist: numeric('waist', { precision: 5, scale: 2 }),
    hips: numeric('hips', { precision: 5, scale: 2 }),
    bodyFat: numeric('body_fat', { precision: 5, scale: 2 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Water Intake
export const waterIntakes = pgTable('water_intakes', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    date: text('date').notNull(),
    amount: integer('amount').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Sleep Logs
export const sleepLogs = pgTable('sleep_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    date: text('date').notNull(),
    bedTime: text('bed_time').notNull(),
    wakeTime: text('wake_time').notNull(),
    duration: numeric('duration', { precision: 4, scale: 2 }).notNull(),
    quality: integer('quality').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Learning Topics
export const learningTopics = pgTable('learning_topics', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    category: text('category').default('other').notNull(),
    color: text('color'),
    progress: integer('progress').default(0),
    targetDate: text('target_date'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Study Sessions
export const studySessions = pgTable('study_sessions', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    date: text('date').notNull(),
    topicId: uuid('topic_id').references(() => learningTopics.id, { onDelete: 'set null' }),
    duration: integer('duration').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Vocabulary Items
export const vocabularyItems = pgTable('vocabulary_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    word: text('word').notNull(),
    translation: text('translation').notNull(),
    example: text('example'),
    topicId: uuid('topic_id').references(() => learningTopics.id, { onDelete: 'set null' }),
    language: text('language').default('de').notNull(),
    mastered: boolean('mastered').default(false),
    reviewCount: integer('review_count').default(0),
    nextReview: text('next_review'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Job Applications
export const jobApplications = pgTable('job_applications', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    company: text('company').notNull(),
    role: text('role').notNull(),
    status: text('status').default('saved').notNull(),
    appliedDate: text('applied_date'),
    deadline: text('deadline'),
    notes: text('notes'),
    url: text('url'),
    salary: text('salary'),
    location: text('location'),
    remote: boolean('remote').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Projects
export const projects = pgTable('projects', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').default('planning').notNull(),
    startDate: text('start_date'),
    endDate: text('end_date'),
    technologies: text('technologies').array().default([]),
    url: text('url'),
    githubUrl: text('github_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Certificates
export const certificates = pgTable('certificates', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    issuer: text('issuer').notNull(),
    issueDate: text('issue_date').notNull(),
    expiryDate: text('expiry_date'),
    credentialId: text('credential_id'),
    url: text('url'),
    category: text('category'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Career Skills
export const careerSkills = pgTable('career_skills', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    level: text('level').notNull(),
    category: text('category'),
    yearsOfExperience: numeric('years_of_experience', { precision: 4, scale: 2 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Documents
export const documents = pgTable('documents', {
    id: uuid('id').defaultRandom().primaryKey(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    type: text('type').notNull(),
    issuer: text('issuer'),
    issueDate: text('issue_date'),
    expiryDate: text('expiry_date'),
    documentNumber: text('document_number'),
    country: text('country'),
    notes: text('notes'),
    fileUrl: text('file_url'),
    status: text('status').default('valid').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});
