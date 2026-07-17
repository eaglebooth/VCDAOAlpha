import { ContractVerifier } from "@/components/ContractVerifier";
import { PageHead } from "@/components/PageHead";

export default function ContractPage() {
  return (
    <>
      <PageHead kicker="Live deployment" title="Verify the contract reviewers actually use." copy="Switch deployments at runtime, then prove the selected VCDAO Alpha contract responds on Studionet." />
      <ContractVerifier />
    </>
  );
}
