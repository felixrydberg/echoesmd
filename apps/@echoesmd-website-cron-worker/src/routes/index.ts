import { Route } from "../types";
import { issues } from "./issues";
import { populate } from "./trigger/populate";

const router: {[key: string]: Route} = {}

const register = (name: string, route: Route) => {
  router[`/${name}`] = route;
}

register('issues', issues);
register('trigger/populate', populate);
export {
  router
};
