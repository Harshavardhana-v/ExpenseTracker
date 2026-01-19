import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useTransactions } from '../hooks/use-transactions';
import { CATEGORIES } from '../constants/categories';


export default function ModalScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const { saveTransaction } = useTransactions();

  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [drafts, setDrafts] = useState<any[]>([]);

  const resetForm = () => {
    setAmount('');
    setTitle('');
    setSelectedCategory(CATEGORIES[0]);
  };

  const addToDrafts = () => {
    if (!amount || !title) return;

    const newDraft = {
      title,
      amount: parseFloat(amount),
      type,
      category: selectedCategory.label,
      icon: selectedCategory.icon,
      color: selectedCategory.color,
    };

    setDrafts(prev => [...prev, newDraft]);
    resetForm();
  };

  const removeDraft = (index: number) => {
    setDrafts(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSaveAll = async () => {
    // Save drafts if any, otherwise save current form if not empty
    const itemsToSave = [...drafts];

    if (amount && title) {
      itemsToSave.push({
        title,
        amount: parseFloat(amount),
        type,
        category: selectedCategory.label,
        icon: selectedCategory.icon,
        color: selectedCategory.color,
      });
    }

    if (itemsToSave.length === 0) return;

    for (const item of itemsToSave) {
      await saveTransaction(item);
    }

    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={colorScheme === 'dark' ? '#fff' : '#000'} />
          </TouchableOpacity>
          <ThemedText type="subtitle">Add Transaction</ThemedText>
          <View style={{ width: 28 }} />
        </View>

        {/* Drafts List */}
        {drafts.length > 0 && (
          <View style={styles.draftsContainer}>
            <ThemedText style={styles.draftsTitle}>Queue ({drafts.length})</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.draftsScroll}>
              {drafts.map((draft, idx) => (
                <View key={idx} style={[styles.draftItem, { backgroundColor: draft.color + '20' }]}>
                  <Ionicons name={draft.icon as any} size={16} color={draft.color} />
                  <ThemedText style={styles.draftTitle} numberOfLines={1}>{draft.title}</ThemedText>
                  <TouchableOpacity onPress={() => removeDraft(idx)} style={styles.removeDraftBtn}>
                    <Ionicons name="close-circle" size={14} color="#888" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Type Selector */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'expense' && styles.expenseActive]}
            onPress={() => setType('expense')}
          >
            <Text style={type === 'expense' ? styles.activeTypeText : styles.inactiveTypeText}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'income' && styles.incomeActive]}
            onPress={() => setType('income')}
          >
            <Text style={type === 'income' ? styles.activeTypeText : styles.inactiveTypeText}>Income</Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Amount</ThemedText>
          <View style={styles.amountInputContainer}>
            <Text style={[styles.currency, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>$</Text>
            <TextInput
              style={[styles.amountInput, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}
              placeholder="0.00"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        {/* Title Input */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Description</ThemedText>
          <TextInput
            style={[styles.textInput, {
              color: colorScheme === 'dark' ? '#fff' : '#000',
              backgroundColor: colorScheme === 'dark' ? '#1D3D47' : '#f5f5f5'
            }]}
            placeholder="What was this for?"
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Category Selector */}
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Category</ThemedText>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.label}
                style={[
                  styles.categoryItem,
                  {
                    backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f0f0f0',
                    borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                  },
                  selectedCategory.label === cat.label && {
                    borderColor: cat.color,
                    backgroundColor: cat.color + (colorScheme === 'dark' ? '40' : '20'),
                    borderWidth: 2
                  }
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <View style={[styles.catIcon, { backgroundColor: cat.color }]}>
                  <Ionicons name={cat.icon as any} size={20} color="#fff" />
                </View>
                <Text style={[styles.catLabel, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addToListBtn, { borderColor: colorScheme === 'dark' ? '#A1CEDC' : '#1D3D47' }]}
          onPress={addToDrafts}
        >
          <Ionicons name="add" size={20} color={colorScheme === 'dark' ? '#A1CEDC' : '#1D3D47'} />
          <Text style={[styles.addToListText, { color: colorScheme === 'dark' ? '#A1CEDC' : '#1D3D47' }]}>
            Add to Queue
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Save Button for Mobile */}
      <TouchableOpacity style={styles.footerSaveBtn} onPress={handleSaveAll}>
        <Text style={styles.footerSaveBtnText}>
          {drafts.length > 0 ? `Save ${drafts.length + (amount && title ? 1 : 0)} Items` : 'Save Transaction'}
        </Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  saveBtn: {
    color: '#A1CEDC',
    fontWeight: '700',
    fontSize: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 25,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  expenseActive: {
    backgroundColor: '#F44336',
  },
  incomeActive: {
    backgroundColor: '#4CAF50',
  },
  activeTypeText: {
    color: '#fff',
    fontWeight: '700',
  },
  inactiveTypeText: {
    color: '#888',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 8,
    fontWeight: '600',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
  },
  currency: {
    fontSize: 32,
    fontWeight: '700',
    marginRight: 5,
  },
  amountInput: {
    fontSize: 40,
    fontWeight: '700',
    flex: 1,
  },
  textInput: {
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  categoryItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    gap: 10,
    // Add subtle elevation for light mode
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  catIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerSaveBtn: {
    backgroundColor: '#1D3D47',
    margin: 20,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  footerSaveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  draftsContainer: {
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 15,
    borderRadius: 20,
  },
  draftsTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    opacity: 0.5,
    textTransform: 'uppercase',
  },
  draftsScroll: {
    flexDirection: 'row',
  },
  draftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 10,
    gap: 8,
  },
  draftTitle: {
    fontSize: 13,
    fontWeight: '600',
    maxWidth: 80,
  },
  removeDraftBtn: {
    marginLeft: 2,
  },
  addToListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginTop: 10,
    gap: 8,
  },
  addToListText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
