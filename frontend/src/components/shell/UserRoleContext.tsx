'use client';

import React, { createContext, useContext, useState } from 'react';
import { Permission, DefaultRole } from '@school-cms/common';

interface UserRoleContextType {
  currentRole: string;
  setRole: (role: string) => void;
  userPermissions: string[];
  isAdmin: boolean;
}

const rolePermissionsMap: Record<string, string[]> = {
  [DefaultRole.INSTITUTE_ADMIN]: Object.values(Permission),
  [DefaultRole.PRINCIPAL]: [
    Permission.STUDENTS_VIEW,
    Permission.STUDENTS_CREATE,
    Permission.STUDENTS_EDIT,
    Permission.STAFF_VIEW,
    Permission.ATTENDANCE_VIEW,
    Permission.ATTENDANCE_MARK,
    Permission.FEES_VIEW,
    Permission.EXAMS_MANAGE,
    Permission.MARKS_ENTER,
    Permission.RESULTS_PUBLISH,
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT,
  ],
  [DefaultRole.TEACHER]: [
    Permission.STUDENTS_VIEW,
    Permission.ATTENDANCE_VIEW,
    Permission.ATTENDANCE_MARK,
    Permission.EXAMS_MANAGE,
    Permission.MARKS_ENTER,
    Permission.REPORTS_VIEW,
  ],
  [DefaultRole.ACCOUNTANT]: [
    Permission.STUDENTS_VIEW,
    Permission.FEES_VIEW,
    Permission.FEES_RECEIVE,
    Permission.FEES_ADJUST,
    Permission.FEES_EXPORT,
    Permission.FINANCE_VIEW,
    Permission.FINANCE_MANAGE,
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT,
  ],
};

const UserRoleContext = createContext<UserRoleContextType>({
  currentRole: DefaultRole.INSTITUTE_ADMIN,
  setRole: () => {},
  userPermissions: Object.values(Permission),
  isAdmin: true,
});

export const UserRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<string>(DefaultRole.INSTITUTE_ADMIN);

  const userPermissions = rolePermissionsMap[currentRole] || Object.values(Permission);
  const isAdmin = currentRole === DefaultRole.INSTITUTE_ADMIN;

  return (
    <UserRoleContext.Provider
      value={{
        currentRole,
        setRole: setCurrentRole,
        userPermissions,
        isAdmin,
      }}
    >
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => useContext(UserRoleContext);
