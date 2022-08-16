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
  split,
} from "@apollo/client";
import { RetryLink } from "@apollo/client/link/retry";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { persistCache, LocalStorageWrapper } from "apollo3-cache-persist";

let selectedNoteIds = makeVar(["2"]);
export function setNoteSelection(noteId, isSelected) {
  if (isSelected) {
    selectedNoteIds([...selectedNoteIds(), noteId]);
  } else {
    selectedNoteIds(
      selectedNoteIds().filter((selectedNoteId) => selectedNoteId !== noteId)
    );
  }
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
const wsLink = new WebSocketLink({
  uri: "ws://localhost:4000/graphql",
});
const protocolLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.operation === "subscription";
  } /* split based on operation type */,
  wsLink,
  httpLink
);

// point to the server
const client = new ApolloClient({
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first", // Future query
    },
  },
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
          note: {
            read: (existingCachedValue, helpers) => {
              const queriedNoteId = helpers.args.id;
              return helpers.toReference({
                id: queriedNoteId,
                __typename: "Note",
              });
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
  link: from([retryLink, protocolLink]),
});

persistCache({
  cache: client.cache,
  storage: new LocalStorageWrapper(window.localStorage),
}).then(() => {
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
});
