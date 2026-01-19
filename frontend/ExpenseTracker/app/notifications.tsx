import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useNotifications } from '@/hooks/use-notifications';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function NotificationsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const { notifications, loading, markAsRead, clearAll } = useNotifications();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return { name: 'checkmark-circle-outline' as any, color: '#4CAF50' };
            case 'warning': return { name: 'alert-circle-outline' as any, color: '#FF9800' };
            default: return { name: 'information-circle-outline' as any, color: '#2196F3' };
        }
    };

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#1D3D47" />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                </TouchableOpacity>
                <ThemedText type="subtitle">Notifications</ThemedText>
                <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
                    <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {notifications.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="notifications-off-outline" size={80} color="#ccc" />
                        </View>
                        <ThemedText style={styles.emptyTitle}>No notifications yet</ThemedText>
                        <Text style={styles.emptySubtitle}>We'll notify you when something important happens.</Text>
                    </View>
                ) : (
                    notifications.map((n) => {
                        const icon = getIcon(n.type);
                        return (
                            <TouchableOpacity
                                key={n.id}
                                onPress={() => markAsRead(n.id)}
                                style={[
                                    styles.notificationItem,
                                    !n.read && { backgroundColor: colorScheme === 'dark' ? '#1D3D47' : '#F0F7F9' }
                                ]}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
                                    <Ionicons name={icon.name} size={24} color={icon.color} />
                                </View>
                                <View style={styles.notifContent}>
                                    <View style={styles.notifHeader}>
                                        <ThemedText type="defaultSemiBold" style={styles.notifTitle}>{n.title}</ThemedText>
                                        {!n.read && <View style={styles.unreadDot} />}
                                    </View>
                                    <Text style={[styles.notifMessage, { color: colorScheme === 'dark' ? '#bbb' : '#666' }]}>{n.message}</Text>
                                    <Text style={styles.notifDate}>{formatDate(n.date)}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>
        </ThemedView>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    backBtn: {
        width: 40,
    },
    clearBtn: {
        paddingVertical: 5,
    },
    clearText: {
        color: '#F44336',
        fontWeight: '600',
    },
    scrollContent: {
        flexGrow: 1,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.03)',
        gap: 15,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifContent: {
        flex: 1,
    },
    notifHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    notifTitle: {
        fontSize: 16,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2196F3',
    },
    notifMessage: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 6,
    },
    notifDate: {
        fontSize: 12,
        color: '#888',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 60,
    },
    emptyIconContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(0,0,0,0.02)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 10,
    },
    emptySubtitle: {
        textAlign: 'center',
        color: '#888',
        lineHeight: 22,
    },
});
