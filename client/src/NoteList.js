import { Spinner, Stack, Heading, Checkbox, Text } from "@chakra-ui/react";
import {
  DeleteButton,
  UiLoadMoreButton,
  UiNote,
  ViewNoteButton,
} from "./shared-ui";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Link } from "react-router-dom";
import { setNoteSelection } from ".";

const NOTES_QUERY = gql`
  query GetAllNotes($categoryId: String, $offset: Int, $limit: Int) {
    notes(categoryId: $categoryId, offset: $offset, limit: $limit) {
      id
      content
      isSelected @client
      category {
        id
        label
      }
    }
  }
`;

export function NoteList({ category }) {
  const { data, loading, error, fetchMore } = useQuery(NOTES_QUERY, {
    variables: {
      categoryId: category,
      offset: 0, // give notes from the beginning
      limit: 3,
    },
    // use no cache policy for certain queries that are constantly changing
    fetchPolicy: "cache-and-network",
    errorPolicy: "all", // leave the data alone
  }); // deconstruct the data from the result

  // Delete function
  const [deleteNote] = useMutation(
    gql`
      mutation DeleteNote($noteId: String!) {
        deleteNote(id: $noteId) {
          successful
          note {
            id
          }
        }
      }
    `,
    {
      optimisticResponse: (vars) => {
        return {
          deleteNote: {
            successful: true,
            __typename: "DeleteNoteResponse",
            note: {
              id: vars.noteId,
              __typename: "Note",
            },
          },
        };
      },
      update: (cache, mutationResult) => {
        const deletedNoteId = cache.identify(
          mutationResult.data?.deleteNote.note
        );
        console.log({ mutationResult, deletedNoteId });
        cache.modify({
          fields: {
            notes: (existingNotes) => {
              return existingNotes.filter((noteRef) => {
                return cache.identify(noteRef) !== deletedNoteId;
              });
            },
          },
        });
        // Evict the record from the cache completely
        cache.evict({ id: deletedNoteId });
      },
    }
  );

  if (error && !data) {
    return <Heading>Could not load notes.</Heading>;
  }
  if (loading) {
    return <Spinner />;
  }

  const newNote = {
    category: {
      label: "Holiday planning",
    },
    content: "New note content..",
  };

  const recentChanges = (
    <>
      <Text>Recent changes: </Text>
      <UiNote category={newNote.category.label} content={newNote.content} />
    </>
  );

  const notes = data?.notes.filter((note) => !!note);

  return (
    <Stack spacing={4}>
      {recentChanges}
      {notes?.map((note) => (
        <UiNote
          key={note.id}
          content={note.content}
          category={note.category.label}
        >
          <Checkbox
            onChange={(e) => setNoteSelection(note.id, e.target.checked)}
            isChecked={note.isSelected}
          >
            Select
          </Checkbox>
          <Link to={`/note/${note.id}`}>
            <ViewNoteButton />
          </Link>
          <DeleteButton
            onClick={() =>
              deleteNote({ variables: { noteId: note.id } }).catch((e) =>
                console.error(e)
              )
            }
          />
        </UiNote>
      ))}
      <UiLoadMoreButton
        onClick={() =>
          fetchMore({
            variables: {
              offset: data.notes.length,
            },
          })
        }
      />
    </Stack>
  );
}
