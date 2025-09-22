import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import AuthContext from './AuthContext';
import { GET_MY_CART } from '../graphql/queries'; // Assuming you'll create this query
import { ADD_ITEM_TO_CART, UPDATE_CART_ITEM_QUANTITY, REMOVE_ITEM_FROM_CART, CLEAR_CART } from '../graphql/mutations'; // Assuming you'll create these mutations

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isLoggedIn, user } = useContext(AuthContext);
  const [localCart, setLocalCart] = useState([]); // For anonymous users
  const [serverCart, setServerCart] = useState(null); // For authenticated users

  // GraphQL operations
  const { data: serverCartData, refetch: refetchServerCart } = useQuery(GET_MY_CART, {
    skip: !isLoggedIn,
  });

  // Update serverCart when serverCartData changes
  useEffect(() => {
    if (serverCartData && serverCartData.myCart) {
      setServerCart(serverCartData.myCart);
    }
  }, [serverCartData]);

  const [addItemToCartMutation] = useMutation(ADD_ITEM_TO_CART);
  const [updateCartItemQuantityMutation] = useMutation(UPDATE_CART_ITEM_QUANTITY);
  const [removeItemFromCartMutation] = useMutation(REMOVE_ITEM_FROM_CART);
  const [clearCartMutation] = useMutation(CLEAR_CART);

  // Load local cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('anonymousCart');
    if (storedCart) {
      setLocalCart(JSON.parse(storedCart));
    }
  }, []);

  // Save local cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem('anonymousCart', JSON.stringify(localCart));
    }
  }, [localCart, isLoggedIn]);

  // Merge local cart with server cart when user logs in
  useEffect(() => {
    if (isLoggedIn && localCart.length > 0) {
      const mergeCarts = async () => {
        for (const item of localCart) {
          try {
            await addItemToCartMutation({
              variables: { productId: item.product.id, quantity: item.quantity },
            });
          } catch (error) {
            console.error('Error merging cart item:', item, error);
          }
        }
        setLocalCart([]); // Clear local cart after merging
        localStorage.removeItem('anonymousCart');
        refetchServerCart(); // Refetch server cart to get merged state
      };
      mergeCarts();
    }
  }, [isLoggedIn, localCart, addItemToCartMutation, refetchServerCart]);

  const getCartItems = useCallback(() => {
    console.log('getCartItems re-evaluated', { isLoggedIn, serverCart, localCart });
    return isLoggedIn ? (serverCart?.items || []) : localCart;
  }, [isLoggedIn, serverCart, localCart]);

  const getCartTotal = useCallback(() => {
    console.log('getCartTotal re-evaluated', getCartItems());
    return getCartItems().reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [getCartItems]);

  const addToCart = useCallback(async (product, quantity) => {
    if (isLoggedIn) {
      try {
        await addItemToCartMutation({ variables: { productId: product.id, quantity } });
        refetchServerCart();
      } catch (error) {
        console.error('Error adding item to server cart:', error);
        // Optionally, handle error by adding to local cart or showing a message
      }
    } else {
      setLocalCart((prevCart) => {
        const existingItemIndex = prevCart.findIndex((item) => item.product.id === product.id);
        if (existingItemIndex > -1) {
          const newCart = [...prevCart];
          newCart[existingItemIndex].quantity += quantity;
          return newCart;
        } else {
          return [...prevCart, { product, quantity }];
        }
      });
    }
  }, [isLoggedIn, addItemToCartMutation, refetchServerCart]);

  const updateCartItemQuantity = useCallback(async (cartItemId, productId, quantity) => {
    if (isLoggedIn) {
      try {
        await updateCartItemQuantityMutation({ variables: { cartItemId, quantity } });
        refetchServerCart();
      } catch (error) {
        console.error('Error updating server cart item quantity:', error);
      }
    } else {
      setLocalCart((prevCart) => {
        const existingItemIndex = prevCart.findIndex((item) => item.product.id === productId);
        if (existingItemIndex > -1) {
          const newCart = [...prevCart];
          if (quantity <= 0) {
            newCart.splice(existingItemIndex, 1);
          } else {
            newCart[existingItemIndex].quantity = quantity;
          }
          return newCart;
        }
        return prevCart;
      });
    }
  }, [isLoggedIn, updateCartItemQuantityMutation, refetchServerCart]);

  const removeItemFromCart = useCallback(async (cartItemId, productId) => {
    if (isLoggedIn) {
      try {
        await removeItemFromCartMutation({ variables: { cartItemId } });
        refetchServerCart();
      } catch (error) {
        console.error('Error removing item from server cart:', error);
      }
    } else {
      setLocalCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
    }
  }, [isLoggedIn, removeItemFromCartMutation, refetchServerCart]);

  const clearCart = useCallback(async () => {
    if (isLoggedIn) {
      try {
        await clearCartMutation();
        refetchServerCart();
      } catch (error) {
        console.error('Error clearing server cart:', error);
      }
    } else {
      setLocalCart([]);
    }
  }, [isLoggedIn, clearCartMutation, refetchServerCart]);

  const cartItemCount = getCartItems().reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems: getCartItems(),
        cartTotal: getCartTotal(),
        cartItemCount,
        addToCart,
        updateCartItemQuantity,
        removeItemFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
