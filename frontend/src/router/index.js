import { createRouter, createWebHistory } from "vue-router";
import NotFoundView from "../views/NotFoundView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/callback",
      name: "callback",
      component: () => import("../views/CallbackView.vue"),
    },
    {
      path: "/",
      redirect: { name: "department" },
    },
    {
      path: "/test",
      name: "test",
      component: () => import("../views/TestView.vue"),
      meta: { requiresAuth: true }, // add meta field to specify the route requires authentication
    },
    {
        path: "/department",
        name: "department",
        component: () => import("../views/DepartmentView.vue"),
        meta: { requiresAuth: true }, // add meta field to specify the route requires authentication
    },
    {
        path: "/municipality",
        name: "municipality",
        component: () => import("../views/MunicipalityView.vue"),
        meta: { requiresAuth: true },
    },
    {
        path: "/zone",
        name: "zone",
        component: () => import("../views/ZoneView.vue"),
        meta: { requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: NotFoundView,
    },
  ],
});

// add a global beforeEnter guard to check if the route requires authentication and if the user has an access token
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !hasAccessToken()) {
    next("/login");
  } else {
    next();
  }
});

// helper function to check if the user has an access token
function hasAccessToken() {
  const token = localStorage.getItem("access_token");
  return token !== null && token !== undefined;
}

export default router;
