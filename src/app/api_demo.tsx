import { Button, Text, View } from "react-native";

interface response {
    name: string;
    email: string;
}

async function API(url_api: string): Promise<response[]> {
    const response = await fetch(url_api).then(res => res.json())
    return response
}

export  default function ApiDemo(){
    
    const URL_API = "https://jsonplaceholder.typicode.com/users";

    const response = API(URL_API)

    // const user = Promise.all(response => data {})
    console.log(response);
    
    return (
        <View>
            response.map((user, index) => (
                    <Text>{user.name}</Text>
            ))
            <Button title="Kode"/>
        </View>
    )
}