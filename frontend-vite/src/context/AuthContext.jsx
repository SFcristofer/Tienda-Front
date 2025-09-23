import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useQuery, gql } from '@apollo/client';

const GET_ME_WITH_ADDRESSES = gql`
  query GetMeWithAddresses {
    me {
      id
      name
      email
      role
      isVerified
      addresses {
        id
        street
        city
        state
        zipCode
        country
        isDefault
        phoneNumber
      }
    }
  }
`;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const { data, loading, error, refetch } = useQuery(GET_ME_WITH_ADDRESSES, {
    skip: !token, // Skip query if no token
    onCompleted: (queryData) => {
      if (queryData?.me) {
        setUser(queryData.me);
      } else {
        setUser(null);
      }
    },
    onError: (queryError) => {
      console.error("Error fetching user data:", queryError);
      setUser(null);
      // Optionally logout if there's an error fetching user data
      // logout();
    },
  });

  useEffect(() => {
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        // Check if token is expired
        if (decodedUser.exp * 1000 < Date.now()) {
          logout();
        } else {
          // Trigger refetch of user data from GraphQL if token is valid
          refetch();
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        logout();
      }
    } else {
      setUser(null);
    }
  }, [token, refetch]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, token, loadingUser: loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;