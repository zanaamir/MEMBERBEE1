export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="honeycomb flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-xl shadow-honey-900/5">{children}</div>
    </div>
  );
}
