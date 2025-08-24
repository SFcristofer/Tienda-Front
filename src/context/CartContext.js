import React, { createContext, useContext, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { MY_CART_QUERY } from '../graphql/queries';
import {
  ADD_TO_CART,
  REMOVE_FROM_CART,
  UPDATE_CART_ITEM_QUANTITY,
  CLEAR_CART,
  REMOVE_ITEMS_FROM_CART, // Import new mutation
} from '../graphql/mutations';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const token = localStorage.getItem('token'); // Obtener el token para saber si el usuario está logueado

  const { data, loading, error, refetch } = useQuery(MY_CART_QUERY, { skip: !token, fetchPolicy: 'network-only' });

  const [addToCartMutation] = useMutation(ADD_TO_CART, { onCompleted: () => refetch() });
  const [removeFromCartMutation] = useMutation(REMOVE_FROM_CART, { onCompleted: () => refetch() });
  const [updateQuantityMutation] = useMutation(UPDATE_CART_ITEM_QUANTITY, {
    onCompleted: () => refetch(),
  });
  const [clearCartMutation] = useMutation(CLEAR_CART, { onCompleted: () => refetch() });
  const [removeItemsFromCartMutation] = useMutation(REMOVE_ITEMS_FROM_CART, { onCompleted: () => refetch() }); // New mutation hook

  const cartItems = data?.myCart?.items || [];

  const addToCart = async (product) => {
    await addToCartMutation({ variables: { productId: product.id, quantity: 1 } });
  };

  const removeFromCart = async (productId) => {
    await removeFromCartMutation({ variables: { productId } });
  };

  const updateQuantity = async (productId, quantity) => {
    await updateQuantityMutation({ variables: { productId, quantity: parseInt(quantity) } });
  };

  const clearEntireCart = async () => {
    await clearCartMutation();
  };

  const removePurchasedItems = async (productIds) => {
    if (productIds && productIds.length > 0) {
      await removeItemsFromCartMutation({ variables: { productIds } });
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems
      .reduce((total, item) => total + item.quantity * item.product.price, 0)
      .toFixed(2);
  };

  const getFormattedCartItems = () => {
    return cartItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      priceAtOrder: item.product.price, // Usamos el precio actual del producto
    }));
  };

  const getGroupedCartItemsByStore = () => {
    const groupedItems = {};
    console.log('--- CartContext Debug: getGroupedCartItemsByStore ---');
    console.log('Initial cartItems:', cartItems);

    cartItems.forEach((item) => {
      // Defensive checks for product and store existence
      if (!item || !item.product || !item.product.store || !item.product.store.id) {
        console.warn('Skipping item due to missing product or store information:', item);
        return; // Skip this item if essential data is missing
      }

      const storeId = item.product.store.id;
      console.log(`Processing item: ${item.product.name} (ID: ${item.product.id}), Product Store ID: ${item.product.store.id}, Grouping under Store ID: ${storeId}`);

      if (!groupedItems[storeId]) {
        groupedItems[storeId] = {
          store: item.product.store,
          items: [],
          totalAmount: 0,
        };
        console.log(`Created new group for store: ${item.product.store.name} (ID: ${storeId})`);
      }
      groupedItems[storeId].items.push(item);
      groupedItems[storeId].totalAmount += item.quantity * item.product.price;
    });
    console.log('Final groupedItems result:', groupedItems);
    console.log('--------------------------------------------------');
    return Object.values(groupedItems);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearEntireCart, // Renamed for clarity
        removePurchasedItems, // New function
        getTotalItems,
        getTotalPrice,
        getFormattedCartItems,
        getGroupedCartItemsByStore,
        loading,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
