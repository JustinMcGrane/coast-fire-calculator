import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./SignOutButton";

export default async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="site-header">
      <Link href="/" className="site-logo">
        coast<em>fire</em>
      </Link>
      <nav className="site-nav">
        <Link href="/coast-fire-number">Coast number</Link>
        <Link href="/coast-fire-calculator-retirement">Near retirement</Link>
        <Link href="/pricing">Premium</Link>
        {user ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <SignOutButton />
          </>
        ) : (
          <Link href="/login">Sign in</Link>
        )}
      </nav>
    </header>
  );
}
