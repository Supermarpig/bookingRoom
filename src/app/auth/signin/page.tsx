import { getProviders } from "next-auth/react";
import SignInButtons from "./SignInButtons";

export default async function SignIn() {
  const providers = await getProviders();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">登入帳號</h2>
          <p className="mt-2 text-sm text-gray-600">請選擇登入方式</p>
        </div>
        <div className="mt-8 space-y-4">
          <SignInButtons providers={providers} />
        </div>
      </div>
    </div>
  );
} 