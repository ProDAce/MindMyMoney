export type TransactionType = 'credit' | 'debit' | 'transfer';

export const TXN_TYPES = [
    { value: 'debit', label: 'Debit', icon: 'arrow-up-circle-outline' },
    { value: 'credit', label: 'Credit', icon: 'arrow-down-circle-outline' },
    { value: 'transfer', label: 'Transfer', icon: 'swap-horizontal-outline' },
] as const;