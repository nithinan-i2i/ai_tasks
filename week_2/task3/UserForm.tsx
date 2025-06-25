import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Field } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import { ReactComponent as BinIcon } from '../../assets/images/bin.svg';
import { ReactComponent as PlusIcon } from '../../assets/images/plus_blue.svg';
import { ReactComponent as ResetIcon } from '../../assets/images/reset.svg';
import APPCONSTANTS, { ADMIN_BASED_ON_URL, NAMING_VARIABLES } from '../../constants/appConstants';
import { hf4ReportUser, INSIGHTS, peerSupervisor, REPORTS, SPICE } from '../../constants/roleConstants';
import { IMatchParams } from '../../containers/user/UserList';
import useAppTypeConfigs from '../../hooks/appTypeBasedConfigs';
import { useRoleMeta } from '../../hooks/roleHook';
import { useRoleOptions } from '../../hooks/roleOptionsHook';
import { REGION_ADMIN, REPORT_ADMIN, SUPER_ADMIN, SUPER_USER } from '../../routes';
import { clearChiefdomList, fetchChiefdomListRequest } from '../../store/chiefdom/actions';
import { chiefdomListSelector, chiefdomLoadingSelector } from '../../store/chiefdom/selectors';
import { clearDistrictList, fetchDistrictListRequest } from '../../store/district/actions';
import { districtLoadingSelector, getDistrictListSelector } from '../../store/district/selectors';
import {
  clearAssignedHFListForHFAdmin,
  clearHFList,
  clearSupervisorList,
  clearVillageHFList,
  fetchCountryListRequest,
  fetchHFListRequest,
  fetchPeerSupervisorListRequest,
  fetchVillagesListUserLinked
} from '../../store/healthFacility/actions';
import {
  assignedHFListForHFAdminSelector,
  countryListSelector,
  countryLoadingSelector,
  healthFacilityListSelector,
  healthFacilityLoadingSelector,
  peerSupervisorListSelector,
  peerSupervisorLoadingSelector,
  villagesFromHFListSelector,
  villagesFromHFLoadingSelector
} from '../../store/healthFacility/selectors';
import { IHealthFacility, IPeerSupervisor, IVillages } from '../../store/healthFacility/types';
import {
  clearDesignationList,
  fetchCommunityListRequest,
  fetchCultureListRequest,
  fetchDesignationListRequest,
  fetchUserRolesAction
} from '../../store/user/actions';
import {
  communityListSelector,
  cultureListLoadingSelector,
  cultureListSelector,
  designationListSelector,
  isUserRolesLoading,
  roleSelector,
  userRolesSelector
} from '../../store/user/selectors';
import { IRoles, IUser, IUserFormProps } from '../../store/user/types';
import { formatCountryCode, formatUserToastMsg, removeRedRiskFromRoleArray } from '../../utils/commonUtils';
import toastCenter, { getErrorToastArgs } from '../../utils/toastCenter';
import {
  composeValidators,
  convertToNumber,
  required,
  validateCountryCode,
  validateLastName,
  validateName
} from '../../utils/validation';
import EmailField from '../formFields/EmailField';
import PhoneNumberField from '../formFields/PhoneNumber';
import Radio from '../formFields/Radio';
import SelectInput from '../formFields/SelectInput';
import TextInput from '../formFields/TextInput';
import MultiSelect from '../multiSelect/MultiSelect';
import { SiteUserForm } from './userConditionalFields/AdminFields';
import { DynamicCHForm } from './userConditionalFields/DynamicCHForm';
import useUserFormUtils, { filterRolesByAppTypeFn } from './userFormUtils';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { userFormSchema, UserFormValues } from './validation/userFormSchema';
import { sanitizeUserInput } from './utils/sanitize';
import { useUserFormLogic } from './hooks/useUserFormLogic';
import { TextField, MenuItem } from '@mui/material';
import { showErrorToast } from './utils/toastUtils';

export interface IUserFormValues {
  email: string;
  firstName: string;
  lastName: string;
  countryCode: string | { phoneNumberCode: string; id: string };
  username: string;
  phoneNumber: string;
  timezone: { id: string; description: string };
  gender: string;
  country: { countryCode: string };
  isHF?: boolean;
  isPeerSupervisor?: boolean;
}

export interface IDisabledRoles {
  [key: string]: IRoles[];
}

export type ModuleNames = 'region' | 'district' | 'chiefdom' | 'health-facility';

/**
 * UserForm component for creating or editing a user.
 * @component
 * @param {object} props - Component props
 * @param {boolean} [props.isEdit=false] - Whether the form is in edit mode
 * @param {UserFormValues} [props.initialValues] - Initial values for editing
 * @returns {JSX.Element}
 */
export const UserForm: React.FC<{
  isEdit?: boolean;
  initialValues?: UserFormValues;
}> = ({ isEdit = false, initialValues }) => {
  const dispatch = useDispatch();
  const { roles, countries, loading } = useUserFormLogic();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormValues>({
    resolver: yupResolver(userFormSchema),
    defaultValues: initialValues,
  });

  /**
   * Handles form submission.
   * @param {UserFormValues} data - The form data
   */
  const onSubmit: SubmitHandler<UserFormValues> = async (data) => {
    try {
      // Sanitize user input before dispatching
      const sanitizedData = sanitizeUserInput(data);
      if (isEdit) {
        await dispatch(updateUser(sanitizedData));
      } else {
        await dispatch(createUser(sanitizedData));
      }
      reset();
    } catch (error) {
      showErrorToast(error, 'Failed to submit user form');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* First Name */}
      <Controller
        name="firstName"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="First Name"
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
            fullWidth
            required
          />
        )}
      />
      {/* Last Name */}
      <Controller
        name="lastName"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Last Name"
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
            fullWidth
            required
          />
        )}
      />
      {/* Email */}
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Email"
            error={!!errors.email}
            helperText={errors.email?.message}
            fullWidth
            required
            type="email"
          />
        )}
      />
      {/* Role */}
      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Role"
            error={!!errors.role}
            helperText={errors.role?.message}
            fullWidth
            required
            select
          >
            <MenuItem value="">Select a role</MenuItem>
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.displayName}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      {/* Country */}
      <Controller
        name="country"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Country"
            error={!!errors.country}
            helperText={errors.country?.message}
            fullWidth
            required
            select
          >
            <MenuItem value="">Select a country</MenuItem>
            {countries.map((country) => (
              <MenuItem key={country.id} value={country.id}>
                {country.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      {/* Add more fields as needed */}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={isSubmitting}
        sx={{ mt: 2 }}
      >
        {isEdit ? 'Update User' : 'Create User'}
      </Button>
    </form>
  );
};

export default UserForm;
