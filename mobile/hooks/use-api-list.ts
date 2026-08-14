import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { API_URL } from '@/constants/api';
import { useAuthToken } from '@/hooks/use-auth-token';

// The house fetch pattern, written once: authed GET → 401 logs out →
// parse only on ok → reload on every focus. T is the row type of the list.
export function useApiList<T>(path: string) {
    const { token, logout } = useAuthToken();
    const [items, setItems] = useState<T[]>([]);

    const load = async () => {
        try {
            const response = await fetch(`${API_URL}${path}`, {
                headers: { Authorization: 'Bearer ' + token },
            });
            if (response.status === 401) { logout(); return; }
            if (!response.ok) {
                // .text() is safe on any body — error bodies aren't guaranteed JSON
                console.log(path, 'fetch failed', response.status, await response.text());
                return;
            }
            setItems(await response.json());
        } catch (e) {
            console.log(path, 'fetch failed', e);   // server unreachable — retried on next focus
        }
    };

    // path is in the deps so a hook like useModuleTasks(id) refetches when
    // the id (and so the path) changes, not just on focus
    useFocusEffect(useCallback(() => { if (token) load(); }, [token, path]));

    return { items, load };
}
