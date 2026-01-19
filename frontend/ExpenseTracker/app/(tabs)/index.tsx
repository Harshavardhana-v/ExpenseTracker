import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Link, useRouter } from 'expo-router';
import { useTransactions } from '../../hooks/use-transactions';
import { useNotifications } from '../../hooks/use-notifications';
import { useAuth } from '../../hooks/use-auth';
import { supabase } from '../../lib/supabase';
import { getBudget, getBudgetStatus } from '../../lib/budget';
import { AnimationSequence } from '../../components/animation-sequence';




export default function HomeScreen() {

  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { transactions, loading, getSummary, saveTransaction } = useTransactions();
  const { unreadCount } = useNotifications();
  const { user, signOut } = useAuth();
  const [quickIncome, setQuickIncome] = useState('');
  const [budget, setBudget] = useState<any>(null);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [alert, setAlert] = useState<any>(null);

  const summary = getSummary();

  useEffect(() => {
    async function fetchBudget() {
      const budgetData = await getBudget();
      if (budgetData) {
        setBudget(budgetData);
      }
    }
    fetchBudget();
  }, []);

  useEffect(() => {
    if (budget) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const total = transactions
        .filter(t => t.type === 'expense' && new Date(t.date) >= startOfMonth)
        .reduce((sum, t) => sum + t.amount, 0);

      setMonthlyExpense(total);
      setAlert(getBudgetStatus(total, budget.monthly_limit));
    }
  }, [transactions, budget]);

  const handleQuickAdd = async () => {
    if (!quickIncome || isNaN(parseFloat(quickIncome))) return;
    await saveTransaction({
      title: 'Income',
      amount: parseFloat(quickIncome),
      type: 'income',
      category: 'Salary',
      icon: 'cash-outline',
      color: '#4CAF50',
    });
    setQuickIncome('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#A1CEDC" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Hello,</Text>
            <ThemedText type="title">{user?.name || 'User'}</ThemedText>
          </View>
          <View style={styles.headerBtns}>
            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
              {unreadCount > 0 && <View style={styles.badge} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.notificationBtn, { marginLeft: 10 }]}
              onPress={signOut}
            >
              <Ionicons name="log-out-outline" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* 3D Animation Section */}
        <View style={styles.animationSection}>
          <AnimationSequence fps={30} style={styles.mainAnimation} />
        </View>

        {/* Balance Card */}

        <View style={[styles.balanceCard, { backgroundColor: colorScheme === 'dark' ? '#1D3D47' : '#1D3D47' }]}>
          <View style={styles.cardAccent} />
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>{summary.balance < 0 ? '-' : ''}{formatCurrency(summary.balance)}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>Tracking {transactions.length} Transactions</Text>
          </View>
        </View>
        {alert?.message && (
          <View style={{
            padding: 12,
            borderRadius: 10,
            backgroundColor:
              alert.level === 'danger'
                ? '#F44336'
                : alert.level === 'warning'
                  ? '#FF9800'
                  : '#2196F3',
            marginBottom: 15,
          }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              {alert.message}
            </Text>
          </View>
        )}


        {/* Summary Section */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryItem, { backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF' }]}>
            <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="arrow-up" size={20} color="#4CAF50" />
            </View>
            <View>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>{formatCurrency(summary.income)}</Text>
            </View>
          </View>

          <View style={[styles.summaryItem, { backgroundColor: colorScheme === 'dark' ? '#1E1E1E' : '#FFFFFF' }]}>
            <View style={[styles.iconContainer, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="arrow-down" size={20} color="#F44336" />
            </View>
            <View>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={[styles.summaryValue, { color: '#F44336' }]}>{formatCurrency(summary.expense)}</Text>
            </View>
          </View>
        </View>

        {/* Quick Add Income */}
        <View style={[styles.quickAddCard, { backgroundColor: colorScheme === 'dark' ? '#1D3D47' : '#FFFFFF' }]}>
          <ThemedText style={styles.quickAddTitle}>Add Income Quickly</ThemedText>
          <View style={styles.quickAddRow}>
            <View style={styles.quickInputContainer}>
              <Text style={styles.quickCurrency}>$</Text>
              <TextInput
                style={[styles.quickInput, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}
                placeholder="0.00"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={quickIncome}
                onChangeText={setQuickIncome}
              />
            </View>
            <TouchableOpacity
              style={styles.quickAddBtn}
              onPress={handleQuickAdd}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <ThemedView style={styles.sectionHeader}>
          <ThemedText type="subtitle">Recent Transactions</ThemedText>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </ThemedView>

        {transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={60} color="#ccc" />
            <ThemedText style={styles.emptyText}>No transactions yet</ThemedText>
          </View>
        ) : (
          transactions.slice(0, 10).map((item) => (
            <ThemedView key={item.id} style={styles.transactionItem}>
              <View style={[styles.transactionIcon, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <View style={styles.transactionInfo}>
                <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                <ThemedText style={styles.transactionCategory}>{item.category}</ThemedText>
              </View>
              <ThemedText type="defaultSemiBold" style={{ color: item.type === 'income' ? '#4CAF50' : '#F44336' }}>
                {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
              </ThemedText>
            </ThemedView>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <Link href="/modal" asChild>
        <TouchableOpacity style={[styles.fab, { backgroundColor: colorScheme === 'dark' ? '#A1CEDC' : '#1D3D47' }]}>
          <Ionicons name="add" size={30} color={colorScheme === 'dark' ? '#000' : '#fff'} />
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  animationSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    height: 180,
    backgroundColor: 'transparent',
  },
  mainAnimation: {
    width: '100%',
    height: '100%',
  },
  header: {

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  headerBtns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  notificationBtn: {
    padding: 8,
    borderRadius: 12,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F44336',
    borderWidth: 2,
    borderColor: '#fff',
  },
  balanceCard: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  cardAccent: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
  },
  cardFooter: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  cardFooterText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.6,
  },
  quickAddCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  quickAddTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 15,
    opacity: 0.6,
  },
  quickAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  quickInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 54,
  },
  quickCurrency: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 5,
    color: '#888',
  },
  quickInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
  },
  quickAddBtn: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 25,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  seeAllText: {
    color: '#A1CEDC',
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    opacity: 0.5,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
