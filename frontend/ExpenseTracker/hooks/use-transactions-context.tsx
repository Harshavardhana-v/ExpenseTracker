import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';


export interface Transaction {
    id: string;
    title: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    icon: string;
    color: string;
    date: string;
}

interface TransactionContextType {
    transactions: Transaction[];
    loading: boolean;
    saveTransaction: (newTx: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    getSummary: () => { balance: number; income: number; expense: number };
}


const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (supabase) {
            loadTransactions();
        }
    }, []);

    const loadTransactions = async () => {
        if (!supabase) return;
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.warn('Supabase fetch error:', error.message);
                return;
            }

            setTransactions(
                (data || []).map((t: any) => ({
                    id: t.id,
                    title: t.title,
                    amount: Number(t.amount || 0),
                    type: t.type,
                    category: t.category,
                    icon: t.icon,
                    color: t.color,
                    date: t.created_at,
                }))
            );
        } catch (e) {
            console.error('Failed to load transactions', e);
        } finally {
            setLoading(false);
        }
    };


    const saveTransaction = async (newTx: Omit<Transaction, 'id' | 'date'>) => {
        if (!supabase) return;
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) throw new Error('User not authenticated');

            const { error } = await supabase.from('transactions').insert([
                {
                    ...newTx,
                    user_id: user.id,
                },
            ]);

            if (error) throw error;

            await loadTransactions();
        } catch (e) {
            console.error('Failed to save transaction', e);
        }
    };


    const deleteTransaction = async (id: string) => {
        if (!supabase) return;
        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setTransactions((prev: Transaction[]) => prev.filter((t: Transaction) => t.id !== id));
        } catch (e) {
            console.error('Failed to delete transaction', e);
        }
    };


    const getSummary = () => {
        const income = transactions
            .filter((t: Transaction) => t.type === 'income')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        const expense = transactions
            .filter((t: Transaction) => t.type === 'expense')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

        return {
            balance: income - expense,
            income,
            expense
        };
    };

    return (
        <TransactionContext.Provider value={{
            transactions,
            loading,
            saveTransaction,
            deleteTransaction,
            getSummary
        }}>
            {children}
        </TransactionContext.Provider>
    );
}

export function useTransactionsContext() {
    const context = useContext(TransactionContext);
    if (context === undefined) {
        throw new Error('useTransactionsContext must be used within a TransactionProvider');
    }
    return context;
}
