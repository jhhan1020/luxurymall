import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-6 py-28 text-center text-muted">
          결제를 확인하고 있어요…
        </div>
      }
    >
      <SuccessClient />
    </Suspense>
  );
}
