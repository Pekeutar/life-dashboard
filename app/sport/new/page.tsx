import PageHeader from "@/components/shared/PageHeader";
import WorkoutForm from "@/components/sport/WorkoutForm";

export default function NewWorkoutPage() {
  return (
    <>
      <PageHeader title="Nouvelle séance" backHref="/sport" />
      <WorkoutForm />
    </>
  );
}
