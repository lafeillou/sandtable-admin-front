import Vue from 'vue'
import Router from 'vue-router'
import MenuView from '@/views/common/MenuView'
import PageView from '@/views/common/PageView'
import LoginView from '@/views/login/Common'
import EmptyPageView from '@/views/common/EmptyPageView'
import HomePageView from '@/views/home'
import DZMap from '@/views/map/Map'
// import DZMapForPad from '@/views/map/DZMapForPad'
import db from 'utils/localstorage'
import request from 'utils/request'

// 全局Router异常处理
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => {
    if (typeof err !== 'undefined') console.log(err)
  })
}
Vue.use(Router)

let constRouter = [
  {
    path: '/login',
    name: '登录页',
    component: LoginView
  },
  {
    path: '/index',
    name: '首页',
    redirect: '/sandtable-target'
  },
  {
    path: '/map',
    name: '电子地图',
    component: DZMap
  },
  {
    path: '/graphs',
    name: '兵力部署统计图',
    component: () => import('@/views/graphs')
  }
  // pad 控制器上需要用到的定制电子地图
  // {
  //   path: '/mapForPad',
  //   name: 'pad专用地图',
  //   component: DZMapForPad
  // }
]

let router = new Router({
  routes: constRouter
})

const whiteList = ['/login']

let asyncRouter

// 导航守卫，渲染动态路由
router.beforeEach((to, from, next) => {
  if (whiteList.indexOf(to.path) !== -1) {
    next()
  }
  let token = db.get('USER_TOKEN')
  let user = db.get('USER')
  let userRouter = get('USER_ROUTER')
  if (token.length && user) {
    if (!asyncRouter) {
      if (!userRouter) {
        request
          .get(`menu/${user.username}`)
          .then(res => {
            asyncRouter = res.data
            asyncRouter[0].redirect = asyncRouter[0].children.length ? asyncRouter[0].children[0].path : '/'
            // 为了演示方便，给每一个用户，增加一个 电子地图 的 主页（一级路由）下面的 二级路由
            asyncRouter[0].children.unshift({
              path: '/link-graphs',
              name: '兵力部署统计',
              component: 'graphs/index',
              icon: 'fund',
              meta: { closeable: true, newWindow: true }
            })
            asyncRouter[0].children.unshift({
              path: '/link-map',
              name: '电子地图',
              component: 'map/Map',
              icon: 'global',
              meta: { closeable: true, newWindow: true }
            })
            save('USER_ROUTER', asyncRouter)
            go(to, next)
          })
          .catch(err => {
            console.error(err)
          })
      } else {
        asyncRouter = userRouter
        go(to, next)
      }
    } else {
      next()
    }
  } else {
    next('/login')
  }
})

function go(to, next) {
  asyncRouter = filterAsyncRouter(asyncRouter)
  router.addRoutes(asyncRouter)
  next({ ...to, replace: true })
}

function save(name, data) {
  localStorage.setItem(name, JSON.stringify(data))
}

function get(name) {
  return JSON.parse(localStorage.getItem(name))
}

function filterAsyncRouter(routes) {
  return routes.filter(route => {
    let component = route.component
    if (component) {
      switch (route.component) {
        case 'MenuView':
          route.component = MenuView
          break
        case 'PageView':
          route.component = PageView
          break
        case 'EmptyPageView':
          route.component = EmptyPageView
          break
        case 'HomePageView':
          route.component = HomePageView
          break
        default:
          route.component = view(component)
      }
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children)
      }
      return true
    }
  })
}

function view(path) {
  return function(resolve) {
    import(`@/views/${path}.vue`).then(mod => {
      resolve(mod)
    })
  }
}

export default router
