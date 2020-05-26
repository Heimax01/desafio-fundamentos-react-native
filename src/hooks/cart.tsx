import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsJson = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (productsJson) {
        setProducts(JSON.parse(productsJson));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productIndex = products.findIndex(prod => prod.id === product.id);

      if (productIndex >= 0) {
        products[productIndex].quantity = Number(
          products[productIndex].quantity + 1,
        );
        setProducts([...products]);
      } else {
        setProducts([
          ...products,
          { ...product, quantity: product.quantity + 1 },
        ]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products, setProducts],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(prod => prod.id === id);
      if (productIndex >= 0) {
        products[productIndex].quantity = Number(
          products[productIndex].quantity + 1,
        );
        setProducts([...products]);
      }
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products, setProducts],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(prod => prod.id === id);
      if (productIndex >= 0) {
        if (products[productIndex].quantity - 1 > 0) {
          products[productIndex].quantity = Number(
            products[productIndex].quantity - 1,
          );

          setProducts([...products]);
        }
      }
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products, setProducts],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
