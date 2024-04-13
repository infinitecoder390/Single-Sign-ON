export const ApplicationConstants = {
  LOG_DIRECTORY_PATH: '/var/tmp/logs',
  DEV_ENV: 'dev',
  ASIA_KOLKATA: 'Asia/Kolkata',
  DEFAULT_UNBLOCK_INTERVAL_IN_MINS: 1,
  OTP_BLOCK_INTERVAL_IN_MINS: 1,
  SUBMIT_OTP_ATTEMPT_ALLOWED: 3,
  GET_RESEND_ALLOWED: 3,
  INDIA_COUNTRY_CODE: '+91',
};
export const whitelistedCountryCodes = [
  ApplicationConstants.INDIA_COUNTRY_CODE,
];
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

export const ROLES_FOR_WHICH_LOGIN_IS_NOT_ALLOWED = ['Helper'];
