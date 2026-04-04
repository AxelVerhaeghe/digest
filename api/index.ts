import { getMinifluxConfig } from "./config";
import { MinifluxClient } from "./miniflux";

const config = getMinifluxConfig();

export const api = new MinifluxClient({
  baseUrl: config.baseUrl,
  token: config.token,
});
