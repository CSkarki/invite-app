import Spinner from "@/components/ui/Spinner";

export default function DashboardLoading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "40vh",
        color: "var(--text-muted)",
      }}
    >
      <Spinner size={32} />
    </div>
  );
}
