import dynamicAPI from './dynamicAPI'

const url = '/api/orders'

export const getOrders = async (page, search) =>
  await dynamicAPI('get', `${url}?page=${page}&search=${search}`, {})

export const addOrder = async (obj) => await dynamicAPI('post', url, obj)

export const updateOrder = async (obj) =>
  await dynamicAPI('put', `${url}/${obj._id}`, obj)

export const deleteOrder = async (id) =>
  await dynamicAPI('delete', `${url}/${id}`, {})

export const getOrderDetail = async (id) =>
  await dynamicAPI('get', `${url}/detail/${id}`, {})

export const receiptOrder = async (obj) =>
  await dynamicAPI('post', `${url}/receipt?q=${obj}`, {})

export const updateReceipt = async (obj) =>
  await dynamicAPI('put', `${url}/receipt`, obj)
