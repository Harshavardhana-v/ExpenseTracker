import { StyleSheet, View, Text, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTransactions } from '@/hooks/use-transactions';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const { transactions, getSummary } = useTransactions();
    const summary = getSummary();

    const categoryData = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense');
        const totals: Record<string, { amount: number, color: string, icon: string }> = {};

        expenses.forEach(t => {
            if (!totals[t.category]) {
                totals[t.category] = { amount: 0, color: t.color, icon: t.icon };
            }
            totals[t.category].amount += t.amount;
        });

        return Object.entries(totals)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.amount - a.amount);
    }, [transactions]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Math.abs(amount));
    };

    const budget = 2500; // Mock budget
    const budgetProgress = Math.min((summary.expense / budget) * 100, 100);

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.header, { borderBottomColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <ThemedText type="title" style={styles.headerTitle}>Analytics</ThemedText>
                    <View style={styles.headerAccent} />
                </View>

                {/* Budget Overview */}
                <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1D3D47' : '#FFFFFF' }]}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.cardLabel}>Monthly Budget</Text>
                            <Text style={[styles.budgetAmount, { color: colorScheme === 'dark' ? '#fff' : '#1D3D47' }]}>{formatCurrency(budget)}</Text>
                        </View>
                        <View style={[styles.budgetBadge, { backgroundColor: budgetProgress > 90 ? '#FFEBEE' : '#E3F2FD' }]}>
                            <Text style={[styles.budgetBadgeText, { color: budgetProgress > 90 ? '#F44336' : '#2196F3' }]}>
                                {Math.round(100 - budgetProgress)}% left
                            </Text>
                        </View>
                    </View>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressBarBg}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    { width: `${budgetProgress}%`, backgroundColor: budgetProgress > 90 ? '#F44336' : '#2196F3' }
                                ]}
                            />
                        </View>
                        <View style={styles.progressLabels}>
                            <Text style={[styles.progressText, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>{formatCurrency(summary.expense)} spent</Text>
                            <Text style={[styles.progressText, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>{Math.round(budgetProgress)}%</Text>
                        </View>
                    </View>
                </View>

                {/* Spending Breakdown */}
                <ThemedText type="subtitle" style={styles.sectionTitle}>Spending by Category</ThemedText>

                {categoryData.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="pie-chart-outline" size={60} color="#ccc" />
                        <ThemedText style={styles.emptyText}>No data to analyze yet</ThemedText>
                    </View>
                ) : (
                    categoryData.map((item) => (
                        <View key={item.name} style={styles.categoryRow}>
                            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                                <Ionicons name={item.icon as any} size={20} color={item.color} />
                            </View>
                            <View style={styles.categoryInfo}>
                                <View style={styles.categoryHeader}>
                                    <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                                    <ThemedText type="defaultSemiBold">{formatCurrency(item.amount)}</ThemedText>
                                </View>
                                <View style={styles.categoryBarBg}>
                                    <View
                                        style={[
                                            styles.categoryBarFill,
                                            {
                                                width: `${(item.amount / summary.expense) * 100}%`,
                                                backgroundColor: item.color
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.categoryPercentage}>
                                    {Math.round((item.amount / summary.expense) * 100)}% of total expenses
                                </Text>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 80,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 30,
        paddingBottom: 15,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 32,
    },
    headerAccent: {
        width: 40,
        height: 4,
        backgroundColor: '#A1CEDC',
        borderRadius: 2,
        marginTop: 8,
    },
    card: {
        padding: 24,
        borderRadius: 28,
        marginBottom: 35,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    cardLabel: {
        fontSize: 14,
        color: '#888',
        fontWeight: '600',
        marginBottom: 4,
    },
    budgetAmount: {
        fontSize: 26,
        fontWeight: '800',
    },
    budgetBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    budgetBadgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    progressContainer: {
        marginTop: 5,
    },
    progressBarBg: {
        height: 14,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 7,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 7,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    progressText: {
        fontSize: 13,
        fontWeight: '600',
    },
    sectionTitle: {
        marginBottom: 20,
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 15,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryInfo: {
        flex: 1,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    categoryBarBg: {
        height: 6,
        backgroundColor: '#f0f0f0',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 4,
    },
    categoryBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    categoryPercentage: {
        fontSize: 11,
        color: '#888',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        opacity: 0.5,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
    },
});
