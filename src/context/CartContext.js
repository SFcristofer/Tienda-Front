import React, { createContext, useContext, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { MY_CART_QUERY } from '../graphql/queries';
import {
  ADD_TO_CART,
  REMOVE_FROM_CART,
  UPDATE_CART_ITEM_QUANTITY,
  CLEAR_CART,
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

  const clearCart = async () => {
    await clearCartMutation();
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
    console.log('Cart Items for grouping:', cartItems);
    cartItems.forEach((item) => {
      if (item.product && item.product.store) {
        const storeId = item.product.store.id;
        console.log(`Processing item: ${item.product.name}, Product Store ID: ${item.product.store.id}, Grouping Store ID: ${storeId}`);
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
      } else {
        console.warn('Skipping item due to missing product or store information:', item);
      }
    });
    console.log('Grouped Items result:', groupedItems);
    return Object.values(groupedItems);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        getFormattedCartItems,
        getGroupedCartItemsByStore, // Nueva función expuesta
        loading, // Exponer el estado de carga
        error, // Exponer el estado de error
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
