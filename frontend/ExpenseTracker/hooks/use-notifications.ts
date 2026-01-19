import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    date: string;
    read: boolean;
    type: 'info' | 'warning' | 'success';
}

const STORAGE_KEY = '@notifications';

export function useNotifications() {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                setNotifications(JSON.parse(stored));
            } else {
                // Initial "Welcome" notification
                const initial = [{
                    id: 'welcome',
                    title: 'Welcome to Expense Tracker!',
                    message: 'Start tracking your daily expenses today. Use the "+" button to add your first transaction.',
                    date: new Date().toISOString(),
                    read: false,
                    type: 'success'
                } as AppNotification];
                setNotifications(initial);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
            }
        } catch (e) {
            console.error('Failed to load notifications', e);
        } finally {
            setLoading(false);
        }
    };

    const addNotification = async (notif: Omit<AppNotification, 'id' | 'date' | 'read'>) => {
        const newNotif: AppNotification = {
            ...notif,
            id: Date.now().toString(),
            date: new Date().toISOString(),
            read: false,
        };

        const updated = [newNotif, ...notifications];
        setNotifications(updated);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const markAsRead = async (id: string) => {
        const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        setNotifications(updated);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const clearAll = async () => {
        setNotifications([]);
        await AsyncStorage.removeItem(STORAGE_KEY);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return {
        notifications,
        loading,
        addNotification,
        markAsRead,
        clearAll,
        unreadCount
    };
}
