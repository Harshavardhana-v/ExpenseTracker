import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';

export default function SignUpScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const { signUp } = useAuth();
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSignUp = async () => {
        if (!name || !email || !password) return;
        setLoading(true);
        setErrorMsg(null);
        const { error } = await signUp(name, email, password);
        setLoading(false);
        if (error) {
            setErrorMsg(error.message);
        } else {
            router.replace('/(tabs)');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
                    <Text style={styles.subtitle}>Start tracking your finances today</Text>
                </View>

                {errorMsg && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={20} color="#F44336" />
                        <Text style={styles.errorText}>{errorMsg}</Text>
                    </View>
                )}

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={[styles.inputContainer, { backgroundColor: colorScheme === 'dark' ? '#1D3D47' : '#f5f5f5' }]}>
                            <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}
                                placeholder="John Doe"
                                placeholderTextColor="#888"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={[styles.inputContainer, { backgroundColor: colorScheme === 'dark' ? '#1D3D47' : '#f5f5f5' }]}>
                            <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}
                                placeholder="email@example.com"
                                placeholderTextColor="#888"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={[styles.inputContainer, { backgroundColor: colorScheme === 'dark' ? '#1D3D47' : '#f5f5f5' }]}>
                            <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}
                                placeholder="********"
                                placeholderTextColor="#888"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={styles.termsText}>
                        By signing up, you agree to our <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
                    </Text>

                    <TouchableOpacity style={styles.signUpBtn} onPress={handleSignUp}>
                        <Text style={styles.signUpBtnText}>Sign Up</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Link href="/(auth)/signin" asChild>
                            <TouchableOpacity>
                                <Text style={styles.signInLink}>Sign In</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 40,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    form: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
        color: '#333',
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderRadius: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    termsText: {
        fontSize: 13,
        color: '#888',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 20,
    },
    termsLink: {
        color: '#1D3D47',
        fontWeight: '700',
    },
    signUpBtn: {
        height: 56,
        backgroundColor: '#1D3D47',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    signUpBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    footerText: {
        color: '#666',
        fontSize: 15,
    },
    signInLink: {
        color: '#1D3D47',
        fontSize: 15,
        fontWeight: '800',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        gap: 8,
    },
    errorText: {
        color: '#F44336',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
});
