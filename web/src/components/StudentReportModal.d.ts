import "../style/StudentReport.scss";
type ReportListingInput = {
    id: string;
    seller_id: string;
    reportType: "listing" | "user";
};
export default function StudentReportModal({ listing, onClose }: {
    listing: ReportListingInput;
    onClose: () => void;
}): import("react/jsx-runtime").JSX.Element;
export {};
