import PageHeader from "@/components/shared/PageHeader";
import QuestForm from "@/components/quests/QuestForm";

export default function NewQuestPage() {
  return (
    <>
      <PageHeader
        title="Nouvelle quête"
        subtitle="Fixe un objectif, gagne de l'XP"
        backHref="/quetes"
      />
      <QuestForm />
    </>
  );
}
