import { useMutation, useQuery, useQueryClient } from 'react-query';
import API from 'utils/api/joanie';
import { useSession } from 'data/SessionProvider';
import { useLocalizedQueryKey } from 'utils/react-query/useLocalizedQueryKey';
import { REACT_QUERY_SETTINGS } from 'settings';
import { APIResponseError } from 'types/api';

export const useOrders = () => {
  const QUERY_KEY = useLocalizedQueryKey(['user', 'orders']);
  const queryClient = useQueryClient();
  const { user } = useSession();

  const handleError = (error: APIResponseError) => {
    if (error.code === 401) {
      queryClient.invalidateQueries('user');
    }
  };

  const readHandler = useQuery(QUERY_KEY, () => API().user.orders.get(), {
    enabled: !!user,
    onError: handleError,
    staleTime: REACT_QUERY_SETTINGS.staleTimes.sessionItems,
  });

  const prefetch = async () => {
    await queryClient.prefetchQuery(QUERY_KEY, () => API().user.orders.get(), {
      staleTime: REACT_QUERY_SETTINGS.staleTimes.sessionItems,
    });
  };

  const creationHandler = useMutation(API().user.orders.create, {
    onError: handleError,
    // TODO What do we do when an order is created
    onSettled: (_, __, variables) => {
      // queryClient.invalidateQueries(QUERY_KEY);
      // queryClient.invalidateQueries(['user', 'course', variables.course]);
    },
  });

  const abortHandler = useMutation(API().user.orders.abort, {
    onError: handleError,
    // TODO What do we do when an order is aborted
    onSettled: (_, __, variables) => {
      // queryClient.invalidateQueries(QUERY_KEY);
      // queryClient.invalidateQueries(['user', 'course', variables.course]);
    },
  });

  const invalidate = () => {
    // Invalidate all order's queries no matter the locale
    const unlocalizedQueryKey = QUERY_KEY.slice(0, -1);
    queryClient.invalidateQueries(unlocalizedQueryKey);
  };

  return {
    items: readHandler.data?.results,
    methods: {
      abort: abortHandler.mutateAsync,
      create: creationHandler.mutateAsync,
      invalidate,
      prefetch,
      refetch: readHandler.refetch,
    },
    states: {
      fetching: readHandler.isLoading,
      creating: creationHandler.isLoading,
      aborting: abortHandler.isLoading,
    },
  };
};
