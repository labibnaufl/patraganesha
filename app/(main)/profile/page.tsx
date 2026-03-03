import { redirect } from "next/navigation";

// /profile → default to Badan Pengurus tab
export default function ProfilePage() {
  redirect("/profile/badanpengurus");
}
