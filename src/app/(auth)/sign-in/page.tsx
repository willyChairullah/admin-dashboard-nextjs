import { Button } from "@/components/ui/common";
// Hapus import Input: import { Input } from "@/components/ui/common";
import { auth, signIn } from "@/lib/auth";
import { executeAction } from "@/lib/executeAction";
import Link from "next/link";
import { redirect } from "next/navigation";

const Page = async () => {
  // Temporarily disable session check to avoid JWT errors
  // const session = await auth();
  // if (session) redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center w-full">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>

        {/* Email/Password Sign In */}
        <form
          className="space-y-4"
          action={async (formData: FormData) => {
            "use server";

            const result = await executeAction({
              actionFn: async () => {
                const email = formData.get("email") as string;
                const password = formData.get("password") as string;

                console.log("Sign-in form data:", {
                  email,
                  password: password ? "***" : "missing",
                });

                const signInResult = await signIn("credentials", {
                  email,
                  password,
                  redirect: false, // Don't redirect automatically
                });

                console.log("Sign-in result:", signInResult);

                if (signInResult?.error) {
                  throw new Error("Invalid credentials");
                }

                return signInResult;
              },
            });

            // If sign-in was successful, redirect to dashboard
            if (result.success) {
              redirect("/");
            }
          }}
        >
          {/* Mengganti komponen Input dengan elemen <input> HTML biasa */}
          <input
            name="email"
            placeholder="Email"
            type="email"
            required
            autoComplete="email"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" // Tambahkan kelas styling agar mirip dengan komponen Input
          />
          <input
            name="password"
            placeholder="Password"
            type="password"
            required
            autoComplete="current-password"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" // Tambahkan kelas styling agar mirip dengan komponen Input
          />
          <Button className="w-full" variant="outline" type="submit">
            Sign In
          </Button>
        </form>

        <div className="text-center">
          <Button variant="link">
            <Link href="/sign-up">Don&apos;t have an account? Sign up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
