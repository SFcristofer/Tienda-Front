import { gql } from '@apollo/client';

export const ADD_ITEM_TO_CART = gql`
  mutation AddItemToCart($productId: ID!, $quantity: Int!) {
    addItemToCart(productId: $productId, quantity: $quantity) {
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

export const UPDATE_CART_ITEM_QUANTITY = gql`
  mutation UpdateCartItemQuantity($cartItemId: ID!, $quantity: Int!) {
    updateCartItemQuantity(cartItemId: $cartItemId, quantity: $quantity) {
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

export const REMOVE_ITEM_FROM_CART = gql`
  mutation RemoveItemFromCart($cartItemId: ID!) {
    removeItemFromCart(cartItemId: $cartItemId) {
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

export const CLEAR_CART = gql`
  mutation ClearCart {
    clearCart {
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
