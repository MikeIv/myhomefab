export default defineEventHandler(() => {
  const runtimeConfig = useRuntimeConfig();
  return {
    version:
      runtimeConfig.public.appVersion ||
      runtimeConfig.APP_VERSION ||
      Date.now().toString(),
    buildTime:
      runtimeConfig.public.buildTime ||
      runtimeConfig.BUILD_TIME ||
      new Date().toISOString(),
  };
});
