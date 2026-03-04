type ActionResponse<T> = T | { error: string };

export async function wrapAction<T>(action: () => Promise<ActionResponse<T>>, actionName: string): Promise<ActionResponse<T>> {
    try {
        return await action();
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        console.error(`[Error in ${actionName}]:`, message);
        return { error: message };
    }
}
