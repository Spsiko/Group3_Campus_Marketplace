export type User = {
    auth_user_id: any;
    id: any;
    email: string;
    name: string;
};
export declare function getUser(): User | null;
export declare function signOut(): void;
export declare function signIn(email: string, password: string): Promise<User>;
