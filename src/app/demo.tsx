// import { Button } from "expo-router/build/react-navigation";
import { router } from "expo-router";
import { Button, Pressable, Text, View } from "react-native";

export default function DemoPage() {
    return (
        <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Demo Page</Text>
            <Button title="Slug 1" onPress={() => router.push('/demo-slug-1')}  />
            <Button title="Slug 2" onPress={() => router.push('/demo-slug-2')} />
            <Button title="Slug 3" onPress={() => router.push('/demo-slug-3')} />
            <Button title="Slug 4" onPress={() => router.push('/demo-slug-4')} />

            <Pressable style={{ backgroundColor: 'blue', padding: 10, margin: 10 }} onPress={() => router.push('/demo-slug-1')}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', padding: 10 }}>Slug 1</Text>
            </Pressable>
            <Pressable style={{ backgroundColor: 'lightgray', padding: 10, margin: 10 }} onPress={() => router.push('/demo-slug-2')}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', padding: 10 }}>Slug 2</Text>
            </Pressable>
            <Pressable style={{ backgroundColor: 'red', padding: 10, margin: 10 }} onPress={() => router.push('/demo-slug-3')}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', padding: 10 }}>Slug 3</Text>
            </Pressable>
            <Pressable style={{ backgroundColor: 'yellow', padding: 10, margin: 10 }} onPress={() => router.push('/demo-slug-4')}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', padding: 10 }}>Slug 4</Text>
            </Pressable>
        </View>
    )
    
}