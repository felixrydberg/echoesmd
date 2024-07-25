import { Hono } from 'hono'
import {
  getCookie,
  getSignedCookie,
  setCookie,
  setSignedCookie,
  deleteCookie,
} from 'hono/cookie'
import { options } from "./utils/options";

const production = process.env.NODE_ENV === 'production';
const app = new Hono();
// Register routes

app.post('/test', (c) => {
  setCookie(c, 'jwt-post', 'POST VALUE', {
    maxAge: 34560000,
    httpOnly: true,
    sameSite: production ? "none" : "lax", 
    secure: production
  });
  return c.html('<h1>Cookie has been sent with the response</h1>');
});
app.get('/test', (c) => {
  setCookie(c, 'jwt-get', 'GET VALUE', {
    maxAge: 34560000,
    httpOnly: true,
    sameSite: production ? "none" : "lax", 
    secure: production
  });
  return c.html('<h1>Cookie has been sent with the response</h1>');
});

export default {
  port: options.hono.port,
  fetch: app.fetch,
}
