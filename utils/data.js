export const routes = () => {
  return [
    {
      name: 'Home',
      menu: 'Normal',
      path: '/',
      isActive: true,
    },
    {
      name: 'User Logs',
      menu: 'Admin',
      path: '/admin/logon',
      isActive: true,
    },
    {
      name: 'Users',
      menu: 'Admin',
      path: '/admin/users',
      isActive: true,
    },
    {
      name: 'Groups',
      menu: 'Admin',
      path: '/admin/groups',
      isActive: true,
    },
    {
      name: 'Routes',
      menu: 'Admin',
      path: '/admin/routes',
      isActive: true,
    },
    {
      name: 'Profile',
      menu: 'Profile',
      path: '/profile',
      isActive: true,
    },
    {
      name: 'Search',
      menu: 'Normal',
      path: '/orders/search',
      isActive: true,
    },
  ]
}

export const groups = (ids) => {
  return [
    {
      name: 'admin',
      isActive: true,
      route: ids,
    },
  ]
}

export const users = () => {
  return [
    {
      password: '123456',
      name: 'Ahmed',
      email: 'ahmaat19@gmail.com',
      group: 'admin',
    },
  ]
}
