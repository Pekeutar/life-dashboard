import PageHeader from "@/components/shared/PageHeader";
import StudyForm from "@/components/study/StudyForm";

export default function NewStudyPage() {
  return (
    <>
      <PageHeader title="Nouvelle session" backHref="/etude" />
      <StudyForm />
    </>
  );
}
