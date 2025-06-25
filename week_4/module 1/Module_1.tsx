/**
   * Resets the admin form fields at a given index to their initial state.
   *
   * This function is used to clear and reset all fields for a specific admin user form entry,
   * restoring them to their default values. It also handles special cases for admin forms and
   * health facility creation, ensuring that default roles and suite access are set as needed.
   * Additionally, it resets disabled roles and updates the auto-fetched state.
   *
   * @param fields - The FieldArray fields object from react-final-form-arrays, used to update the form array.
   * @param index - The index of the form entry to reset.
   *
   * @returns void
   *
   * @example
   * // Reset the first admin form entry
   * resetAdminForm(fields, 0);
   *
   * // Usage in a reset button handler
   * <button onClick={() => resetAdminForm(fields, index)}>Reset</button>
   *
   * @throws No explicit errors are thrown, but the function expects:
   *   - `fields` to be a valid FieldArray fields object
   *   - `index` to be a valid index within the form array
   *
   * @remarks
   * - The function uses form mutators to reset fields and updates the form array with initial values.
   * - If the form is an admin form or a health facility creation, it sets default roles and suite access.
   * - Disabled roles and auto-fetched state are also reset for the given index.
   * - Performance: Uses shallow copies and direct updates for efficiency.
   */
const resetAdminForm = useCallback(
  (fields: any, index: number) => {
    // Reset the form fields using the form mutator
    form.mutators?.resetFields?.(`${formName}[${index}]`);

    // Update the fields with the initial values
    fields.update(index, { ...initialValue[0] });

    // Handle special cases for admin form or health facility creation
    if ((isAdminForm && defaultSelectedRole) || isHFCreate) {
      const suiteAccess = getSuiteAccessList(appTypeBasedRoles);
      const defaultAdminSelected = appTypeBasedRoles.SPICE?.find(
        (spiceRole: IRoles) => spiceRole.name === defaultSelectedRole
      );
      fields.update(index, {
        ...form.getState().values?.users[index],
        role: isAdminForm && defaultSelectedRole ? [defaultAdminSelected] : [],
        roles: isAdminForm && defaultSelectedRole ? [defaultAdminSelected] : [],
        suiteAccess: defaultSelectedRole ? [getSpiceGroupName(suiteAccess)] : [],
        countryCode:
          form.getState()?.values?.region?.phoneNumberCode?.length &&
          !form?.getState()?.errors?.region?.phoneNumberCode
            ? form.getState()?.values?.region?.phoneNumberCode
            : undefined
      });
    }

    // Reset disabled roles
    disabledRoles.current = [];

    // Update auto-fetched state
    const newAutoFetched = [...autoFetched];
    newAutoFetched[index] = false;
    setAutoFetched(newAutoFetched);
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [form, initialValue, isAdminForm, defaultSelectedRole, autoFetched, appTypeBasedRoles.SPICE]
);


/**
   * Populates the user form fields with data from an existing user object.
   *
   * This function orchestrates the process of populating the form with user data, handling special cases
   * (such as super/admin roles and CHP/CHW users), updating form state, triggering side effects, and
   * fetching additional lists if required. It is typically used when an existing user is selected or
   * auto-populated in the form (e.g., via email lookup).
   *
   * @param user - The user object containing data to populate the form. Should conform to the IUser interface.
   * @param index - The index of the user in the form array to update.
   *
   * @returns void
   *
   * @example
   * // Usage in a form field (e.g., EmailField)
   * <EmailField
   *   onFindExistingUser={(user) => autoPopulateUserData(user, index)}
   *   ...
   * />
   *
   * // Direct usage
   * autoPopulateUserData(existingUser, 0);
   *
   * @throws No explicit errors are thrown, but the function will return early if:
   *   - The user object is not valid (null or not an object)
   *   - The user has a special role (SUPER_ADMIN, SUPER_USER, REPORT_ADMIN)
   *   - The user is a CHP/CHW and isHFCreate is true
   *
   * @remarks
   * - This function updates form state in a batch for performance.
   * - It also updates local state and triggers role-based side effects.
   * - If the user is a CHP/CHW, it will fetch additional lists (villages, supervisors).
   * - Defensive checks are in place for all array/object accesses.
   */
const autoPopulateUserData = (user: IUser, index: number) => {
  if (!user || typeof user !== 'object') return;
  const roles: IRole[] = Array.isArray(user.roles) ? user.roles : [];
  const organizations: IOrganization[] = Array.isArray(user.organizations) ? user.organizations : [];

  // 1. Special role check
  if (hasSpecialRole(roles, [SUPER_ADMIN, SUPER_USER, REPORT_ADMIN])) {
    emailDisabledFn(APPCONSTANTS.SUPER_ADMIN_USER_EXCEPTION_HF_CREATE.replace('Super', 'Super/Report'), index);
    return;
  }
  // 2. CHP/CHW and HF create check
  if (isChpChwAndHFCreate(roles, isHFCreate, isCHPCHWSelected)) {
    emailDisabledFn(APPCONSTANTS.CHP_USER_EXCEPTION_HF_CREATE, index);
    return;
  }
  // 3. Prepare user data
  const userData = prepareUserData(user, formUserData, NAMING_VARIABLES, APPCONSTANTS);
  // 4. Optionally update health facility lists
  if (showSpiceHFRef.current[index]) {
    const fullRoles = form.getState().values[`${formName}[${index}].roles`];
    const selectedAppTypes = roleBasedAppTypes(fullRoles);
    getHFLists(selectedAppTypes);
  }
  // 5. Update form fields
  updateFormFields({
    form,
    formName,
    index,
    userData,
    roles,
    isCommunity
  });
  // 6. Update local state and refs
  setClearEmail(false);
  const updatedAutoFetched = [...autoFetched];
  updatedAutoFetched[index] = true;
  setAutoFetched(updatedAutoFetched);
  fetchedData.current = [...fetchedData.current.slice(0, index), userData, ...fetchedData.current.slice(index + 1)];
  // 7. Update role options and trigger side effects
  getRoleOptions(index, roles);
  roleChange({ allRoles: roles, index, appTypeBasedRoles });
  // 8. Fetch additional lists if needed
  if (isCHPCHWSelected(roles)) {
    const tenantIds = [...organizations.map((v: IOrganization) => v.id), hfTenantId].filter(Boolean).map(Number);
    if (userData.id) {
      fetchListWithConditions(tenantIds, userData.id, 'village', index);
      fetchListWithConditions(tenantIds, userData.id, 'supervisor', index);
    }
  }
};



/**
   * Fetches either the village list or supervisor list for a user, based on provided conditions.
   *
   * This utility function determines which list to fetch (villages or supervisors) for a user,
   * based on the `name` parameter. It ensures that tenant IDs are unique and non-empty before
   * dispatching the appropriate fetch action. Used to dynamically update form options based on
   * user role and organization context.
   *
   * @param tenantIds - An array of tenant IDs (numbers) to use for fetching the list.
   * @param userId - The user ID (string) for whom the list is being fetched.
   * @param name - The type of list to fetch: either 'village' or 'supervisor'.
   * @param index - The index of the user/form entry for which the list is being fetched.
   *
   * @returns void
   *
   * @example
   * // Fetch villages for user 123 at form index 0
   * fetchListWithConditions([1, 2, 3], '123', 'village', 0);
   *
   * // Fetch supervisors for user 456 at form index 1
   * fetchListWithConditions([4, 5], '456', 'supervisor', 1);
   *
   * @throws No explicit errors are thrown, but the function expects:
   *   - `tenantIds` to be a non-empty array of numbers
   *   - `userId` to be a valid string
   *   - `name` to be either 'village' or 'supervisor'
   *
   * @remarks
   * - If `tenantIds` is empty, the function does nothing.
   * - Uses Set to ensure tenant IDs are unique.
   * - Relies on fetchVillagesList and fetchSupervisorList for actual data fetching.
   * - Performance: Only dispatches fetch actions if conditions are met.
   */
const fetchListWithConditions = (tenantIds: number[] = [], userId: string, name: string, index: number) => {
  if (tenantIds.length) {
    if (name === 'village') {
      return fetchVillagesList([...new Set(tenantIds)], userId, index);
    } else {
      return fetchSupervisorList([...new Set(tenantIds)], index);
    }
  }
};