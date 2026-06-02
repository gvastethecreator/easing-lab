import { useState, useCallback } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

/**
 * Type guard para validar objetos indexables sin usar type assertions inseguras.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Compara dos valores de manera estructural.
 * Soporta primitivos, arrays y objetos planos.
 */
function areValuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }

  if (typeof left !== typeof right) {
    return false;
  }

  if (left === null || right === null) {
    return false;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return false;
    }

    for (let index = 0; index < left.length; index += 1) {
      if (!areValuesEqual(left[index], right[index])) {
        return false;
      }
    }

    return true;
  }

  if (isRecord(left) && isRecord(right)) {
    const leftObject = left;
    const rightObject = right;
    const leftKeys = Object.keys(leftObject);
    const rightKeys = Object.keys(rightObject);

    if (leftKeys.length !== rightKeys.length) {
      return false;
    }

    for (const key of leftKeys) {
      if (!(key in rightObject) || !areValuesEqual(leftObject[key], rightObject[key])) {
        return false;
      }
    }

    return true;
  }

  return false;
}

/**
 * Hook de historial genérico con soporte de undo/redo y actualizaciones transitorias.
 */
export function useHistory<T>(initialState: T, maxHistory = 50) {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => {
    setState((currentState) => {
      if (currentState.past.length === 0) return currentState;

      const previous = currentState.past[currentState.past.length - 1];
      const newPast = currentState.past.slice(0, currentState.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [currentState.present, ...currentState.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((currentState) => {
      if (currentState.future.length === 0) return currentState;

      const next = currentState.future[0];
      const newFuture = currentState.future.slice(1);

      return {
        past: [...currentState.past, currentState.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  /**
   * Updates the state.
   * @param newPresent The new state value.
   * @param commit If true, saves the previous state to history. If false, updates the current state in place (transient).
   */
  const set = useCallback(
    (newPresent: T, commit: boolean = true) => {
      setState((currentState) => {
        if (areValuesEqual(currentState.present, newPresent)) {
          return currentState;
        }

        if (!commit) {
          // Transient update: Replace 'present' but don't touch 'past'
          return {
            ...currentState,
            present: newPresent,
          };
        }

        const newPast = [...currentState.past, currentState.present];
        // Enforce max history limit
        if (newPast.length > maxHistory) {
          newPast.shift();
        }

        return {
          past: newPast,
          present: newPresent,
          future: [],
        };
      });
    },
    [maxHistory]
  );

  // Force override the entire history (useful when external props reset the state)
  const reset = useCallback((newState: T) => {
    setState({
      past: [],
      present: newState,
      future: [],
    });
  }, []);

  return {
    state: state.present,
    set,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    historyState: state,
  };
}
