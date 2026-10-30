export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-gray-900">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}