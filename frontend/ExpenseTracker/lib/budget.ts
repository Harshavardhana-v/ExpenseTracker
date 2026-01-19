import { supabase } from './supabase';

export async function getBudget() {
    const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

export async function saveBudget(monthly_limit: number) {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('User not logged in');

    // Upsert → create or update
    const { error } = await supabase.from('budgets').upsert({
        user_id: user.id,
        monthly_limit,
    });

    if (error) throw error;
}

export async function getMonthlyExpenseTotal() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'expense')
        .gte('created_at', startOfMonth.toISOString());

    if (error) throw error;

    return (data || []).reduce(
        (sum, t) => sum + Number(t.amount),
        0
    );
}

export function getBudgetStatus(totalExpense: number, limit: number) {
    const percentage = (totalExpense / limit) * 100;

    if (percentage >= 100) {
        return { level: 'danger', message: '🚨 Budget exceeded!' };
    }
    if (percentage >= 90) {
        return { level: 'warning', message: '⚠️ 90% budget used' };
    }
    if (percentage >= 70) {
        return { level: 'info', message: 'ℹ️ 70% budget used' };
    }
    return { level: 'safe', message: '' };
}

