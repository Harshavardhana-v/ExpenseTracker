import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import frames from '../assets/images/sequence';

interface AnimationSequenceProps {
    fps?: number;
    style?: ViewStyle;
    loop?: boolean;
}

export function AnimationSequence({
    fps = 30,
    style,
    loop = true
}: AnimationSequenceProps) {
    const [frameIndex, setFrameIndex] = useState(0);

    useEffect(() => {
        if (frames.length === 0) return;

        const interval = 1000 / fps;
        const timer = setInterval(() => {
            setFrameIndex((prev) => {
                if (prev >= frames.length - 1) {
                    return loop ? 0 : prev;
                }
                return prev + 1;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [fps, loop]);

    return (
        <View style={[styles.container, style]}>
            <Image
                source={frames[frameIndex]}
                style={styles.image}
                contentFit="contain"
                transition={0}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
});
