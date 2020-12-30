import { Reducer, Dispatch, useState, useCallback, useEffect, useRef, useReducer } from 'react';
import { useRouter } from 'next/router';
import { hasParentElement, splitOnLastElement } from './utils';
import { browser } from 'process';

export function useParameterizedReducer<S, A>(
  reducer: Reducer<S, A>,
  defaultState: S,
  setInitialState: (state: S) => A,
): [S, Dispatch<A>] {
  const router = useRouter();
  const hasSetInitialState = useRef(false);
  const previousQueryState = useRef(defaultState);

  const [state, dispatch] = useReducer(reducer, defaultState);

  useEffect(() => {
    const hasNoQueryParameters = typeof window === 'undefined' || [...new URLSearchParams(window.location.search).keys()].length == 0;

    if (!hasSetInitialState.current && (Object.entries(router.query).length > 0 || hasNoQueryParameters)) {
      dispatch(setInitialState(
        Object.entries(router.query)
          .filter(([key]) => Object.keys(defaultState).indexOf(key) !== -1)
          .reduce((acc, [key, value]) => {
            try {
              return {
                ...acc,
                [key]: JSON.parse(decodeURIComponent(value as string)),
              }
            } catch {
              return acc;
            }
          }, defaultState)
      ));

      hasSetInitialState.current = true;
    }
  }, [router.query, defaultState, dispatch]);

  useEffect(() => {
    if (hasSetInitialState.current && previousQueryState.current !== state)  {
      const updatedQueryParams = (Object.entries(state) as [keyof S, unknown][]).reduce((acc, [key, value]) => {
        const normalizedValue = typeof defaultState[key] === 'number' ? Number(value) : value;

        if (JSON.stringify(normalizedValue) === JSON.stringify(defaultState[key])) {
          return acc;
        } else {
          return { ...acc, [key]: encodeURIComponent(JSON.stringify(normalizedValue)) };
        }
      }, {});

      previousQueryState.current = state;

      router.push(
        {
          pathname: router.pathname, 
          query: updatedQueryParams,
        },
        undefined,
        { shallow: true },
      );
    }
  }, [router.pathname, router.query, state, defaultState]);

  return [state, dispatch];
}

export function useParameterizedState<T>(paramName: string, defaultValue: T): [T, (value: T) => void, () => void] {
  const router = useRouter();
  const hasSetInitialState = useRef(false);

  const [state, setState] = useState(defaultValue);

  useEffect(() => {
    if (!hasSetInitialState.current && router.query[paramName] !== undefined) {
      hasSetInitialState.current = true;
      const paramValue = router.query[paramName];

      if (paramValue === null) {
        setState(defaultValue);
      } else {
        try {
          setState(JSON.parse(decodeURIComponent(paramValue as string)));
        } catch {
          setState(defaultValue);
        }
      }
    }
  }, [router.query])
  
  const updateState = useCallback(value => {
    const normalizedValue = typeof defaultValue === 'number' ? Number(value) : value;
    setState(normalizedValue);

    hasSetInitialState.current = true;

    let updatedQueryParams = {
      ...router.query,
      [paramName]: encodeURIComponent(JSON.stringify(normalizedValue)),
    };

    if (JSON.stringify(normalizedValue) === JSON.stringify(defaultValue)) {
      updatedQueryParams = Object.entries(updatedQueryParams).filter(([key]) => key !== paramName).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value,
      }), {});
    }

    router.push(
      {
        pathname: router.pathname, 
        query: updatedQueryParams,
      },
      undefined,
      { shallow: true },
    );
  }, [router.pathname, router.query, paramName, defaultValue]);

  const resetState = useCallback(() => {
    setState(defaultValue);
  }, [defaultValue]);

  return [state, updateState, resetState];
}

export function useGridCopy(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const handleCopy = (event: ClipboardEvent) => {
      event.stopPropagation();
      event.preventDefault();
      
      if(ref.current && event.target instanceof HTMLElement && hasParentElement(event.target, ref.current)) {
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);
        const elementsFromAncestorSelections = (range?.commonAncestorContainer as Element).getElementsByTagName('*');

        const allSelectedElements = Array.from(elementsFromAncestorSelections).reduce<Element[]>((elements, element) => {
          const excluded = element.getAttribute('data-range-excluded');
          
          return selection?.containsNode(element, true) && !excluded ? [...elements, element] : elements
        }, []);

        const [, groups] = allSelectedElements.reduce<[Element | null, Element[][]]>(([parent, groups], element) => {
          const [remainingGroups, lastGroup] = splitOnLastElement(groups);

          if (parent && hasParentElement(element, parent)) {
            return [parent, [...remainingGroups, [...(lastGroup || []), element]]];
          } else {
            return [element, [...groups, []]];
          }
        }, [null, []]);

        const text = groups.map(row => {
          const mergedLineContents = row.reduce<string[]>((acc, element) => {
            const [remainingSegments, lastSegment] = splitOnLastElement(acc);
            const cellContents = element.textContent?.trim() ?? '';
            
            if (element.getAttribute('data-range-merge')) {
              return [...remainingSegments, (lastSegment ?? '') + cellContents];
            } else {
              return [...acc, cellContents];
            }
          }, []);

          return mergedLineContents.join('\t\t\t');
        }).join('\n');

        navigator.clipboard.writeText(text);
      }
    };

    document.body.addEventListener('copy', handleCopy);

    return () => {
      document.body.removeEventListener('copy', handleCopy);
    };
  }, []);
}