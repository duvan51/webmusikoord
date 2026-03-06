import { redirect } from "next/navigation";

export default function DashUserPage() {
  redirect("/dashuser/grupos");
  return null;
}