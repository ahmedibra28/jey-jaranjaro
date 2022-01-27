import dynamicAPI from './dynamicAPI'
import { useMutation, useQueryClient } from 'react-query'

const url = '/api/reports'

export default function useReports(page) {
  const queryClient = useQueryClient()

  // add transactions
  const searchTransactions = useMutation(
    async (obj) =>
      await dynamicAPI('post', `${url}/transactions?page=${page}`, obj),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['transactions']),
    }
  )

  const deleteTransaction = useMutation(
    async (id) => await dynamicAPI('delete', `${url}/${id}`, {}),
    {
      retry: 0,
      onSuccess: () => queryClient.invalidateQueries(['transactions']),
    }
  )

  return {
    searchTransactions,
    deleteTransaction,
  }
}
