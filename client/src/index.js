import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  from,
  makeVar,
} from "@apollo/client";
import { RetryLink } from "@apollo/client/link/retry";

// initialise makeVar
let selectedNoteIds = makeVar(["2"]);
export function setNoteSelection(noteId, isSelected) {
  console.log("before", selectedNoteIds);
  if (isSelected) {
    selectedNoteIds = ([...selectedNoteIds(), noteId]);
  } else {
    selectedNoteIds(selectedNoteIds().filter(
      (selectedNoteId) => selectedNoteId !== noteId
    ));
  }
  console.log("after", selectedNoteIds);
}

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
});

const retryLink = new RetryLink({
  // by default retry for 5 times
  delay: {
    initial: 2000,
    max: 2000, // max wait time
    jitter: false, // randomize the time between intervals => better to set true
  },
});

// point to the server
const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Note: {
        fields: {
          isSelected: {
            read: (currentIsSelectedValue, helpers) => {
              const currentNoteId = helpers.readField("id");
              return selectedNoteIds().includes(currentNoteId);
            },
          },
        },
      },
    },
  }),
  //   {
  //   typePolicies: {
  //     Query: {
  //       fields: {
  //         notes: {
  //           keyArgs: ["categoryId"],
  //           merge: (existingNotes = [], incomingNotes) => {
  //             return [...existingNotes, ...incomingNotes];
  //           },
  //         },
  //       },
  //     },
  //   },
  // }
  link: from([retryLink, httpLink]),
});

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider>
      <ApolloProvider client={client}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApolloProvider>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
