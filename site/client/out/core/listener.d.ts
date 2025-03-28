export type ListenerDone = () => void;
export declare class Listener<T = void, U = void> {
    private list;
    dispatch(data: T): void;
    watch(fn: (data: T) => U): ListenerDone;
    clear(): void;
}
