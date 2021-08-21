import { useMutation, useQuery } from "@apollo/client";
import { gql } from "@apollo/client/core";
import { UiEditCategories } from "./shared-ui/UiEditCategories";

export const ALL_CATEGORIES_QUERY = gql`
  query GetCategories {
    categories {
      id
      label
    }
  }
`;

export function EditCategories() {
  const { data } = useQuery(ALL_CATEGORIES_QUERY);

  const [updateCategory] = useMutation(gql`
    mutation UpdateCategory($categoryId: String!, $categoryLabel: String!) {
      updateCategory(id: $categoryId, label: $categoryLabel) {
        id
        label
      }
    }
  `);
  return (
    <UiEditCategories
      categories={data?.categories}
      onEditCategory={({ id, label }) =>
        updateCategory({
          variables: { categoryId: id, categoryLabel: label },
        })
      }
    />
  );
}
