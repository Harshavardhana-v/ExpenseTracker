import { supabase } from './supabase';

export async function fetchTransactions() {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function addTransaction(transaction: any) {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('User not logged in');

    const { error } = await supabase.from('transactions').insert([
        {
            ...transaction,
            user_id: user.id,
        },
    ]);

    if (error) throw error;
}

export async function deleteTransaction(id: string) {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
