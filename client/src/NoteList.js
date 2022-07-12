import { Stack } from "@chakra-ui/react";
import { UiNote } from "./shared-ui";
import { gql, useQuery } from "@apollo/client";

const NOTES_QUERY = gql`
  query GetAllNotes {
    notes {
      content
      category {
        label
      }
    }
  }
`;

export function NoteList() {
  const { data } = useQuery(NOTES_QUERY); // deconstruct the data from the result
  const notes = data?.notes;
  // const notes = [
  //   { content: "Note 1", category: { label: "Work" } },
  //   { content: "Note 2", category: { label: "Work" } },
  // ];
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
