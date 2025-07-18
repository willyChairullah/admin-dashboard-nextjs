import { Button } from "@/components/ui/common";
import { Input } from "@/components/ui/common";
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

        {/* <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div> */}

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
          <Input
            name="name"
            placeholder="Full Name"
            type="text"
            required
            autoComplete="name"
          />
          <Input
            name="email"
            placeholder="Email"
            type="email"
            required
            autoComplete="email"
          />
          <Input
            name="password"
            placeholder="Password"
            type="password"
            required
            autoComplete="new-password"
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
