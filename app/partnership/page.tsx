import { redirect } from "next/navigation";

/**
 * The partnership page held template sponsor packages and pricing with no
 * real data for this event. It is hidden from nav and sitemap; old links land
 * on the homepage. Restore from git history when there is a real offer.
 */
export default function Partnership() {
  redirect("/");
}
