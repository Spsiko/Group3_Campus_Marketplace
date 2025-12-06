import type { ReactNode } from 'react';
type Props = {
    title?: string;
    children: ReactNode;
    full?: boolean;
};
export default function Layout({ title, children, full }: Props): import("react/jsx-runtime").JSX.Element;
export {};
