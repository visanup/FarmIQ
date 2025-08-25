// Customer-Aware Page Header Component
import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Alert,
  AlertTitle,
  Button,
} from '@mui/material';
import { useDashboard } from '../../contexts/DashboardContext';

interface CustomerAwarePageHeaderProps {
  title: string;
  subtitle: string;
  actionButton?: React.ReactNode;
  showCustomerFilter?: boolean;
  noDataMessage?: string;
  children?: React.ReactNode;
}

const CustomerAwarePageHeader: React.FC<CustomerAwarePageHeaderProps> = ({
  title,
  subtitle,
  actionButton,
  showCustomerFilter = true,
  noDataMessage,
  children
}) => {
  const { state } = useDashboard();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {title}
            {showCustomerFilter && state.currentCustomer && !state.isAdmin && (
              <Chip 
                label={`ลูกค้า: ${state.currentCustomer.name}`}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ ml: 2 }}
              />
            )}
            {showCustomerFilter && state.isAdmin && (
              <Chip 
                label="ผู้ดูแลระบบ - แสดงข้อมูลทั้งหมด"
                color="warning"
                variant="filled"
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
        {actionButton && (
          <Box>
            {actionButton}
          </Box>
        )}
      </Box>

      {/* No access message */}
      {showCustomerFilter && !state.currentCustomer && !state.isAdmin && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>ไม่สามารถเข้าถึงข้อมูลได้</AlertTitle>
          กรุณาเข้าสู่ระบบเพื่อดูข้อมูลของคุณ
        </Alert>
      )}

      {/* No data message */}
      {showCustomerFilter && state.currentCustomer && noDataMessage && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>ไม่พบข้อมูล</AlertTitle>
          {noDataMessage}
        </Alert>
      )}

      {/* Additional content */}
      {children}
    </Box>
  );
};

export default CustomerAwarePageHeader;