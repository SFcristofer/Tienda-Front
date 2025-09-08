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
      store { # Add this block
        id
        name
        status
      }
    }
  }
`;

export const GET_MY_STORE = gql`
  query GetMyStore {
    me {
      store {
        id
        name
        description
        imageUrl
        status
        plan
        street
        city
        state
        zipCode
        phoneNumber
        contactEmail
        averageRating
        country { # <-- ADD THIS
          id
          name
          code
          currencyCode
          currencySymbol
        }
        products {
          id
          name
          price
          description
          imageUrl
          stock
          category {
            id
            name
          }
        }
        storeCategories {
          id
          name
        }
        trialExpiresAt
        trialRemainingDays
      }
    }
  }
`;

export const GET_ALL_PRODUCTS = gql`
  query GetAllProducts(
    $country: String!,
    $categoryId: [ID],
    $minPrice: Float,
    $maxPrice: Float,
    $search: String,
    $sortBy: String,
    $sortOrder: String,
    $storeId: ID
  ) {
    getAllProducts(
      country: $country,
      categoryId: $categoryId,
      minPrice: $minPrice,
      maxPrice: $maxPrice,
      search: $search,
      sortBy: $sortBy,
      sortOrder: $sortOrder,
      storeId: $storeId
    ) {
      id
      name
      description
      price
      imageUrl
      insignias
      esDestacado
      store {
        id
        name
      }
      category {
        id
        name
      }
      country { # <-- ADD THIS
        id
        name
        code
        currencyCode
        currencySymbol
      }
    }
  }
`;

export const GET_ALL_STORES = gql`
  query GetAllStores($country: String!, $search: String, $sortBy: StoreSortBy, $sortOrder: SortOrder, $storeCategoryIds: [ID]) {
    getAllStores(
      country: $country,
      search: $search,
      sortBy: $sortBy,
      sortOrder: $sortOrder,
      storeCategoryIds: $storeCategoryIds
    ) {
      id
      name
      description
      imageUrl
      esDestacado # <-- ADD THIS
      owner {
        name
      }
      country {
        id
        name
      }
    }
  }
`;

export const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    getAllCategories {
      id
      name
      sponsoredStore {
        id
        name
      }
    }
  }
`;

export const GET_CATEGORY_BY_ID = gql`
  query GetCategoryById($id: ID!) {
    getCategoryById(id: $id) {
      id
      name
      sponsoredStore {
        id
        name
        imageUrl
        description
      }
    }
  }
`;

export const GET_STORE_BY_ID = gql`
  query GetStoreById($id: ID!) {
    getStoreById(id: $id) {
      id
      name
      description
      imageUrl # Añadimos imageUrl aquí
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
      storeCategories {
        id
        name
      }
      owner {
        id
        name
      }
      products {
        id
        name
        description
        price
        imageUrl
        category {
          id
          name
        }
      }
    }
  }
`;

export const CUSTOMER_ORDERS_QUERY = gql`
  query CustomerOrders {
    customerOrders {
      id
      totalAmount
      status
      deliveryAddress
      createdAt
      store {
        id
        name
        owner {
          id
          name
          email
        }
      }
      items {
        id
        quantity
        priceAtOrder
        product {
          id
          name
          imageUrl
        }
      }
    }
  }
`;

export const MY_CART_QUERY = gql`
  query MyCart {
    myCart {
      id
      items {
        id
        quantity
        product {
          id
          name
          description
          price
          imageUrl
          store {
            id
            name
          }
          country { # <-- ADD THIS
            id
            name
            code
            currencyCode
            currencySymbol
          }
        }
      }
    }
  }
`;

export const MY_ADDRESSES_QUERY = gql`
  query MyAddresses {
    myAddresses {
      id
      street
      city
      state
      zipCode
      country
      phoneNumber
      isDefault
    }
  }
`;

export const MY_PAYMENT_METHODS_QUERY = gql`
  query MyPaymentMethods {
    myPaymentMethods {
      id
      brand
      last4
      isDefault
    }
  }
`;

export const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: ID!) {
    getProductById(id: $id) {
      id
      name
      description
      price
      imageUrl
      stock
      averageRating
      insignias # <-- ADD THIS
      store {
        id
        name
      }
      category {
        id
        name
      }
      country { # <-- ADD THIS
        id
        name
        code
        currencyCode
        currencySymbol
      }
      reviews {
        id
        rating
        comment
        user {
          id
          name
        }
      }
    }
  }
`;

export const GET_SELLER_ORDERS = gql`
  query SellerOrders {
    sellerOrders {
      id
      totalAmount
      status
      deliveryAddress
      createdAt
      customer {
        id
        name
        email
      }
      items {
        id
        quantity
        priceAtOrder
        product {
          id
          name
          imageUrl
        }
      }
    }
  }
`;

// Admin Queries
export const adminGetAllUsers = gql`
  query AdminGetAllUsers {
    adminGetAllUsers {
      id
      name
      email
      role
      isVerified
      status
    }
  }
`;

export const adminGetAllStores = gql`
  query AdminGetAllStores {
    adminGetAllStores {
      id
      name
      description
      imageUrl
      owner {
        id
        name
      }
      products {
        id
      }
      status
      country { # <-- ADD THIS
        id
        name
        code
        currencyCode
        currencySymbol
      }
      plan
      trialExpiresAt
      trialRemainingDays
    }
  }
`;

export const adminGetAllProducts = gql`
  query AdminGetAllProducts {
    adminGetAllProducts {
      id
      name
      price
      stock
      store {
        id
        name
      }
      category {
        id
        name
      }
    }
  }
`;

export const adminGetAllOrders = gql`
  query AdminGetAllOrders {
    adminGetAllOrders {
      id
      totalAmount
      status
      deliveryAddress
      createdAt
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
        product {
          id
          name
        }
      }
    }
  }
`;

export const ADMIN_GET_DASHBOARD_STATS = gql`
  query AdminGetDashboardStats {
    adminGetDashboardStats {
      totalUsers
      totalStores
      totalProducts
      totalOrders
      totalSalesVolume
    }
  }
`;

export const ADMIN_GET_SALES_DATA = gql`
  query AdminGetSalesData($period: String!, $startDate: String, $endDate: String) {
    adminGetSalesData(period: $period, startDate: $startDate, endDate: $endDate) {
      date
      totalSales
    }
  }
`;

export const ADMIN_GET_USER_REGISTRATIONS = gql`
  query AdminGetUserRegistrations($period: String!, $startDate: String, $endDate: String) {
    adminGetUserRegistrations(period: $period, startDate: $startDate, endDate: $endDate) {
      date
      count
    }
  }
`;

export const ADMIN_GET_TOP_SELLING_PRODUCTS = gql`
  query AdminGetTopSellingProducts($limit: Int, $startDate: String, $endDate: String) {
    adminGetTopSellingProducts(limit: $limit, startDate: $startDate, endDate: $endDate) {
      productId
      productName
      totalQuantitySold
      totalRevenue
    }
  }
`;

export const ADMIN_GET_ORDER_STATUS_DISTRIBUTION = gql`
  query AdminGetOrderStatusDistribution($startDate: String, $endDate: String) {
    adminGetOrderStatusDistribution(startDate: $startDate, endDate: $endDate) {
      status
      count
      percentage
    }
  }
`;

export const ADMIN_GET_TOP_PERFORMING_STORES = gql`
  query AdminGetTopPerformingStores($limit: Int, $startDate: String, $endDate: String) {
    adminGetTopPerformingStores(limit: $limit, startDate: $startDate, endDate: $endDate) {
      storeId
      storeName
      totalRevenue
      totalOrders
    }
  }
`;

export const ADMIN_GET_CATEGORY_SALES = gql`
  query AdminGetCategorySales($startDate: String, $endDate: String) {
    adminGetCategorySales(startDate: $startDate, endDate: $endDate) {
      categoryId
      categoryName
      totalRevenue
      totalQuantitySold
    }
  }
`;

export const ADMIN_GET_PRODUCTS_PUBLISHED_BY_STORE = gql`
  query AdminGetProductsPublishedByStore {
    adminGetProductsPublishedByStore {
      storeId
      storeName
      productCount
    }
  }
`;

export const ADMIN_GET_PRODUCTS_SOLD = gql`
  query AdminGetProductsSold($startDate: String, $endDate: String) {
    adminGetProductsSold(startDate: $startDate, endDate: $endDate) {
      productId
      productName
      totalQuantitySold
    }
  }
`;

export const ADMIN_GET_ORDERS_CREATED_BY_STORES = gql`
  query AdminGetOrdersCreatedByStores($startDate: String, $endDate: String) {
    adminGetOrdersCreatedByStores(startDate: $startDate, endDate: $endDate) {
      storeId
      storeName
      orderCount
    }
  }
`;

export const ADMIN_GET_ORDERS_CREATED_BY_BUYERS = gql`
  query AdminGetOrdersCreatedByBuyers($startDate: String, $endDate: String) {
    adminGetOrdersCreatedByBuyers(startDate: $startDate, endDate: $endDate) {
      userId
      userName
      orderCount
    }
  }
`;

export const ADMIN_GET_NEW_USERS_COUNT = gql`
  query AdminGetNewUsersCount($period: String!, $startDate: String, $endDate: String) {
    adminGetNewUsersCount(period: $period, startDate: $startDate, endDate: $endDate) {
      date
      count
    }
  }
`;

export const ADMIN_GET_NEW_STORES_COUNT = gql`
  query AdminGetNewStoresCount($period: String!, $startDate: String, $endDate: String) {
    adminGetNewStoresCount(period: $period, startDate: $startDate, endDate: $endDate) {
      date
      count
    }
  }
`;

export const ADMIN_GET_CANCELLED_ORDERS = gql`
  query AdminGetCancelledOrders($period: String!, $startDate: String, $endDate: String) {
    adminGetCancelledOrders(period: $period, startDate: $startDate, endDate: $endDate) {
      date
      count
      totalAmount
    }
  }
`;

export const MY_NOTIFICATIONS_QUERY = gql`
  query MyNotifications {
    myNotifications {
      id
      type
      message
      isRead
      createdAt
      relatedEntityId
      relatedEntityType
    }
  }
`;

export const GET_ALL_STORE_CATEGORIES = gql`
  query GetAllStoreCategories {
    getAllStoreCategories {
      id
      name
    }
  }
`;

export const GET_AVAILABLE_STORE_COUNTRIES = gql`
  query GetAvailableStoreCountries {
    getAvailableStoreCountries
  }
`;

export const ADMIN_GET_ALL_COUNTRIES = gql`
  query AdminGetAllCountries {
    adminGetAllCountries {
      id
      name
      code
      currencyCode
      currencySymbol
      isActive
    }
  }
`;

export const GET_ALL_ACTIVE_COUNTRIES = gql`
  query GetAllActiveCountries {
    getAllActiveCountries {
      id
      name
      code
      currencyCode
      currencySymbol
      isActive
    }
  }
`;
export const GET_USER_BY_ID = gql`
  query GetUserById($id: ID!) {
    user(id: $id) {
      id
      name
      email
      role
      isVerified
      status
      createdAt
      updatedAt
    }
  }
`;

export const GET_FILTERED_STORES = gql`
  query GetFilteredStores($search: String, $sortBy: StoreSortBy, $sortOrder: SortOrder, $storeCategoryIds: [ID]) {
    getAllStores(search: $search, sortBy: $sortBy, sortOrder: $sortOrder, storeCategoryIds: $storeCategoryIds) {
      id
      name
      description
      imageUrl
      owner {
        name
      }
      country {
        id
        name
      }
    }
  }
`;

export const GET_STORES_BY_LOCATION = gql`
  query GetStoresByLocation($latitude: Float!, $longitude: Float!, $radius: Float!) {
    getStoresByLocation(latitude: $latitude, longitude: $longitude, radius: $radius) {
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
      latitude
      longitude
      averageRating
    }
  }
`;

export const GET_ALL_STORES_WITH_PLANS = gql`
  query GetAllStoresWithPlans {
    adminGetAllStores {
      id
      name
      plan
      esDestacado
      trialExpiresAt
    }
  }
`;

export const GET_ALL_PRODUCTS_FOR_MONETIZATION = gql`
  query GetAllProductsForMonetization {
    adminGetAllProducts {
      id
      name
      esDestacado
      insignias
    }
  }
`;