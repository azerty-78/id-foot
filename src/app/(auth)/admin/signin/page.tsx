import { Suspense } from "react";
import { LoadingState } from "@/components/admin/ui";
import SignInForm from "./SignInForm";

export default function SignInPage() {
  return (
    <Suspense fallback={<LoadingState message="Chargement..." />}>
      <SignInForm />
    </Suspense>
  );
}
