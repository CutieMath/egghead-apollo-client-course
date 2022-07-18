import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { UiEditNote } from "./shared-ui";

const GET_NOTE = gql`
  query GetNote($id: String!) {
    note(id: $id) {
      id
      content
    }
  }
`;

export function EditNote() {
  let { noteId } = useParams();

  const { data } = useQuery(GET_NOTE, {
    variables: {
      id: noteId,
    },
  });

  return <UiEditNote note={data?.note} />;
}
