import { router, useLocalSearchParams } from "expo-router";
import { Button } from "react-native";
import { Text, View } from "react-native";

export default function DemoSlug() {
    const {slug} = useLocalSearchParams<{ slug: string }>();
    return (
        <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Demo Slug Page</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', padding: 10 }}>Slug: {slug}</Text>
            <Button title="Press" onPress={() => router.back()} />
        </View>
    )
}