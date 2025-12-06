export type ResolvedUser = {
    auth_user_id: string;
    email: string;
    full_name: string;
};
/**
 * Returns the "real" user from DB.users table.
 * Also updates localStorage to ensure the user is always resolved.
 */
export declare function getResolvedUser(): Promise<ResolvedUser | null>;
/** Read resolved user from storage synchronously */
export declare function getResolvedUserSync(): ResolvedUser | null;
