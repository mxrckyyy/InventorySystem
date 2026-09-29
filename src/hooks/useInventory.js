import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

const ALL_CATEGORIES = 'all';

function toMessage(error) {
  return error?.message || 'Unexpected error occurred';
}

export default function useInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);

  const fetchProducts = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);

    const { data, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(toMessage(fetchError));
    } else {
      setError(null);
      setProducts(data || []);
    }

    setLoading(false);
    return !fetchError;
  }, []);

  useEffect(() => {
    fetchProducts(true);
  }, [fetchProducts]);

  const refreshTimerRef = useRef(null);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) return;

    refreshTimerRef.current = setTimeout(() => {
      refreshTimerRef.current = null;
      fetchProducts();
    }, 250);
  }, [fetchProducts]);

  useEffect(() => {
    const channel = supabase
      .channel('inventory-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        scheduleRefresh
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stock_logs' },
        scheduleRefresh
      )
      .subscribe();

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      supabase.removeChannel(channel);
    };
  }, [scheduleRefresh]);

  const addProduct = useCallback(
    async (newProduct) => {
      const { data, error: insertError } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single();

      if (insertError) {
        setError(toMessage(insertError));
        return { success: false, error: toMessage(insertError) };
      }

      setError(null);
      await fetchProducts();
      return { success: true, data };
    },
    [fetchProducts]
  );

  const updateProduct = useCallback(
    async (id, updatedFields) => {
      const { error: updateError } = await supabase
        .from('products')
        .update(updatedFields)
        .eq('id', id);

      if (updateError) {
        setError(toMessage(updateError));
        return { success: false, error: toMessage(updateError) };
      }

      setError(null);
      await fetchProducts();
      return { success: true };
    },
    [fetchProducts]
  );

  const deleteProduct = useCallback(
    async (id) => {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (deleteError) {
        setError(toMessage(deleteError));
        return { success: false, error: toMessage(deleteError) };
      }

      setError(null);
      await fetchProducts();
      return { success: true };
    },
    [fetchProducts]
  );

  const adjustStock = useCallback(async (id, currentQuantity, changeAmount) => {
    const nextQuantity = Math.max(0, currentQuantity + changeAmount);
    const appliedChange = nextQuantity - currentQuantity;

    if (appliedChange === 0) {
      return { success: false, skipped: true };
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({ quantity: nextQuantity })
      .eq('id', id);

    if (updateError) {
      setError(toMessage(updateError));
      return { success: false, error: toMessage(updateError) };
    }

    const { error: logError } = await supabase.from('stock_logs').insert([
      {
        product_id: id,
        change_amount: appliedChange,
        type: appliedChange > 0 ? 'increment' : 'decrement'
      }
    ]);

    if (logError) {
      setError(toMessage(logError));
      return { success: false, error: toMessage(logError) };
    }

    setError(null);
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, quantity: nextQuantity } : product
      )
    );

    return { success: true, quantity: nextQuantity };
  }, []);

  const categories = useMemo(() => {
    const unique = new Set();
    products.forEach((product) => {
      if (product.category) unique.add(product.category);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        (product.name || '').toLowerCase().includes(query) ||
        (product.sku || '').toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === ALL_CATEGORIES ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  return {
    products,
    filteredProducts,
    categories,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    clearError: () => setError(null)
  };
}
