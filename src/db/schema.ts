import { sql } from "drizzle-orm";
import { AnySQLiteColumn, blob, check, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Accounts represents the place where money is stored.
export const accounts = sqliteTable("accounts", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    currency: text("currency").notNull().default("INR"),
    openingBalance: real("opening_balance").notNull().default(0),
    currentBalance: real("current_balance").notNull().default(0),
    accountTypeId: text("account_type_id").notNull().references(() => accountTypes.id),
    isTracked: integer("is_tracked", { mode: "boolean" }).notNull().default(true),
    createdOn: integer("created_on", { mode: "timestamp" }).notNull(),
    notes: text("notes"),
})

export const accountTypes = sqliteTable("account_types", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    accountGroup: text("account_group", { enum: ["Assets", "Liabilities"] }).notNull(),
})

export const transactions = sqliteTable("transactions", {
    id: text("id").primaryKey(),
    type: text("type", { enum: ["credit", "debit", "transfer"] }).notNull(),
    amount: real("amount").notNull().default(0),
    txnDate: text("txn_date").notNull(),
    accountId: text("account_id").notNull().references(() => accounts.id),
    toAccountId: text("to_account_id").references(() => accounts.id),
    categoryId: text("category_id").references(() => categories.id), // If no category is selected in "other" category will be selected by default.
    subCategoryId: text("sub_category_id").references(() => subCategories.id),
    notes: text("notes"),
    parentTransactionId: text("parent_transaction_id").references((): AnySQLiteColumn => transactions.id), // This must have something if isSplit is true.
    isSplit: integer("is_split", { mode: "boolean" }).notNull().default(false),
    excludedFromBudget: integer("excluded_from_budget", { mode: "boolean" }).notNull().default(false),
}, (table) => [
    check(
        "transfer_requires_to_account",
        sql`(${table.type} = 'transfer' AND ${table.toAccountId} IS NOT NULL AND ${table.toAccountId} <> ${table.accountId})
            OR (${table.type} IN ('credit', 'debit') AND ${table.toAccountId} IS NULL)`
    ),
    check(
        "parent_transaction_id_requires_is_split",
        sql`(${table.isSplit} = 1 AND ${table.parentTransactionId} IS NOT NULL) 
        OR (${table.isSplit} = 0 AND ${table.parentTransactionId} IS NULL)`
    ),
])

export const categories = sqliteTable("categories", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    type: text("type", { enum: ["credit", "debit"] }).notNull(),
    colorBg: text("color_bg").notNull(),
    colorIcon: text("color_icon").notNull(),
    icon: blob("icon", { mode: "buffer" }).notNull(),
    excludedFromBudget: integer("excluded_from_budget", { mode: "boolean" }).notNull().default(false),
})

export const subCategories = sqliteTable("sub_categories", {
    id: text("id").primaryKey(),
    categoryId: text("category_id").notNull().references(() => categories.id),
    colorBg: text("color_bg").notNull(),
    colorIcon: text("color_icon").notNull(),
    icon: blob("icon", { mode: "buffer" }).notNull(),
    excludedFromBudget: integer("excluded_from_budget", { mode: "boolean" }).notNull().default(false),
})

export const budgets = sqliteTable("budgets", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    amount: real("amount").notNull(),
    periodType: text("period_type", { enum: ["weekly", "monthly", "yearly", "custom"] }).notNull(),
    repeat: integer("repeat", { mode: "boolean" }).notNull(),
    startOfWeekDay: text("start_week_day", { enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] }), // null   -- only for weekly
    startOfMonthDay: integer("start_month_day"), // null        -- 1–31, only for monthly
    startOfYearMonth: integer("start_year_month"), // null       -- 1–12, only for yearly
    startOfYearDay: integer("start_year_day"), // null         -- 1–31, only for yearly
    customIntervalDays: integer("custom_interval_days"), // null     -- only for custom
    periodStart: integer("period_start", { mode: "timestamp" }).notNull(),
    periodEnd: integer("period_end", { mode: "timestamp" }).notNull(),
}, (table) => [
    // If periodType == "weekly" then startOfWeekDay shouldn't be null ELSE startOfWeekDay is null.
    check(
        "start_week_day_requires_period_type",
        sql`(${table.periodType} = 'weekly' AND ${table.startOfWeekDay} IS NOT NULL)
        OR (${table.periodType} <> 'weekly' AND ${table.startOfWeekDay} IS NULL)`
    ),
    // If periodType == "monthly" then startOfMonthDay shouldn't be null ELSE startOfMonthDay is null.
    check(
        "start_month_day_requires_period_type",
        sql`(${table.periodType} = 'monthly' AND ${table.startOfMonthDay} IS NOT NULL AND ${table.startOfMonthDay} BETWEEN 1 AND 31)
        OR (${table.periodType} <> 'monthly' AND ${table.startOfMonthDay} IS NULL)`
    ),
    // If periodType == "yearly" then startOfYearMonth and startOfYearDay shouldn't be null ELSE startOfYearMonth and startOfYearDay is null.
    check(
        "start_year_month_requires_period_type",
        sql`(${table.periodType} = 'yearly' 
        AND (${table.startOfYearMonth} IS NOT NULL AND ${table.startOfYearMonth} BETWEEN 1 AND 12)
        AND (${table.startOfYearDay} IS NOT NULL AND ${table.startOfYearDay} BETWEEN 1 AND 31))
        OR (${table.periodType} <> 'yearly' AND ${table.startOfYearMonth} IS NULL AND ${table.startOfYearDay} IS NULL)`
    ),
    // If periodType == "custom" then customIntervalDays shouldn't be null ELSE customIntervalDays is null.
    check(
        "custom_interval_days_requires_period_type",
        sql`(${table.periodType} = 'custom' AND ${table.customIntervalDays} IS NOT NULL)
        OR (${table.periodType} <> 'custom' AND ${table.customIntervalDays} IS NULL)`
    ),
])

export const budgetCategories = sqliteTable("budget_categories", {
    id: text("id").primaryKey(),
    budgetId: text("budget_id").notNull().references(() => budgets.id),
    categoryId: text("category_id").notNull().references(() => categories.id),
    allocatedAmount: real("allocated_amount").notNull(),
});