import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { MY_CART_QUERY } from '../graphql/queries';
import {
  ADD_TO_CART,
  REMOVE_FROM_CART,
  UPDATE_CART_ITEM_QUANTITY,
  CLEAR_CART,
  REMOVE_ITEMS_FROM_CART, // Import new mutation
} from '../graphql/mutations';
import { useSnackbar } from './SnackbarContext'; // Import the useSnackbar hook

const CartContext = createContext();

const GUEST_CART_KEY = 'guestCart';

export const CartProvider = ({ children }) => {
  const { t } = useTranslation();
  const token = localStorage.getItem('token'); // Obtener el token para saber si el usuario está logueado
  const [guestCartItems, setGuestCartItems] = useState([]);
  const { showSnackbar } = useSnackbar(); // Use the snackbar

  // Load guest cart from local storage on initial mount if no token
  useEffect(() => {
    if (!token) {
      const storedCart = localStorage.getItem(GUEST_CART_KEY);
      if (storedCart) {
        try {
          setGuestCartItems(JSON.parse(storedCart));
        } catch (e) {
          console.error("Failed to parse guest cart from local storage", e);
          localStorage.removeItem(GUEST_CART_KEY); // Clear corrupted data
        }
      }
    }
  }, [token]); // Depend on token to re-evaluate when user logs in/out

  // Effect to handle cart merging on login and clearing on logout
  useEffect(() => {
    if (token) {
      // User logged in, ensure we have the latest backend cart before merging
      refetch().then(() => { // Refetch and then proceed with merging
        mergeCartsOnLogin();
      });
    } else {
      // User logged out, ensure local storage is the source of truth
      // (already handled by the first useEffect, but good to be explicit if needed)
    }
  }, [token]); // Depend on token

  const { data, loading, error, refetch } = useQuery(MY_CART_QUERY, { skip: !token, fetchPolicy: 'network-only' });

  const [addToCartMutation] = useMutation(ADD_TO_CART, { onCompleted: () => refetch() });
  const [removeFromCartMutation] = useMutation(REMOVE_FROM_CART, { onCompleted: () => refetch() });
  const [updateQuantityMutation] = useMutation(UPDATE_CART_ITEM_QUANTITY, {
    onCompleted: () => refetch(),
  });
  const [clearCartMutation] = useMutation(CLEAR_CART, { onCompleted: () => refetch() });
  const [removeItemsFromCartMutation] = useMutation(REMOVE_ITEMS_FROM_CART, { onCompleted: () => refetch() }); // New mutation hook

  const cartItems = data?.myCart?.items || [];

  const getCurrentCartItems = () => {
    return token ? (data?.myCart?.items || []) : guestCartItems;
  };

  const addToCart = async (product) => {
    const message = t('addedToCart', { productName: product.name });
    const action = { label: t('viewCart'), path: '/cart' };

    if (token) {
      // Logged in user: use backend mutation
      await addToCartMutation({ variables: { productId: product.id, quantity: 1 } });
      showSnackbar(message, 'success', action);
    } else {
      // Guest user: update local storage cart
      const currentGuestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
      const existingItemIndex = currentGuestCart.findIndex(item => item.product.id === product.id);

      if (existingItemIndex > -1) {
        // Item already in cart, update quantity
        currentGuestCart[existingItemIndex].quantity += 1;
      } else {
        // Item not in cart, add new item
        // Ensure product has necessary info for display (name, price, imageUrl, store.id, store.name)
        currentGuestCart.push({
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            currency: product.currency,
            imageUrl: product.imageUrl,
            store: {
              id: product.store.id,
              name: product.store.name,
            },
          },
          quantity: 1,
        });
      }
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(currentGuestCart));
      setGuestCartItems(currentGuestCart); // Update state to trigger re-render
      showSnackbar(message, 'success', action);
    }
  };

  const removeFromCart = async (productId) => {
    if (token) {
      // Logged in user: use backend mutation
      await removeFromCartMutation({ variables: { productId } });
    } else {
      // Guest user: update local storage cart
      const currentGuestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
      const updatedCart = currentGuestCart.filter(item => item.product.id !== productId);
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updatedCart));
      setGuestCartItems(updatedCart); // Update state to trigger re-render
    }
  };

  const updateQuantity = async (productId, quantity) => {
    const parsedQuantity = parseInt(quantity);
    if (token) {
      // Logged in user: use backend mutation
      await updateQuantityMutation({ variables: { productId, quantity: parsedQuantity } });
    } else {
      // Guest user: update local storage cart
      const currentGuestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
      const existingItemIndex = currentGuestCart.findIndex(item => item.product.id === productId);

      if (existingItemIndex > -1) {
        if (parsedQuantity > 0) {
          currentGuestCart[existingItemIndex].quantity = parsedQuantity;
        } else {
          // Remove item if quantity is 0 or less
          currentGuestCart.splice(existingItemIndex, 1);
        }
      }
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(currentGuestCart));
      setGuestCartItems(currentGuestCart); // Update state to trigger re-render
    }
  };

  const clearEntireCart = async () => {
    if (token) {
      // Logged in user: use backend mutation
      await clearCartMutation();
    } else {
      // Guest user: clear local storage cart
      localStorage.removeItem(GUEST_CART_KEY);
      setGuestCartItems([]); // Update state to trigger re-render
    }
  };

  const removePurchasedItems = async (productIds) => {
    if (token) {
      // Logged in user: use backend mutation
      if (productIds && productIds.length > 0) {
        await removeItemsFromCartMutation({ variables: { productIds } });
      }
    } else {
      // Guest user: update local storage cart
      let currentGuestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
      const updatedCart = currentGuestCart.filter(item => !productIds.includes(item.product.id));
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updatedCart));
      setGuestCartItems(updatedCart); // Update state to trigger re-render
    }
  };

  const getTotalItems = () => {
    return getCurrentCartItems().reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return getCurrentCartItems()
      .reduce((total, item) => total + item.quantity * item.product.price, 0)
      .toFixed(2);
  };

  const getFormattedCartItems = () => {
    return getCurrentCartItems().map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      priceAtOrder: item.product.price, // Usamos el precio actual del producto
    }));
  };

  const getGroupedCartItemsByStore = () => {
    const groupedItems = {};
    console.log('--- CartContext Debug: getGroupedCartItemsByStore ---');
    console.log('Initial cartItems:', getCurrentCartItems());

    getCurrentCartItems().forEach((item) => {
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

  const mergeCartsOnLogin = async () => {
    const storedGuestCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
    if (storedGuestCart.length === 0) {
      return; // No items to merge
    }

    console.log('--- Merging Guest Cart ---');
    const currentBackendCartItems = data?.myCart?.items || [];
    const promises = [];

    for (const guestItem of storedGuestCart) {
      const existingBackendItem = currentBackendCartItems.find(
        (item) => item.product.id === guestItem.product.id
      );

      if (existingBackendItem) {
        // Item exists, update quantity
        const newQuantity = existingBackendItem.quantity + guestItem.quantity;
        promises.push(
          updateQuantityMutation({
            variables: { productId: guestItem.product.id, quantity: newQuantity },
          })
        );
      } else {
        // Item does not exist, add it
        promises.push(
          addToCartMutation({
            variables: { productId: guestItem.product.id, quantity: guestItem.quantity },
          })
        );
      }
    }

    try {
      await Promise.all(promises); // Execute all mutations
      localStorage.removeItem(GUEST_CART_KEY); // Clear guest cart
      setGuestCartItems([]); // Clear guest cart state
      await refetch(); // Refetch the final cart state
      console.log('--- Guest cart merged successfully ---');
    } catch (error) {
      console.error('Failed to merge carts:', error);
      // Optionally, show a snackbar error to the user
      showSnackbar(t('cartMergeError'), 'error');
    }
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
        mergeCartsOnLogin, // New function
        loading,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
