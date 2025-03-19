const domainArray = [
  "portal.connectmazjid.com",
  "main-admin-portal.connectmazjid.com",
];
const getAPIRootDomain = (prodAPI: string, defaultAPI: string) => {
  const hostname = window.location.hostname;
  if (domainArray.includes(hostname)) {
    return prodAPI;
  }
  return defaultAPI;
};

export const getClientAPIRootDomain = () => {
  const prodAPI = import.meta.env.VITE_CLIENT_BASE_URL;
  return getAPIRootDomain(prodAPI, "https://dev.api.connectmazjid.com/api/v2");
};

export const getAdminAPIRootDomain = () => {
  const prodAPI = import.meta.env.VITE_ADMIN_BASE_URL;
  return getAPIRootDomain(
    prodAPI,
    "https://dev.admin.api.connectmazjid.com/api/v2"
  );
};

export const getAdminAPIV3RootDomain = () => {
  const prodAPI = import.meta.env.VITE_REST_BASE_URL_V3;
  return getAPIRootDomain(prodAPI, "https://rest.staging.connectmazjid.com/v3");
};

export const getAdminAPIshareDomain = () => {
  const prodAPI = import.meta.env.VITE_SHARE_URL;
  return getAPIRootDomain(prodAPI, "https://rest.staging.connectmazjid.com");
};
