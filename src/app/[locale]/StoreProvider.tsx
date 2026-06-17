'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/lib/store/store';
import SessionInactivityHandler from '@/components/auth/SessionInactivityHandler';

export default function StoreProvider({
  children
}: {
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore>(undefined);

  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  // Ensure you are using the 'Provider' component as a tag, not a type
  return (
    <Provider store={storeRef.current}>
      <SessionInactivityHandler />
      {children}
    </Provider>
  );
}
