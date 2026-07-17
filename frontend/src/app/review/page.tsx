import { PageHead } from "@/components/PageHead";
import { ReviewCenter } from "@/components/ReviewCenter";

export default function Page() {
  return <><PageHead kicker="Reviewer mode" title="Verify the work, not the pitch." copy="This page reads the active deployment, exposes lifecycle progress, separates wallet roles, and links directly to the next valid contract action." /><ReviewCenter /></>;
}
