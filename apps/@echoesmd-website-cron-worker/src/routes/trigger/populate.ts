import { Route } from "../../types";
import { getPlane, insertPlane } from "../../utils";

export const populate: Route = {
  get: async (request, env) => {
    console.log(env)
    const results = await getPlane(env.PLANE_API_KEY);
    await insertPlane(env.d1, results);
    return new Response("Populated", {
      status: 200,
      headers: {
        "content-type": "text/plain"
      }
    });
  }
};
