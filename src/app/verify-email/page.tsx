export const metadata = {
  title: "Verify email | KendraFi",
};

// Landing page for Supabase email-confirmation links (the callback route
// exchanges the code first, then redirects here via ?next=/verify-email).
export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F4F5F7] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <h1 className="text-xl font-bold text-[#2D3135] mb-2">Email verified</h1>
        <p className="text-sm text-gray-500 mb-6">
          Your email address is confirmed. You can now log in to your KendraFi workspace.
        </p>
        <a
          href="/login"
          className="inline-block bg-[#FF5C00] hover:bg-[#E65200] text-white text-sm font-bold rounded-lg px-6 py-2.5"
        >
          Go to log in
        </a>
      </div>
    </main>
  );
}
