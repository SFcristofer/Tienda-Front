import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql', // Asume que tu backend GraphQL corre en este puerto
});

const authLink = setContext((_, { headers }) => {
  // Obtén el token de autenticación del almacenamiento local si existe
  const token = localStorage.getItem('token');
  // Retorna los encabezados al contexto para que httpLink los pueda leer
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

export default client;