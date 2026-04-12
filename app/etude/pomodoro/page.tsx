import PageHeader from "@/components/shared/PageHeader";
import PomodoroTimer from "@/components/study/PomodoroTimer";

export default function PomodoroPage() {
  return (
    <>
      <PageHeader title="Pomodoro" subtitle="Mode concentration" backHref="/etude" />
      <PomodoroTimer />
    </>
  );
}
