// src/components/layout/Sidebar.tsx
import React from "react";
import {
  Drawer,
  Toolbar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Tooltip,
  useMediaQuery,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { styled, CSSObject, Theme } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DevicesIcon from "@mui/icons-material/Devices";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import { NavLink, useLocation } from "react-router-dom";  // <-- เพิ่ม import นี้

const drawerWidth = 240;
// Sidebar will sit below AppBar: account for AppBar height
const appBarHeight = 64; // or import from theme.mixins.toolbar.minHeight

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  overflowX: "hidden",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[4],
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  height: "100vh", // เต็มความสูงหน้าจอ
  position: "relative", // เพื่อให้ปุ่ม Close absolute อยู่ภายใน
});

const closedMixin = (theme: Theme): CSSObject => ({
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[1],
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  height: "100vh",
  position: "relative",
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open: boolean }>(({ theme, open }) => ({
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  flexShrink: 0,
  ...(open
    ? {
      ...openedMixin(theme),
      "& .MuiDrawer-paper": openedMixin(theme),
    }
    : {
      ...closedMixin(theme),
      "& .MuiDrawer-paper": closedMixin(theme),
    }),
}));

const ListItemButtonStyled = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 1),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  transition: theme.transitions.create(["background-color", "color"], {
    duration: theme.transitions.duration.shortest,
  }),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.primary.main,
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.main,
    },
  },
  "&.Mui-selected": {
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.main,
    },
  },
  "&.Mui-selected:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));

const navItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
  { text: "Devices", icon: <DevicesIcon />, path: "/devices" },
  { text: "Alerts", icon: <NotificationsIcon />, path: "/alerts" },
  { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

// สำหรับเดโม สมมติว่าเลือกเมนู Dashboard อยู่ (แนะนำเปลี่ยนเป็น state หรือ router path จริง)
const selectedIndex = 0;

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const isSmUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("sm"));
  const location = useLocation();

  return (
    <StyledDrawer variant={isSmUp ? "permanent" : "temporary"} open={open} onClose={onClose}>
      {/* Logo Section */}
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "flex-start" : "center",
          px: 2,
          height: 64,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: (theme) => theme.palette.background.default,
          cursor: "pointer",
          userSelect: "none",
          flexShrink: 0,
        }}
        role="button"
        tabIndex={0}
        onClick={() => {
          console.log("Logo clicked");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            console.log("Logo clicked");
          }
        }}
      >
        <Box
          component="img"
          src="/Logo-BTG.png" // เปลี่ยนเป็น path โลโก้ของคุณ
          alt="Logo"
          sx={{
            height: 75,
            width: open ? "auto" : 40,
            transition: "width 0.3s ease",
            display: "block", // ป้องกัน default inline spacing
            marginLeft: open ? 18 : "auto", // เวลาปิดเลื่อนขวา
            marginRight: open ? 0 : "auto", // เวลาปิดเลื่อนขวา
          }}
        />
        {open && (
          <Typography
            variant="h6"
            noWrap
            sx={{
              ml: 2,
              fontWeight: "bold",
              color: "primary.main",
              userSelect: "none",
            }}
          ></Typography>
        )}
      </Toolbar>

      {/* Close Button - ตรงกลางกึ่งกลางแนวตั้ง และชิดขวา */}
      <IconButton
        onClick={onClose}
        size="medium"
        aria-label="Close sidebar"
        sx={{
          position: "absolute",
          top: "50%",
          right: 0,
          transform: "translate(50%, -50%)",
          width: 50,
          height: 50,
          bgcolor: (theme) => theme.palette.background.paper,
          borderRadius: "50%",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          color: (theme) => theme.palette.text.secondary,
          transition: "all 0.3s ease",
          "&:hover": {
            bgcolor: (theme) => theme.palette.primary.light,
            color: (theme) => theme.palette.primary.contrastText,
            boxShadow: "0 4px 12px rgba(33, 150, 243, 0.6)",
          },
          zIndex: 1300,
        }}
      >
        <ChevronLeftIcon fontSize="medium" />
      </IconButton>

      <Divider />

      {/* ... */}
      <List>
        {navItems.map(({ text, icon, path }) => (
          <Tooltip
            key={text}
            title={!open ? text : ""}
            placement="right"
            arrow
            disableHoverListener={open}
          >
            <ListItem disablePadding sx={{ justifyContent: open ? "initial" : "center", px: 1 }}>
              {/* ใส่ NavLink ครอบ ListItemButtonStyled */}
              <NavLink
                to={path}
                style={{ textDecoration: "none", width: "100%" }}
                onClick={() => { if (!isSmUp) onClose(); }}
                className={({ isActive }) => (isActive ? "Mui-selected" : "")}
              >
                <ListItemButtonStyled
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    width: "100%", // เต็มความกว้างให้คลิกง่าย
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                      color: location.pathname === path ? "primary.main" : "inherit",
                    }}
                  >
                    {icon}
                  </ListItemIcon>
                  {open && <ListItemText primary={text} />}
                </ListItemButtonStyled>
              </NavLink>
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </StyledDrawer>
  );
};

export default Sidebar;
