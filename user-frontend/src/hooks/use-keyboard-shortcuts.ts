import { useEffect, useCallback, useRef } from 'react';
import { eventBus } from '@/lib/event-bus';
import { performanceService } from '@/services/performance-service';

type KeyCombo = string | string[];
type ShortcutCallback = (e: KeyboardEvent) => void;
type KeyMap = Map<string, Set<ShortcutCallback>>;

interface ShortcutOptions {
  preventDefault?: boolean;
  stopPropagation?: boolean;
  enableOnInput?: boolean;
  group?: string;
}

interface ShortcutRegistration {
  id: string;
  combo: KeyCombo;
  callback: ShortcutCallback;
  options: ShortcutOptions;
}

export function useKeyboardShortcuts() {
  const shortcutsRef = useRef<KeyMap>(new Map());
  const registrationsRef = useRef<Map<string, ShortcutRegistration>>(new Map());
  const activeGroupRef = useRef<string | null>(null);

  const normalizeKeyCombo = (combo: KeyCombo): string[] => {
    if (typeof combo === 'string') {
      return [combo.toLowerCase()];
    }
    return combo.map(k => k.toLowerCase());
  };

  const matchesCombo = (event: KeyboardEvent, combo: string[]): boolean => {
    const pressedKeys: string[] = [];
    
    if (event.ctrlKey) pressedKeys.push('ctrl');
    if (event.altKey) pressedKeys.push('alt');
    if (event.shiftKey) pressedKeys.push('shift');
    if (event.metaKey) pressedKeys.push('meta');
    
    pressedKeys.push(event.key.toLowerCase());

    if (pressedKeys.length !== combo.length) return false;
    return combo.every(key => pressedKeys.includes(key));
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    performanceService.startMeasure('keyboard:shortcut');

    // Skip if target is an input element and shortcut doesn't allow it
    if (
      event.target instanceof HTMLElement &&
      ['INPUT', 'TEXTAREA'].includes(event.target.tagName) &&
      !registrationsRef.current.get(event.key)?.options.enableOnInput
    ) {
      return;
    }

    shortcutsRef.current.forEach((callbacks, comboStr) => {
      const combo = comboStr.split('+');
      if (matchesCombo(event, combo)) {
        callbacks.forEach(callback => {
          const registration = Array.from(registrationsRef.current.values())
            .find(r => r.callback === callback);

          if (!registration) return;

          // Check if shortcut belongs to active group
          if (registration.options.group && registration.options.group !== activeGroupRef.current) {
            return;
          }

          if (registration.options.preventDefault) {
            event.preventDefault();
          }
          if (registration.options.stopPropagation) {
            event.stopPropagation();
          }

          try {
            callback(event);
            performanceService.endMeasure('keyboard:shortcut', {
              combo: comboStr,
              success: true,
            });
          } catch (error) {
            console.error('Error in keyboard shortcut handler:', error);
            performanceService.endMeasure('keyboard:shortcut', {
              combo: comboStr,
              success: false,
              error,
            });
          }
        });
      }
    });
  }, []);

  const register = useCallback((
    combo: KeyCombo,
    callback: ShortcutCallback,
    options: ShortcutOptions = {}
  ): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const normalizedCombo = normalizeKeyCombo(combo);
    const comboStr = normalizedCombo.join('+');

    if (!shortcutsRef.current.has(comboStr)) {
      shortcutsRef.current.set(comboStr, new Set());
    }

    const callbacks = shortcutsRef.current.get(comboStr)!;
    callbacks.add(callback);

    registrationsRef.current.set(id, {
      id,
      combo: normalizedCombo,
      callback,
      options,
    });

    eventBus.emit('shortcut:registered', {
      id,
      combo: normalizedCombo,
      group: options.group,
    });

    return id;
  }, []);

  const unregister = useCallback((id: string) => {
    const registration = registrationsRef.current.get(id);
    if (!registration) return;

    const comboStr = Array.isArray(registration.combo) 
      ? registration.combo.join('+') 
      : registration.combo;
    const callbacks = shortcutsRef.current.get(comboStr);
    
    if (callbacks) {
      callbacks.delete(registration.callback);
      if (callbacks.size === 0) {
        shortcutsRef.current.delete(comboStr);
      }
    }

    registrationsRef.current.delete(id);
    eventBus.emit('shortcut:unregistered', { id });
  }, []);

  const setActiveGroup = useCallback((group: string | null) => {
    activeGroupRef.current = group;
    eventBus.emit('shortcut:group:changed', { group });
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      shortcutsRef.current.clear();
      registrationsRef.current.clear();
    };
  }, [handleKeyDown]);

  return {
    register,
    unregister,
    setActiveGroup,
  };
}