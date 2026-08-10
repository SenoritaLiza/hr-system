import { useState } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { BackLink } from "@/components/ui/BackLink";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { Field, Input, Select, Textarea } from "@/components/ui/FormField";
import { ChipRow, Chip } from "@/components/ui/Chip";
import { usePageTitle } from "@/context/PageTitleContext";
import { useCandidates } from "@/context/CandidatesContext";
import { useToast } from "@/context/ToastContext";
import { candidateResultPath } from "@/router/paths";

const SLOTS = ["Ср, 6 авг · 11:00", "Ср, 6 авг · 14:30", "Чт, 7 авг · 10:00", "Чт, 7 авг · 16:00", "Пт, 8 авг · 12:00"];

export function InvitePage() {
  const { id } = useParams<{ id: string }>();
  const { candidates } = useCandidates();
  const { showToast } = useToast();
  const [selectedSlot, setSelectedSlot] = useState(SLOTS[0]);

  const candidate = candidates.find((c) => c.id === id);
  usePageTitle("Приглашение на собеседование");

  if (!candidate) return <BackLink to={candidateResultPath(id ?? "")} label="Назад" />;

  return (
    <>
      <BackLink to={candidateResultPath(candidate.id)} label={candidate.name} />
      <PageHeader title="Приглашение на собеседование" subtitle={`${candidate.vacancyTitle} · ${candidate.name}`} />

      <div className="grid grid-2">
        <Card>
          <CardHeader title="Письмо кандидату" />
          <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Field label="Кому">
              {/* email кандидата пока нигде не собирается */}
              <Input value="" placeholder="Email не указан" readOnly />
            </Field>
            <Field label="Шаблон">
              <Select defaultValue="tech">
                <option value="tech">Приглашение на техническое интервью</option>
              </Select>
            </Field>
            <Field label="Тема">
              <Input defaultValue={`Собеседование — ${candidate.vacancyTitle}`} />
            </Field>
            <Field label="Текст письма">
              <Textarea
                style={{ minHeight: 160 }}
                defaultValue={`Здравствуйте, ${candidate.name.split(" ")[0]}!\n\nСпасибо за отклик на вакансию ${candidate.vacancyTitle}. Мы будем рады пригласить вас на техническое интервью с командой разработки.\n\nПожалуйста, выберите удобный слот справа — мы вышлем ссылку на встречу после подтверждения.\n\nС уважением,\nЕлизавета Ныркова`}
              />
            </Field>
            <Button variant="primary" block onClick={() => showToast(`Приглашение отправлено кандидату ${candidate.name}`)}>
              <Icon name="mail" />
              Отправить приглашение
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Слоты собеседования" />
          <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Field label="Интервьюер">
              <Select defaultValue="belenko">
                <option value="belenko">Артур Беленко, Team Lead Backend</option>
              </Select>
            </Field>
            <ChipRow>
              {SLOTS.map((slot) => (
                <span key={slot} onClick={() => setSelectedSlot(slot)} style={{ cursor: "pointer" }}>
                  <Chip
                    style={
                      slot === selectedSlot
                        ? { borderColor: "var(--accent)", color: "var(--accent)", background: "var(--accent-soft)" }
                        : undefined
                    }
                  >
                    {slot}
                  </Chip>
                </span>
              ))}
            </ChipRow>
            <p style={{ fontSize: ".78rem", color: "var(--ink-muted)" }}>
              Выбран слот: {selectedSlot} (МСК) · 60 минут
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}