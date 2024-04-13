export const ApplicationConstants = {
  ATRegenerateExecutionTimeWindow: 3000,
  ASIA_KOLKATA: 'Asia/Kolkata',
  LOG_DIRECTORY_PATH: '/var/tmp/logs',
  DEV_ENV: 'dev',
  STRING: 'string',
  SEPARATOR_SYMBOL: ':-',
  PROD_ENVIRONMENT_KEY: 'prod',
  UNDEFINED_STRING: 'undefined',
  TRUE_STRING: 'true',
};

export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  ERROR: 'error',
};

export const DbType = {
  GIGA_PROFILE: 'giga-profile',
};

export const PlatFormName = {
  DXP: 'DXP',
};

export const userGroupPermissions = {
  name: 'SXP-PATNER',
  permissions: ['1c212830-5116-466e-9f76-6cfb4c06524e'],
  permissionSet: [
    {
      _id: '1c212830-5116-466e-9f76-6cfb4c06524e',
      permissionName: 'SXP_PATNER',
      clientName: 'TCG-SERVICE-COM-PARTNER-ANDROID-APP',
      scope: ['ALL::.*/api/medusa/.*', 'ALL::.*/api/giga-profile/.*'],
      __v: 0,
    },
  ],
  isActive: true,
  orgId: 'SXP',
  __v: 0,
};
