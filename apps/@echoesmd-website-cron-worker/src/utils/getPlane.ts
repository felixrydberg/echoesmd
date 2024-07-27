import { Label, Issue, State, Response } from "../types";

export const getPlane = async (key: string) => {
  const options = {method: 'GET', headers: {'x-api-key': key}};
  const base = 'https://plane.240284308.xyz/api/v1/workspaces/loki/projects/b5cd9845-5399-407b-bb27-d2cb90805458/';
  const urls = ['labels', 'issues', 'states'].map((url) => `${base}${url}`);
  const promises = urls.map((url) => fetch(url, options));
  const responses = await Promise.all(promises);
  const results = await Promise.all(responses.map((response) => response.json())) as [
    Response<Label>,
    Response<Issue>,
    Response<State>
  ];

  if (results.some((result) => result.detail === "Given API token is not valid")) {
    throw new Error("Invalid API key");
  }

  return results;
}