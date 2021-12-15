import dynamicAPI from './dynamicAPI'

const url = '/api/orders'

export const getOrders = async () => await dynamicAPI('get', url, {})

export const addOrder = async (obj) => await dynamicAPI('post', url, obj)

export const updateOrder = async (obj) =>
  await dynamicAPI('put', `${url}/${obj._id}`, obj)

export const deleteOrder = async (id) =>
  await dynamicAPI('delete', `${url}/${id}`, {})
