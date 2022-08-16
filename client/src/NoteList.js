import { Spinner, Stack, Heading, Checkbox, Text } from "@chakra-ui/react";
import {
  DeleteButton,
  UiLoadMoreButton,
  UiNote,
  ViewNoteButton,
} from "./shared-ui";
import { gql, useQuery, useMutation, useSubscription } from "@apollo/client";
import { Link } from "react-router-dom";
import { setNoteSelection } from ".";
import { useEffect } from "react";

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
  const { data, loading, error, fetchMore, subscribeToMore } = useQuery(
    NOTES_QUERY,
    {
      variables: {
        categoryId: category,
        offset: 0, // give notes from the beginning
        limit: 3,
      },
      errorPolicy: "all", // leave the data alone
    }
  ); // deconstruct the data from the result

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

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: gql`
        subscription newSharedNote($categoryId: String!) {
          newSharedNote(categoryId: $categoryId) {
            id
            content
            category {
              id
              label
            }
          }
        }
      `,
      variables: {
        categoryId: category,
      },
      updateQuery: (previousQueryResult, { subscriptionData }) => {
        const newNote = subscriptionData.data.newSharedNote;
        client.cache.writeQuery({
          query: NOTES_QUERY,
          data: {
            ...previousQueryResult, // ensure __typeName is preserved
            notes: [newNote, ...previousQueryResult.notes],
          },
          variables: {
            categoryId: category,
          },
          overwrite: true,
        });
      },
    });
    return unsubscribe;
  }, [category]);

  // const { data: newNoteData } = useSubscription(
  //   gql`
  //     subscription newSharedNote($categoryId: String!) {
  //       newSharedNote(categoryId: $categoryId) {
  //         id
  //         content
  //         category {
  //           id
  //           label
  //         }
  //       }
  //     }
  //   `,
  //   {
  //     variables: {
  //       categoryId: category,
  //     },
  //   }
  // );
  // const newNote = newNoteData?.newSharedNote;

  if (error && !data) {
    return <Heading>Could not load notes.</Heading>;
  }
  if (loading) {
    return <Spinner />;
  }

  // const newNote = {
  //   category: {
  //     label: "Holiday planning",
  //   },
  //   content: "New note content..",
  // };

  // To make the notes stack on top, we use a different method
  // const recentChanges = newNote && (
  //   <>
  //     <Text>Recent changes: </Text>
  //     <UiNote category={newNote.category.label} content={newNote.content} />
  //   </>
  // );

  const notes = data?.notes.filter((note) => !!note);

  return (
    <Stack spacing={4}>
      {/* {recentChanges} */}
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
