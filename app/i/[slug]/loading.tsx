import Spinner from "@/components/ui/Spinner";

export default function InviteLoading() {
  return (
    <main
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        color: "var(--text-muted)",
      }}
    >
      <Spinner size={32} />
    </main>
  );
}
