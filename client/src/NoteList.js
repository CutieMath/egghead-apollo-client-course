import { Stack } from "@chakra-ui/react";
import { UiNote } from "./shared-ui";
import { gql, useQuery } from "@apollo/client";

const NOTES_QUERY = gql`
  query GetAllNotes($categoryId: String) {
    notes(categoryId: $categoryId) {
      id
      content
      category {
        label
      }
    }
  }
`;

export function NoteList({ category }) {
  const { data } = useQuery(NOTES_QUERY, {
    variables: {
      categoryId: category,
    },
    // use no cache policy for certain queries that are constantly changing
    fetchPolicy: "cache-and-network",
  }); // deconstruct the data from the result
  const notes = data?.notes;
  // const notes = [
  //   { content: "Note 1", category: { label: "Work" } },
  //   { content: "Note 2", category: { label: "Work" } },
  // ];
  return (
    <Stack spacing={4}>
      {notes?.map((note) => (
        <UiNote
          key={note.id}
          content={note.content}
          category={note.category.label}
        >
          {note.content}
        </UiNote>
      ))}
    </Stack>
  );
}
