import { Commitment } from '@/constants/types';
import { useApiList } from '@/hooks/use-api-list';

export function useCommitments() {
    const { items, load } = useApiList<Commitment>('/commitments/');
    return { commitments: items, loadCommitments: load };
}
