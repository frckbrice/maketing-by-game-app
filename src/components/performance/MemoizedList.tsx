'use client';

import React, { useCallback, useMemo } from 'react';

interface MemoizedListProps<T> {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  itemHeight?: number;
  containerHeight?: number;
  enableVirtualization?: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
}

function MemoizedList<T>({
  data,
  keyExtractor,
  renderItem,
  className = '',
  itemHeight = 100,
  containerHeight = 400,
  enableVirtualization = false,
  onEndReached,
  onEndReachedThreshold = 0.8,
}: MemoizedListProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Memoize the rendered items to prevent unnecessary re-renders
  const memoizedItems = useMemo(() => {
    return data.map((item, index) => ({
      key: keyExtractor(item, index),
      content: renderItem(item, index),
      item,
      index,
    }));
  }, [data, keyExtractor, renderItem]);

  // Handle infinite scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!onEndReached) return;

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage >= onEndReachedThreshold) {
      onEndReached();
    }
  }, [onEndReached, onEndReachedThreshold]);

  // Simple virtualization for very large lists
  if (enableVirtualization && data.length > 100) {
    const [scrollTop, setScrollTop] = React.useState(0);
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      data.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight)
    );
    const totalHeight = data.length * itemHeight;
    const visibleItems = memoizedItems.slice(visibleStart, visibleEnd + 1);

    return (
      <div
        ref={parentRef}
        className={`overflow-auto ${className}`}
        style={{ height: containerHeight }}
        onScroll={(e) => {
          setScrollTop(e.currentTarget.scrollTop);
          handleScroll(e);
        }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleItems.map((item, index) => (
            <div
              key={item.key}
              style={{
                position: 'absolute',
                top: (visibleStart + index) * itemHeight,
                left: 0,
                right: 0,
                height: itemHeight,
              }}
            >
              {item.content}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Regular rendering for smaller lists
  return (
    <div
      className={`${className}`}
      onScroll={handleScroll}
    >
      {memoizedItems.map((item) => (
        <MemoizedItem key={item.key} content={item.content} />
      ))}
    </div>
  );
}

// Memoized individual item to prevent unnecessary re-renders
const MemoizedItem = React.memo<{ content: React.ReactNode }>(
  ({ content }) => <>{content}</>,
  // Custom comparison function for complex content
  (prevProps, nextProps) => {
    // Use JSON.stringify for simple comparison
    //TODO if needed: In production, you might want a more sophisticated comparison
    return JSON.stringify(prevProps.content) === JSON.stringify(nextProps.content);
  }
);

MemoizedItem.displayName = 'MemoizedItem';

export default React.memo(MemoizedList) as typeof MemoizedList;