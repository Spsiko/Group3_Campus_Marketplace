export type StudentUser = {
    id: string;
    auth_user_id: string;
    full_name: string;
    email: string;
    role: string;
};
export declare function getStudentUser(): StudentUser | null;
export declare function studentSignOut(): void;
export declare function studentSignIn(email: string, password: string): Promise<StudentUser>;
