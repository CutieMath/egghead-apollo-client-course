import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";

const GET_NOT = gql`
  query GetNote($id: String!) {
    note(id: $id) {
      id
      content
    }
  }
`;

export function EditNote() {
  let { noteId } = useParams();

  return <div>Note {noteId} was selected</div>;
}
