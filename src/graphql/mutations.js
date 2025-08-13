import { gql } from '@apollo/client';

export const REGISTER_USER = gql`
  mutation RegisterUser($name: String!, $email: String!, $password: String!) {
    registerUser(name: $name, email: $email, password: $password)
  }
`;

export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password)
  }
`;

export const CREATE_STORE = gql`
  mutation CreateStore($name: String!, $description: String!, $imageUrl: String) {
    createStore(name: $name, description: $description, imageUrl: $imageUrl) {
      id
      name
      description
      imageUrl
    }
  }
`;

export const UPDATE_STORE = gql`
  mutation UpdateStore($id: ID!, $name: String, $description: String, $imageUrl: String) {
    updateStore(id: $id, name: $name, description: $description, imageUrl: $imageUrl) {
      id
      name
      description
      imageUrl
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct(
    $name: String!
    $description: String!
    $price: Float!
    $storeId: ID!
    $imageUrl: String
    $categoryId: ID!
    $stock: Int!
  ) {
    createProduct(
      name: $name
      description: $description
      price: $price
      storeId: $storeId
      imageUrl: $imageUrl
      categoryId: $categoryId
      stock: $stock
    ) {
      id
      name
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct(
    $id: ID!
    $name: String
    $description: String
    $price: Float
    $imageUrl: String
    $stock: Int
    $categoryId: ID
  ) {
    updateProduct(
      id: $id
      name: $name
      description: $description
      price: $price
      imageUrl: $imageUrl
      stock: $stock
      categoryId: $categoryId
    ) {
      id
      name
      description
      price
      imageUrl
      stock
      category {
        id
        name
      }
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $name: String, $email: String, $password: String) {
    updateUser(id: $id, name: $name, email: $email, password: $password) {
      id
      name
      email
      role
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      totalAmount
      status
      deliveryAddress
      customer {
        id
        name
      }
      store {
        id
        name
      }
      items {
        id
        quantity
        priceAtOrder
        product {
          id
          name
          price
        }
      }
    }
  }
`;

export const ADD_TO_CART = gql`
  mutation AddToCart($productId: ID!, $quantity: Int!) {
    addToCart(productId: $productId, quantity: $quantity) {
      id
      items {
        id
        quantity
        product {
          id
          name
          price
          imageUrl
        }
      }
    }
  }
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($productId: ID!) {
    removeFromCart(productId: $productId) {
      id
      items {
        id
        quantity
        product {
          id
          name
          price
          imageUrl
        }
      }
    }
  }
`;

export const UPDATE_CART_ITEM_QUANTITY = gql`
  mutation UpdateCartItemQuantity($productId: ID!, $quantity: Int!) {
    updateCartItemQuantity(productId: $productId, quantity: $quantity) {
      id
      items {
        id
        quantity
        product {
          id
          name
          price
          imageUrl
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
        }
      }
    }
  }
`;

export const CREATE_ADDRESS = gql`
  mutation CreateAddress($input: CreateAddressInput!) {
    createAddress(input: $input) {
      id
      street
      city
      state
      zipCode
      country
      isDefault
    }
  }
`;

export const UPDATE_ADDRESS = gql`
  mutation UpdateAddress($input: UpdateAddressInput!) {
    updateAddress(input: $input) {
      id
      street
      city
      state
      zipCode
      country
      isDefault
    }
  }
`;

export const DELETE_ADDRESS = gql`
  mutation DeleteAddress($id: ID!) {
    deleteAddress(id: $id)
  }
`;

export const CREATE_PAYMENT_METHOD = gql`
  mutation CreatePaymentMethod($input: CreatePaymentMethodInput!) {
    createPaymentMethod(input: $input) {
      id
      brand
      last4
      isDefault
    }
  }
`;

export const UPDATE_PAYMENT_METHOD = gql`
  mutation UpdatePaymentMethod($input: UpdatePaymentMethodInput!) {
    updatePaymentMethod(input: $input) {
      id
      isDefault
    }
  }
`;

export const DELETE_PAYMENT_METHOD = gql`
  mutation DeletePaymentMethod($id: ID!) {
    deletePaymentMethod(id: $id)
  }
`;

export const BECOME_SELLER = gql`
  mutation BecomeSeller {
    becomeSeller {
      id
      role
    }
  }
`;

export const CREATE_PRODUCT_REVIEW = gql`
  mutation CreateProductReview($input: CreateProductReviewInput!) {
    createProductReview(input: $input) {
      id
      rating
      comment
      user {
        id
        name
      }
    }
  }
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($orderId: ID!, $status: OrderStatus!) {
    updateOrderStatus(orderId: $orderId, status: $status) {
      id
      status
    }
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token)
  }
`;

export const DEACTIVATE_ACCOUNT = gql`
  mutation DeactivateAccount {
    deactivateAccount
  }
`;

export const DELETE_ACCOUNT = gql`
  mutation DeleteAccount {
    deleteAccount
  }
`;

export const ADMIN_UPDATE_USER_ROLE = gql`
  mutation AdminUpdateUserRole($userId: ID!, $role: String!) {
    adminUpdateUserRole(userId: $userId, role: $role) {
      id
      role
    }
  }
`;

export const ADMIN_UPDATE_USER_STATUS = gql`
  mutation AdminUpdateUserStatus($userId: ID!, $status: String!) {
    adminUpdateUserStatus(userId: $userId, status: $status) {
      id
      status
    }
  }
`;

export const ADMIN_UPDATE_CATEGORY = gql`
  mutation AdminUpdateCategory($id: ID!, $name: String!) {
    updateCategory(id: $id, name: $name) {
      id
      name
    }
  }
`;

export const ADMIN_DELETE_CATEGORY = gql`
  mutation AdminDeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($name: String!) {
    createCategory(name: $name) {
      id
      name
    }
  }
`;

export const ADMIN_UPDATE_STORE_STATUS = gql`
  mutation AdminUpdateStoreStatus($storeId: ID!, $status: String!) {
    adminUpdateStoreStatus(storeId: $storeId, status: $status) {
      id
      name
      status
    }
  }
`;

export const ADMIN_UPDATE_PRODUCT_STATUS = gql`
  mutation AdminUpdateProductStatus($productId: ID!, $status: String!) {
    adminUpdateProductStatus(productId: $productId, status: $status) {
      id
      name
      status
    }
  }
`;