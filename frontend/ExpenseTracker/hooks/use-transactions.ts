import { useTransactionsContext, Transaction } from './use-transactions-context';

export { Transaction };

export function useTransactions() {
    return useTransactionsContext();
}
