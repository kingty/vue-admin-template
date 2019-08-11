import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: 'Dashboard', icon: 'dashboard' }
    }]
  }
]


// const testAdmin = 1;
// const tester = 2;
// const reviewAdmin = 4;
// const mergeReviewer = 8;
// const reviewer = 16;
// const developer = 32;
/**
 * asyncRoutes
 * 
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/mergerequest',
    component: Layout,
    redirect: '/mergerequest',
    name: 'MR',
    meta: { title: 'Mr', icon: 'example' },
    children: [
      {
        roles: 28,
        path: '/codereview',
        name: 'Code Review',
        component: () => import('@/views/mergerequest/codereview'),
        meta: { title: 'Code Review', icon: 'eye-open' }
      },
      {
        roles: 32,
        path: '/mymr',
        name: 'My MR',
        component: () => import('@/views/mergerequest/mymr'),
        meta: { title: 'My MR', icon: 'people' }
      },
      {
        roles: 3,
        path: '/mytest',
        name: 'My Test',
        component: () => import('@/views/mergerequest/mytest'),
        meta: { title: 'My Test', icon: 'bug' }
      },
      {
        roles: 1,
        path: '/testmanage',
        name: 'Test Manage',
        component: () => import('@/views/mergerequest/testmanage'),
        meta: { title: 'Test Manage', icon: 'skill' }
      },
      {
        roles: 4,
        path: '/reviewmanage',
        name: 'Review Manage',
        component: () => import('@/views/mergerequest/reviewmanage'),
        meta: { title: 'Review Manage', icon: 'skill' }
      },
      {
        path: '/allmrs',
        name: 'AllMrs',
        component: () => import('@/views/mergerequest/allmrs'),
        meta: { title: 'All Mr', icon: 'list' }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
