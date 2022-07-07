import { Stack } from "@chakra-ui/react";
import { UiNote } from "./shared-ui";

export function NoteList() {
  const notes = [
    { content: "Note 1", category: { label: "Work" } },
    { content: "Note 2", category: { label: "Work" } },
  ];
  return (
    <Stack spacing={4}>
      {notes?.map((note, index) => (
        <UiNote
          key={index}
          content={note.content}
          category={note.category.label}
        >
          {note.content}
        </UiNote>
      ))}
    </Stack>
  );
}
