import { gql } from '@apollo/client';

export const GOOGLE_LOGIN = gql`
  mutation GoogleLogin($idToken: String!) {
    googleLogin(idToken: $idToken)
  }
`;

export const CREATE_STORE = gql`
  mutation CreateStore(
    $name: String!
    $description: String!
    $imageUrl: String
    $street: String
    $city: String!
    $state: String!
    $zipCode: String!
    $countryId: ID!
    $phoneNumber: String!
    $contactEmail: String!
    $storeCategoryIds: [ID!]
  ) {
    createStore(
      name: $name
      description: $description
      imageUrl: $imageUrl
      street: $street
      city: $city
      state: $state
      zipCode: $zipCode
      countryId: $countryId
      phoneNumber: $phoneNumber
      contactEmail: $contactEmail
      storeCategoryIds: $storeCategoryIds
    ) {
      id
      name
      description
      imageUrl
      street
      city
      state
      zipCode
      country {
        id
        name
      }
      phoneNumber
      contactEmail
    }
  }
`;

export const UPDATE_STORE = gql`
  mutation UpdateStore($id: ID!, $name: String, $description: String, $imageUrl: String, $street: String, $city: String, $state: String, $zipCode: String, $countryId: ID, $phoneNumber: String, $contactEmail: String) {
    updateStore(id: $id, name: $name, description: $description, imageUrl: $imageUrl, street: $street, city: $city, state: $state, zipCode: $zipCode, countryId: $countryId, phoneNumber: $phoneNumber, contactEmail: $contactEmail) {
      id
      name
      description
      imageUrl
      street
      city
      state
      zipCode
      country {
        id
        name
      }
      phoneNumber
      contactEmail
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
    $countryId: ID!
  ) {
    createProduct(
      name: $name
      description: $description
      price: $price
      storeId: $storeId
      imageUrl: $imageUrl
      categoryId: $categoryId
      stock: $stock
      countryId: $countryId
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
    $countryId: ID
  ) {
    updateProduct(
      id: $id
      name: $name
      description: $description
      price: $price
      imageUrl: $imageUrl
      stock: $stock
      categoryId: $categoryId
      countryId: $countryId
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
  mutation UpdateUser($name: String, $email: String, $password: String, $phoneNumber: String) {
    updateUser(name: $name, email: $email, password: $password, phoneNumber: $phoneNumber) {
      id
      name
      email
      phoneNumber
      role
    }
  }
`;

export const REGISTER_USER = gql`
  mutation RegisterUser($name: String!, $email: String!, $password: String!, $phoneNumber: String) {
    registerUser(name: $name, email: $email, password: $password, phoneNumber: $phoneNumber)
  }
`;

export const UPDATE_USER_AVATAR = gql`
  mutation UpdateUserAvatar($avatar: String!) {
    updateUserAvatar(avatar: $avatar) {
      id
      avatarUrl
    }
  }
`;

export const UPLOAD_IMAGE = gql`
  mutation UploadImage($base64Image: String!) {
    uploadImage(base64Image: $base64Image)
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

export const REMOVE_ITEMS_FROM_CART = gql`
  mutation RemoveItemsFromCart($productIds: [ID!]!) {
    removeItemsFromCart(productIds: $productIds) {
      id
      items {
        id
        quantity
        product {
          id
          name
          price
          imageUrl
          store {
            id
            name
          }
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
    becomeSeller
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

export const MARK_NOTIFICATION_AS_READ_MUTATION = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      id
      isRead
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;

export const ADMIN_CREATE_STORE_CATEGORY = gql`
  mutation AdminCreateStoreCategory($name: String!) {
    adminCreateStoreCategory(name: $name) {
      id
      name
    }
  }
`;

export const ADMIN_UPDATE_STORE_CATEGORY = gql`
  mutation AdminUpdateStoreCategory($id: ID!, $name: String!) {
    adminUpdateStoreCategory(id: $id, name: $name) {
      id
      name
    }
  }
`;

export const ADMIN_DELETE_STORE_CATEGORY = gql`
  mutation AdminDeleteStoreCategory($id: ID!) {
    adminDeleteStoreCategory(id: $id)
  }
`;

export const ADMIN_DELETE_USER = gql`
  mutation AdminDeleteUser($userId: ID!) {
    adminDeleteUser(userId: $userId)
  }
`;

export const ADMIN_CREATE_COUNTRY = gql`
  mutation AdminCreateCountry($name: String!, $code: String!, $currencyCode: String!, $currencySymbol: String!, $isActive: Boolean!) {
    adminCreateCountry(name: $name, code: $code, currencyCode: $currencyCode, currencySymbol: $currencySymbol, isActive: $isActive) {
      id
      name
      code
      currencyCode
      currencySymbol
      isActive
    }
  }
`;

export const ADMIN_UPDATE_COUNTRY = gql`
  mutation AdminUpdateCountry($id: ID!, $name: String, $code: String, $currencyCode: String, $currencySymbol: String, $isActive: Boolean) {
    adminUpdateCountry(id: $id, name: $name, code: $code, currencyCode: $currencyCode, currencySymbol: $currencySymbol, isActive: $isActive) {
      id
      name
      code
      currencyCode
      currencySymbol
      isActive
    }
  }
`;

export const ADMIN_DELETE_COUNTRY = gql`
  mutation AdminDeleteCountry($id: ID!) {
    adminDeleteCountry(id: $id)
  }
`;