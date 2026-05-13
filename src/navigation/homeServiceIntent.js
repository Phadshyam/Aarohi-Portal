// src/navigation/homeServiceIntent.js
/**
 * React Router `location.state` contract between Header and HomePage.
 * When set, Home scrolls to #services (via hash) and opens ServiceDetailsModal for that id.
 */
export const HOME_OPEN_SERVICE_ID = 'openServiceId'

/** @param {string | number} serviceId */
export function homeOpenServiceLocation(serviceId) {
  return {
    pathname: '/',
    hash: 'services',
    state: { [HOME_OPEN_SERVICE_ID]: serviceId },
  }
}
