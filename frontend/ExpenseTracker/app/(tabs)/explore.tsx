import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { useState, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { useTransactions, Transaction } from '../../hooks/use-transactions';
import { Link } from 'expo-router';
import { CATEGORIES } from '../../constants/categories';

export default function HistoryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const { transactions, deleteTransaction } = useTransactions();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [dateRange, setDateRange] = useState<'all' | '7days' | '30days'>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx: Transaction) => {
      if (tx.type === 'income') return false;

      // Title Search
      const matchesSearch = tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Category Filter
      const matchesCategory = !filterCategory || tx.category === filterCategory;

      // Amount Filter
      const amount = tx.amount;
      const min = minAmount ? parseFloat(minAmount) : 0;
      const max = maxAmount ? parseFloat(maxAmount) : Infinity;
      const matchesAmount = amount >= min && amount <= max;

      // Date Filter
      let matchesDate = true;
      if (dateRange !== 'all') {
        const txDate = new Date(tx.date);
        const cutoff = new Date();
        const days = dateRange === '7days' ? 7 : 30;
        cutoff.setDate(cutoff.getDate() - days);
        cutoff.setHours(0, 0, 0, 0); // Start of day X days ago
        matchesDate = txDate >= cutoff;
      }

      return matchesSearch && matchesCategory && matchesAmount && matchesDate;
    });
  }, [transactions, searchQuery, filterCategory, minAmount, maxAmount, dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(id) },
      ]
    );
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <ThemedView style={styles.transactionItem}>
      <View style={[styles.transactionIcon, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon as any} size={22} color={item.color} />
      </View>
      <View style={styles.transactionInfo}>
        <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
        <Text style={styles.dateText}>{formatDate(item.date)} • {item.category}</Text>
      </View>
      <View style={styles.rightContent}>
        <ThemedText type="defaultSemiBold" style={{ color: item.type === 'income' ? '#4CAF50' : '#F44336' }}>
          {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
        </ThemedText>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color="#F44336" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );

  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <ThemedText type="title">Expense History</ThemedText>
          <Link href="/modal" asChild>
            <TouchableOpacity style={styles.headerAddBtn}>
              <Ionicons name="add" size={24} color="#1D3D47" />
              <Text style={styles.headerAddText}>Add</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ThemedView>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colorScheme === 'dark' ? '#1D3D47' : '#f5f5f5' }]}>
          <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            placeholder="Search transactions..."
            placeholderTextColor="#888"
            style={[styles.searchInput, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterToggleBtn, showFilters && styles.filterToggleBtnActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options-outline" size={20} color={showFilters ? '#fff' : '#888'} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <ThemedView style={styles.filterSection}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterChip, !filterCategory && styles.filterChipActive]}
                onPress={() => setFilterCategory(null)}
              >
                <Text style={[styles.filterText, !filterCategory && styles.filterTextActive]}>All</Text>
              </TouchableOpacity>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.label}
                  style={[styles.filterChip, filterCategory === cat.label && styles.filterChipActive]}
                  onPress={() => setFilterCategory(cat.label)}
                >
                  <Text style={[styles.filterText, filterCategory === cat.label && styles.filterTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterRow}>
            <View style={[styles.filterGroup, { flex: 1, marginRight: 15 }]}>
              <Text style={styles.filterLabel}>Date Range</Text>
              <View style={styles.dateSelector}>
                <TouchableOpacity
                  style={[styles.dateBtn, dateRange === 'all' && styles.dateBtnActive]}
                  onPress={() => setDateRange('all')}
                >
                  <Text style={[styles.dateBtnText, dateRange === 'all' && styles.dateBtnActiveText]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dateBtn, dateRange === '7days' && styles.dateBtnActive]}
                  onPress={() => setDateRange('7days')}
                >
                  <Text style={[styles.dateBtnText, dateRange === '7days' && styles.dateBtnActiveText]}>7D</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dateBtn, dateRange === '30days' && styles.dateBtnActive]}
                  onPress={() => setDateRange('30days')}
                >
                  <Text style={[styles.dateBtnText, dateRange === '30days' && styles.dateBtnActiveText]}>30D</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.filterGroup, { flex: 1.5 }]}>
              <Text style={styles.filterLabel}>Amount Range ($)</Text>
              <View style={styles.amountRangeContainer}>
                <TextInput
                  placeholder="Min"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  style={[styles.amountRangeInput, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}
                  value={minAmount}
                  onChangeText={setMinAmount}
                />
                <Text style={styles.amountRangeDash}>-</Text>
                <TextInput
                  placeholder="Max"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  style={[styles.amountRangeInput, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}
                  value={maxAmount}
                  onChangeText={setMaxAmount}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.clearFiltersBtn}
            onPress={() => {
              setFilterCategory(null);
              setMinAmount('');
              setMaxAmount('');
              setDateRange('all');
              setSearchQuery('');
            }}
          >
            <Text style={styles.clearFiltersText}>Clear All Filters</Text>
          </TouchableOpacity>
        </ThemedView>
      )}

      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="receipt-outline" size={60} color="#ccc" />
          </View>
          <ThemedText style={styles.emptyText}>
            {searchQuery ? 'No matching expenses' : 'No expenses yet'}
          </ThemedText>
          <Link href="/modal" asChild>
            <TouchableOpacity style={styles.emptyAddBtn}>
              <Text style={styles.emptyAddBtnText}>Add Transaction</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

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
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A1CEDC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  headerAddText: {
    fontWeight: '700',
    color: '#1D3D47',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterToggleBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  filterToggleBtnActive: {
    backgroundColor: '#1D3D47',
  },
  filterSection: {
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  filterGroup: {
    marginBottom: 15,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  dateSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
    padding: 3,
  },
  dateBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  dateBtnActive: {
    backgroundColor: '#1D3D47',
  },
  dateBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  dateBtnActiveText: {
    color: '#fff',
  },
  amountRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountRangeInput: {
    flex: 1,
    height: 36,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: '600',
  },
  amountRangeDash: {
    color: '#888',
  },
  clearFiltersBtn: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  clearFiltersText: {
    fontSize: 13,
    color: '#F44336',
    fontWeight: '700',
  },
  filterScroll: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  filterChipActive: {
    backgroundColor: '#1D3D47',
    borderColor: '#1D3D47',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 15,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  rightContent: {
    alignItems: 'flex-end',
    gap: 8,
  },
  deleteBtn: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
    marginBottom: 20,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyAddBtn: {
    backgroundColor: '#1D3D47',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyAddBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
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
