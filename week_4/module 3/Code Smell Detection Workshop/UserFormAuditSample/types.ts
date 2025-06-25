// =================== Types ===================

/**
 * @typedef {object} IEntity
 * @property {number} id - The unique identifier for the entity.
 * @property {string} name - The name of the entity.
 */
export type IEntity = {
	id: number;
	name: string;
};

/**
 * @typedef {object} IVillage
 * @property {number} id - The unique identifier for the village.
 * @property {string} name - The name of the village.
 */
export type IVillage = IEntity;

/**
 * @typedef {object} ICulture
 * @property {number} id - The unique identifier for the culture.
 * @property {string} name - The name of the culture.
 */
export type ICulture = IEntity;

/**
 * @typedef {object} IDesignation
 * @property {number} id - The unique identifier for the designation.
 * @property {string} name - The name of the designation.
 */
export type IDesignation = IEntity;

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CHW = 'CHW',
  CHP = 'CHP',
  SPICE = 'SPICE'
}

/**
 * @typedef {object} IRoles
 * @property {string} name - The name of the role (e.g., 'CHP', 'SUPER_ADMIN').
 * @property {string} [suiteAccessName] - Optional name for suite access.
 * @property {string} [groupName] - Optional group name associated with the role.
 */
export type IRoles = {
  name: UserRole;
  suiteAccessName?: string;
  groupName?: string;
};

/**
 * @typedef {object} IUser
 * @description Represents a user in the system with all associated details.
 * @property {string} id - The unique identifier for the user.
 * @property {string} firstName - The user's first name.
 * @property {string} lastName - The user's last name.
 * @property {string} email - The user's email address.
 * @property {string} phoneNumber - The user's phone number.
 * @property {string} countryCode - The country code for the phone number.
 * @property {string} gender - The user's gender.
 * @property {IRoles[]} roles - An array of roles assigned to the user.
 * @property {object[]} organizations - An array of organizations the user belongs to.
 * @property {string} [supervisor] - The ID of the user's supervisor, if any.
 * @property {IVillage[]} [villages] - Optional list of villages.
 * @property {object} [timezone] - The user's timezone information.
 * @property {ICulture} [culture] - Optional culture information.
 * @property {IDesignation} [designation] - Optional designation information.
 * @property {string} [userUnitId] - Optional user unit ID.
 */
export type IUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  gender: string;
  roles: IRoles[];
  organizations: {
    id: number;
    name: string;
    formName: string;
    tenantId: number;
  }[];
  supervisor?: string;
  villages?: IVillage[];
  timezone?: { id: string; description: string };
  culture?: ICulture;
  designation?: IDesignation;
  userUnitId?: string;
};

/**
 * @typedef {object} AutoPopulateOptions
 * @description Options to configure the behavior of the auto-population logic.
 * @property {boolean} [skipValidation] - If true, skips role validation checks.
 */
export type AutoPopulateOptions = {
  skipValidation?: boolean;
}; 