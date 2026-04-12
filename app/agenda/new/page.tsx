import { Suspense } from "react";
import PageHeader from "@/components/shared/PageHeader";
import EventForm from "@/components/agenda/EventForm";

export default function NewEventPage() {
  return (
    <>
      <PageHeader title="Nouvel événement" backHref="/agenda" />
      <Suspense fallback={<div className="px-5 text-sm text-[var(--color-text-subtle)]">Chargement…</div>}>
        <EventForm />
      </Suspense>
    </>
  );
}
