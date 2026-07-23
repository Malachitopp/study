import { useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store'
import { API_URL } from "../(tabs)";

export default function ModuleScreen() {
    const{id} = useLocalSearchParams();

    const [token, setToken] = useState<string| null>(null);

    useEffect(() => {
        const restoreToken = async () => {
            const saved = await SecureStore.getItemAsync('token');
            if (saved) setToken(saved);
        };
        restoreToken();
    },[]);



    return (
    <ThemedText>module {id}</ThemedText>




    );
}