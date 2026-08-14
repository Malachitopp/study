import { Module } from '@/constants/types';
import { useApiList } from '@/hooks/use-api-list';

export function useModules() {
    const { items, load } = useApiList<Module>('/modules/');
    return { modules: items, loadModules: load };
}
