export declare function sendMessage({ listingId, senderAuthId, receiverAuthId, content, }: {
    listingId: string;
    senderAuthId: string;
    receiverAuthId: string;
    content: string;
}): Promise<{
    error: import("@supabase/postgrest-js").PostgrestError | null;
}>;
