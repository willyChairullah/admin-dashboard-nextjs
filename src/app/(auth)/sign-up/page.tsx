import { Button } from "@/components/ui/common";
// Hapus import Input: import { Input } from "@/components/ui/common";
import { signUp } from "@/lib/action";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

const Page = async () => {
  // Temporarily disable session check to avoid JWT errors
  // const session = await auth();
  // if (session) redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center w-full">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>

        {/* Email/Password Sign Up */}
        <form
          className="space-y-4"
          action={async (formData: FormData) => {
            "use server";

            try {
              const res = await signUp(formData);
              if (res.success) {
                redirect("/sign-in");
              } else {
                console.error("Sign up failed:", res.message);
                // You might want to show this error to the user
              }
            } catch (error) {
              console.error("Sign up error:", error);
              // You might want to show this error to the user
            }
          }}
        >
          {/* Mengganti komponen Input dengan elemen <input> HTML biasa */}
          <input
            name="name"
            placeholder="Full Name"
            type="text"
            required
            autoComplete="name"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" // Tambahkan kelas styling agar mirip dengan komponen Input
          />
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
            autoComplete="new-password"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" // Tambahkan kelas styling agar mirip dengan komponen Input
          />
          <Button className="w-full" type="submit">
            Sign Up
          </Button>
        </form>

        <div className="text-center">
          <Button variant="link">
            <Link href="/sign-in">Already have an account? Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
