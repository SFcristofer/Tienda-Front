import { gql } from '@apollo/client';

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
      avatarUrl
      phoneNumber
      isVerified
      status
    }
  }
`;

export const GET_MY_CART = gql`
  query MyCart {
    myCart {
      id
      items {
        id
        quantity
        product {
          id
          name
          price
          imageUrl
          stock
        }
      }
    }
  }
`;
