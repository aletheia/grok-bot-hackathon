import { redirect } from "next/navigation";

/** The old profile screen duplicated the dashboard team UI; everything lives on /dashboard now. */
export default function ProfilePage() {
  redirect("/dashboard");
}
