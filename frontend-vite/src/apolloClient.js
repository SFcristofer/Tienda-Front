import { ApolloClient, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { createUploadLink } from 'apollo-upload-client';

// Replace createHttpLink with createUploadLink
const uploadLink = createUploadLink({
  uri: 'http://localhost:4000/graphql', // Your GraphQL endpoint
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(uploadLink), // Use uploadLink here
  cache: new InMemoryCache()
});

export default client;