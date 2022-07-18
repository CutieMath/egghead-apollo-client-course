import { Spinner, Stack } from "@chakra-ui/react";
import { UiNote, ViewNoteButton } from "./shared-ui";
import { gql, useQuery } from "@apollo/client";
import { Link } from "react-router-dom";

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
  const { data, loading, error } = useQuery(NOTES_QUERY, {
    variables: {
      categoryId: category,
    },
    // use no cache policy for certain queries that are constantly changing
    fetchPolicy: "cache-and-network",
    errorPolicy: "all", // leave the data alone
  }); // deconstruct the data from the result
  const notes = data?.notes.filter((note) => !!note);
  // const notes = [
  //   { content: "Note 1", category: { label: "Work" } },
  //   { content: "Note 2", category: { label: "Work" } },
  // ];
  if (error && !data) {
    return <d1>No data to show.</d1>;
  }
  if (loading) {
    return <Spinner />;
  }
  return (
    <Stack spacing={4}>
      {notes?.map((note) => (
        <UiNote
          key={note.id}
          content={note.content}
          category={note.category.label}
        >
          <Link to={`/note/${note.id}`}>
            <ViewNoteButton />
          </Link>
        </UiNote>
      ))}
    </Stack>
  );
}
